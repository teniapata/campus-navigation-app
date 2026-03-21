"use client";

import { useCallback, useState, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import { IBuilding } from "@/models/interface/building.interface";
import { Loader2 } from "lucide-react";

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

// Covenant University center coordinates
const CU_CENTER = {
  lat: 6.6735,
  lng: 3.158,
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi.school",
      stylers: [{ visibility: "on" }],
    },
  ],
};

interface CustomLocation {
  name: string;
  lat: number;
  lng: number;
}

interface GoogleMapViewProps {
  buildings: IBuilding[];
  selectedBuilding?: IBuilding | null;
  onSelectBuilding: (building: IBuilding) => void;
  fromBuilding: IBuilding | null;
  toBuilding: IBuilding | null;
  navigationMode: boolean;
  onDirectionsCalculated?: (result: google.maps.DirectionsResult) => void;
  customFromLocation?: CustomLocation | null;
  travelMode?: string;
}

export function GoogleMapView({
  buildings,
  onSelectBuilding,
  fromBuilding,
  toBuilding,
  navigationMode,
  onDirectionsCalculated,
  customFromLocation,
  travelMode = "WALKING",
}: GoogleMapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [infoWindowBuilding, setInfoWindowBuilding] = useState<IBuilding | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calculate directions when origin and destination are set
  useEffect(() => {
    if (!isLoaded || !map) return;

    // Determine origin (either custom location or from building)
    let origin: google.maps.LatLngLiteral | null = null;

    if (customFromLocation) {
      origin = {
        lat: customFromLocation.lat,
        lng: customFromLocation.lng,
      };
    } else if (fromBuilding) {
      origin = {
        lat: fromBuilding.geoCoordinates?.lat || CU_CENTER.lat,
        lng: fromBuilding.geoCoordinates?.lng || CU_CENTER.lng,
      };
    }

    // Determine destination
    let destination: google.maps.LatLngLiteral | null = null;

    if (toBuilding) {
      destination = {
        lat: toBuilding.geoCoordinates?.lat || CU_CENTER.lat,
        lng: toBuilding.geoCoordinates?.lng || CU_CENTER.lng,
      };
    }

    // Only calculate if we have both origin and destination
    if (!origin || !destination) {
      setDirections(null); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    const googleTravelMode =
      travelMode === "DRIVING"
        ? google.maps.TravelMode.DRIVING
        : travelMode === "TRANSIT"
        ? google.maps.TravelMode.TRANSIT
        : google.maps.TravelMode.WALKING;

    directionsService.route(
      {
        origin,
        destination,
        travelMode: googleTravelMode,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          onDirectionsCalculated?.(result);

          // Fit bounds to show entire route
          const bounds = new google.maps.LatLngBounds();
          result.routes[0].legs[0].steps.forEach((step) => {
            bounds.extend(step.start_location);
            bounds.extend(step.end_location);
          });
          map.fitBounds(bounds, { top: 100, right: 50, bottom: 50, left: 50 });
        } else {
          console.error("Directions request failed:", status);
          setDirections(null);
        }
      }
    );
  }, [isLoaded, fromBuilding, toBuilding, customFromLocation, map, onDirectionsCalculated, travelMode]);

  // Clear directions when navigation mode is off
  useEffect(() => {
    if (!navigationMode) {
      setDirections(null); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [navigationMode]);

  // Get marker icon based on building type
  const getMarkerIcon = (building: IBuilding, isFrom: boolean, isTo: boolean) => {
    if (isFrom) {
      return {
        url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        scaledSize: new google.maps.Size(40, 40),
      };
    }
    if (isTo) {
      return {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new google.maps.Size(40, 40),
      };
    }

    const colors: Record<string, string> = {
      academic: "blue",
      service: "yellow",
      hostel: "green",
      event: "purple",
    };

    return {
      url: `https://maps.google.com/mapfiles/ms/icons/${colors[building.type] || "red"}-dot.png`,
      scaledSize: new google.maps.Size(32, 32),
    };
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100">
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Error loading Google Maps</p>
          <p className="text-sm text-neutral-500 mt-2">
            Please check your API key configuration
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1F7A4D]" />
          <p className="text-neutral-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={CU_CENTER}
      zoom={16}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {/* Custom From Location Marker */}
      {customFromLocation && (
        <Marker
          position={{ lat: customFromLocation.lat, lng: customFromLocation.lng }}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new google.maps.Size(44, 44),
          }}
          title={customFromLocation.name}
          zIndex={1000}
        />
      )}

      {/* Building Markers */}
      {buildings.map((building) => {
        const isFrom = fromBuilding?.id === building.id;
        const isTo = toBuilding?.id === building.id;
        const position = {
          lat: building.geoCoordinates?.lat || CU_CENTER.lat,
          lng: building.geoCoordinates?.lng || CU_CENTER.lng,
        };

        return (
          <Marker
            key={building.id}
            position={position}
            icon={getMarkerIcon(building, isFrom, isTo)}
            onClick={() => {
              onSelectBuilding(building);
              if (!navigationMode) {
                setInfoWindowBuilding(building);
              }
            }}
            title={building.name}
            zIndex={isFrom || isTo ? 100 : 1}
          />
        );
      })}

      {/* Info Window */}
      {infoWindowBuilding && !navigationMode && (
        <InfoWindow
          position={{
            lat: infoWindowBuilding.geoCoordinates?.lat || CU_CENTER.lat,
            lng: infoWindowBuilding.geoCoordinates?.lng || CU_CENTER.lng,
          }}
          onCloseClick={() => setInfoWindowBuilding(null)}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-semibold text-neutral-900">{infoWindowBuilding.name}</h3>
            <p className="text-sm text-neutral-600 capitalize">{infoWindowBuilding.type}</p>
            {infoWindowBuilding.description && (
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                {infoWindowBuilding.description}
              </p>
            )}
          </div>
        </InfoWindow>
      )}

      {/* Directions Renderer */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#1F7A4D",
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}
    </GoogleMap>
  );
}
