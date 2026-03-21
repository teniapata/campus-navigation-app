"use client";

import { IBuilding } from "@/models/interface/building.interface";
import { X, Navigation, MapPin, Clock, Footprints, LocateFixed, Loader2, Accessibility, Car, PersonStanding, Bus, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

export type TravelMode = "WALKING" | "DRIVING" | "TRANSIT";

interface DirectionStep {
  instruction: string;
  distance: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

interface GoogleDirectionsInfo {
  distance: string;
  duration: string;
  steps: DirectionStep[];
}

interface CustomLocation {
  name: string;
  lat: number;
  lng: number;
}

interface GoogleDirectionsPanelProps {
  fromBuilding: IBuilding | null;
  toBuilding: IBuilding | null;
  directionsInfo: GoogleDirectionsInfo | null;
  onCancel: () => void;
  onSelectFrom: () => void;
  onSelectTo: () => void;
  customFromLocation: CustomLocation | null;
  onSetCustomFromLocation: (location: CustomLocation | null) => void;
  accessibleRoute: boolean;
  onToggleAccessible: (value: boolean) => void;
  travelMode: TravelMode;
  onTravelModeChange: (mode: TravelMode) => void;
}

// Haversine distance in meters
function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function GoogleDirectionsPanel({
  fromBuilding,
  toBuilding,
  directionsInfo,
  onCancel,
  onSelectFrom,
  onSelectTo,
  customFromLocation,
  onSetCustomFromLocation,
  accessibleRoute,
  onToggleAccessible,
  travelMode,
  onTravelModeChange,
}: GoogleDirectionsPanelProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [showFromInput, setShowFromInput] = useState(false);
  const [fromInputValue, setFromInputValue] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Voice navigation state
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const spokenStepsRef = useRef<Set<number>>(new Set());
  const isVoiceActiveRef = useRef(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Keep ref in sync
  useEffect(() => {
    isVoiceActiveRef.current = isVoiceActive;
  }, [isVoiceActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Reset when directions change
  useEffect(() => {
    stopVoiceNavigation();
    setCurrentStepIndex(0);
    spokenStepsRef.current = new Set();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directionsInfo]);

  const speakWithState = useCallback(async (text: string) => {
    setIsSpeaking(true);
    await speak(text);
    setIsSpeaking(false);
  }, []);

  const stopVoiceNavigation = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsVoiceActive(false);
    setIsSpeaking(false);
    isVoiceActiveRef.current = false;
  }, []);

  const startVoiceNavigation = useCallback(() => {
    if (!directionsInfo || directionsInfo.steps.length === 0) return;
    if (!window.speechSynthesis) {
      alert("Voice navigation is not supported in your browser");
      return;
    }
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsVoiceActive(true);
    isVoiceActiveRef.current = true;
    setCurrentStepIndex(0);
    spokenStepsRef.current = new Set();

    // Announce start
    const summary = `Starting navigation. ${directionsInfo.distance}, estimated ${directionsInfo.duration}. ${directionsInfo.steps[0].instruction}`;
    speakWithState(summary);
    spokenStepsRef.current.add(0);

    // Watch user position and trigger voice at each step
    const TRIGGER_DISTANCE = 30; // meters - speak when within 30m of step start
    const ARRIVAL_DISTANCE = 20; // meters - consider step done when within 20m of step end

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (!isVoiceActiveRef.current || !directionsInfo) return;

        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Find the nearest upcoming step
        for (let i = 0; i < directionsInfo.steps.length; i++) {
          if (spokenStepsRef.current.has(i)) continue;

          const step = directionsInfo.steps[i];
          const distToStart = getDistanceMeters(userLat, userLng, step.startLat, step.startLng);

          if (distToStart <= TRIGGER_DISTANCE) {
            spokenStepsRef.current.add(i);
            setCurrentStepIndex(i);

            const text = step.distance
              ? `In ${step.distance}, ${step.instruction}`
              : step.instruction;
            speakWithState(text);
            break;
          }
        }

        // Check if user reached the final destination
        const lastStep = directionsInfo.steps[directionsInfo.steps.length - 1];
        const distToEnd = getDistanceMeters(userLat, userLng, lastStep.endLat, lastStep.endLng);
        if (distToEnd <= ARRIVAL_DISTANCE && spokenStepsRef.current.size === directionsInfo.steps.length) {
          speakWithState("You have arrived at your destination.");
          stopVoiceNavigation();
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        speakWithState("Unable to track your location. Voice navigation stopped.");
        stopVoiceNavigation();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );
  }, [directionsInfo, speakWithState, stopVoiceNavigation]);

  // Handle "Use My Location" button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSetCustomFromLocation({
          name: "My Location",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
        setShowFromInput(false);
        setFromInputValue("");
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please check permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        onSetCustomFromLocation({
          name: place.name || place.formatted_address || "Selected Location",
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setShowFromInput(false);
        setFromInputValue("");
      }
    }
  };

  const handleFromClick = () => {
    if (fromBuilding || customFromLocation) {
      onSelectFrom();
      onSetCustomFromLocation(null);
    }
    setShowFromInput(true);
  };

  const getFromDisplayName = () => {
    if (customFromLocation) return customFromLocation.name;
    if (fromBuilding) return fromBuilding.name;
    return null;
  };

  const fromName = getFromDisplayName();

  const travelModes: { id: TravelMode; label: string; icon: typeof Car }[] = [
    { id: "WALKING", label: "Walk", icon: PersonStanding },
    { id: "DRIVING", label: "Drive", icon: Car },
    { id: "TRANSIT", label: "Transit", icon: Bus },
  ];

  const getTravelTimeLabel = () => {
    switch (travelMode) {
      case "DRIVING": return "Drive time";
      case "TRANSIT": return "Transit time";
      default: return "Walking time";
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-30 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#1F7A4D]" />
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Directions</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { stopVoiceNavigation(); onCancel(); }}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Travel Mode Selector */}
      <div className="px-4 pt-3 flex-shrink-0">
        <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {travelModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = travelMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onTravelModeChange(mode.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#1F7A4D] text-white"
                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-750"
                }`}
              >
                <Icon className="w-4 h-4" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* From/To Selection */}
      <div className="p-4 space-y-3 flex-shrink-0">
        {showFromInput && isLoaded ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <Autocomplete
                onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                onPlaceChanged={onPlaceChanged}
                options={{
                  componentRestrictions: { country: "ng" },
                  fields: ["geometry", "name", "formatted_address"],
                }}
                className="flex-1"
              >
                <Input
                  placeholder="Enter starting point..."
                  value={fromInputValue}
                  onChange={(e) => setFromInputValue(e.target.value)}
                  autoFocus
                  className="w-full"
                />
              </Autocomplete>
              <Button variant="ghost" size="icon" onClick={() => setShowFromInput(false)} className="flex-shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 pl-10">
              <Button variant="outline" size="sm" onClick={handleUseMyLocation} disabled={isLocating} className="flex items-center gap-1.5">
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                {isLocating ? "Locating..." : "Use my location"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFromInput(false)}>
                Pick from map
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleFromClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-green-500 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              {customFromLocation?.name === "My Location" ? (
                <LocateFixed className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-green-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500">Starting point</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {fromName || "Enter location or click map..."}
              </p>
            </div>
          </button>
        )}

        <button
          onClick={onSelectTo}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-red-500 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500">Destination</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {toBuilding?.name || "Click a marker on the map..."}
            </p>
          </div>
        </button>

        <button
          onClick={() => onToggleAccessible(!accessibleRoute)}
          className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left text-sm ${
            accessibleRoute
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-neutral-200 dark:border-neutral-700 text-neutral-600 hover:border-neutral-300"
          }`}
        >
          <Accessibility className={`w-4 h-4 ${accessibleRoute ? "text-blue-600" : "text-neutral-400"}`} />
          <span>Wheelchair accessible route</span>
        </button>
      </div>

      {/* Route Info */}
      {directionsInfo && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 flex flex-col flex-1 overflow-hidden">
          {/* Summary */}
          <div className="p-4 bg-[#1F7A4D]/5 flex items-center justify-around flex-shrink-0">
            <div className="text-center">
              <div className="flex items-center gap-1 text-neutral-600">
                <Footprints className="w-4 h-4" />
                <span className="text-sm">Distance</span>
              </div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                {directionsInfo.distance}
              </p>
            </div>
            <div className="h-10 w-px bg-neutral-300" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-neutral-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{getTravelTimeLabel()}</span>
              </div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                {directionsInfo.duration}
              </p>
            </div>
          </div>

          {/* Voice Navigation Button */}
          <div className="px-4 pt-3 flex-shrink-0">
            <button
              onClick={isVoiceActive ? stopVoiceNavigation : startVoiceNavigation}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isVoiceActive
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-[#1F7A4D] hover:bg-[#196841] text-white"
              }`}
            >
              {isVoiceActive ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  Stop Navigation
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Start Navigation
                </>
              )}
            </button>
            {isVoiceActive && (
              <p className="text-xs text-center text-neutral-500 mt-1.5">
                Tracking your location. Directions will be spoken as you approach each turn.
              </p>
            )}
          </div>

          {/* Steps */}
          {directionsInfo.steps && directionsInfo.steps.length > 0 && (
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wide">
                Turn-by-turn directions
              </p>
              <div className="space-y-3">
                {directionsInfo.steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 rounded-lg p-2 -mx-2 transition-colors ${
                      isVoiceActive && currentStepIndex === index
                        ? "bg-[#1F7A4D]/10 ring-1 ring-[#1F7A4D]/30"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          isVoiceActive && currentStepIndex === index
                            ? "bg-[#1F7A4D] text-white scale-110"
                            : isVoiceActive && spokenStepsRef.current.has(index)
                            ? "bg-neutral-300 text-neutral-600"
                            : "bg-[#1F7A4D] text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < directionsInfo.steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-neutral-200 mt-1 min-h-[20px]" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={`text-sm leading-relaxed ${
                        isVoiceActive && currentStepIndex === index
                          ? "text-neutral-900 dark:text-neutral-100 font-medium"
                          : "text-neutral-700 dark:text-neutral-300"
                      }`}>
                        {step.instruction}
                      </p>
                      {step.distance && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {step.distance}
                        </p>
                      )}
                      {isVoiceActive && currentStepIndex === index && isSpeaking && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="flex gap-0.5">
                            <span className="w-1 h-3 bg-[#1F7A4D] rounded-full animate-pulse" />
                            <span className="w-1 h-4 bg-[#1F7A4D] rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                            <span className="w-1 h-2 bg-[#1F7A4D] rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                            <span className="w-1 h-3.5 bg-[#1F7A4D] rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                          </div>
                          <span className="text-xs text-[#1F7A4D] font-medium">Speaking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Waiting for selection */}
      {!directionsInfo && (fromBuilding || toBuilding || customFromLocation) && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 text-center text-sm text-neutral-500 flex-shrink-0">
          {!(fromBuilding || customFromLocation) && toBuilding
            ? "Enter your location or click a marker for starting point"
            : !toBuilding && (fromBuilding || customFromLocation)
            ? "Click a building marker to set your destination"
            : "Calculating route..."}
        </div>
      )}

      {/* Initial state */}
      {!fromBuilding && !toBuilding && !directionsInfo && !customFromLocation && (
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 text-center text-sm text-neutral-500 flex-shrink-0">
          Enter your starting point or click on building markers
        </div>
      )}
    </div>
  );
}
