"use client";

import { IBuilding } from "@/models/interface/building.interface";
import { X, Navigation, MapPin, Clock, Footprints, LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

interface GoogleDirectionsInfo {
  distance: string;
  duration: string;
  steps: { instruction: string; distance: string }[];
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
}: GoogleDirectionsPanelProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [showFromInput, setShowFromInput] = useState(false);
  const [fromInputValue, setFromInputValue] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

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

  // Handle place selection from autocomplete
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
      // Clear current selection
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

  return (
    <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg border border-neutral-200 z-30 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#1F7A4D]" />
          <h3 className="font-medium text-neutral-900">Directions</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* From/To Selection */}
      <div className="p-4 space-y-3 flex-shrink-0">
        {/* From Input/Button */}
        {showFromInput && isLoaded ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFromInput(false)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 pl-10">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="w-3.5 h-3.5" />
                )}
                {isLocating ? "Locating..." : "Use my location"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFromInput(false)}
              >
                Pick from map
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleFromClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-green-500 transition-colors text-left"
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
              <p className="text-sm font-medium text-neutral-900 truncate">
                {fromName || "Enter location or click map..."}
              </p>
            </div>
          </button>
        )}

        {/* To Button */}
        <button
          onClick={onSelectTo}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-red-500 transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500">Destination</p>
            <p className="text-sm font-medium text-neutral-900 truncate">
              {toBuilding?.name || "Click a marker on the map..."}
            </p>
          </div>
        </button>
      </div>

      {/* Route Info */}
      {directionsInfo && (
        <div className="border-t border-neutral-200 flex flex-col flex-1 overflow-hidden">
          {/* Summary */}
          <div className="p-4 bg-[#1F7A4D]/5 flex items-center justify-around flex-shrink-0">
            <div className="text-center">
              <div className="flex items-center gap-1 text-neutral-600">
                <Footprints className="w-4 h-4" />
                <span className="text-sm">Distance</span>
              </div>
              <p className="font-semibold text-neutral-900 text-lg">
                {directionsInfo.distance}
              </p>
            </div>
            <div className="h-10 w-px bg-neutral-300" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-neutral-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Walking time</span>
              </div>
              <p className="font-semibold text-neutral-900 text-lg">
                {directionsInfo.duration}
              </p>
            </div>
          </div>

          {/* Steps */}
          {directionsInfo.steps && directionsInfo.steps.length > 0 && (
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-xs font-medium text-neutral-500 mb-3 uppercase tracking-wide">
                Turn-by-turn directions
              </p>
              <div className="space-y-3">
                {directionsInfo.steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-7 h-7 rounded-full bg-[#1F7A4D] text-white flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      {index < directionsInfo.steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-neutral-200 mt-1 min-h-[20px]" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-sm text-neutral-700 leading-relaxed">
                        {step.instruction}
                      </p>
                      {step.distance && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {step.distance}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Waiting for selection message */}
      {!directionsInfo && (fromBuilding || toBuilding || customFromLocation) && (
        <div className="p-4 border-t border-neutral-200 text-center text-sm text-neutral-500 flex-shrink-0">
          {!(fromBuilding || customFromLocation) && toBuilding
            ? "Enter your location or click a marker for starting point"
            : !toBuilding && (fromBuilding || customFromLocation)
            ? "Click a building marker to set your destination"
            : "Calculating route..."}
        </div>
      )}

      {/* Initial state */}
      {!fromBuilding && !toBuilding && !directionsInfo && !customFromLocation && (
        <div className="p-4 border-t border-neutral-200 text-center text-sm text-neutral-500 flex-shrink-0">
          Enter your starting point or click on building markers
        </div>
      )}
    </div>
  );
}
