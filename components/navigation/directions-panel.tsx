"use client";

import { IBuilding, INavigationRoute } from "@/models/interface/building.interface";
import { X, Navigation, MapPin, Loader2, Clock, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DirectionsPanelProps {
  fromBuilding: IBuilding | null;
  toBuilding: IBuilding | null;
  route: INavigationRoute | null;
  isLoading: boolean;
  onCancel: () => void;
  onSelectFrom: () => void;
  onSelectTo: () => void;
}

export function DirectionsPanel({
  fromBuilding,
  toBuilding,
  route,
  isLoading,
  onCancel,
  onSelectFrom,
  onSelectTo,
}: DirectionsPanelProps) {
  return (
    <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-30">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#1F7A4D]" />
          <h3 className="font-medium text-neutral-900">Directions</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* From/To Selection */}
      <div className="p-4 space-y-3">
        <button
          onClick={onSelectFrom}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-[#1F7A4D] transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500">From</p>
            <p className="text-sm font-medium text-neutral-900 truncate">
              {fromBuilding?.name || "Select starting point..."}
            </p>
          </div>
        </button>

        <button
          onClick={onSelectTo}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-[#1F7A4D] transition-colors text-left"
        >
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500">To</p>
            <p className="text-sm font-medium text-neutral-900 truncate">
              {toBuilding?.name || "Select destination..."}
            </p>
          </div>
        </button>
      </div>

      {/* Route Info */}
      {isLoading && (
        <div className="p-4 border-t border-neutral-200 flex items-center justify-center gap-2 text-neutral-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Calculating route...</span>
        </div>
      )}

      {route && !isLoading && (
        <div className="border-t border-neutral-200">
          {/* Summary */}
          <div className="p-4 bg-neutral-50 flex items-center justify-around">
            <div className="text-center">
              <div className="flex items-center gap-1 text-neutral-600">
                <Footprints className="w-4 h-4" />
                <span className="text-sm">Distance</span>
              </div>
              <p className="font-semibold text-neutral-900">
                {route.totalDistance}m
              </p>
            </div>
            <div className="h-8 w-px bg-neutral-300" />
            <div className="text-center">
              <div className="flex items-center gap-1 text-neutral-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Time</span>
              </div>
              <p className="font-semibold text-neutral-900">
                ~{route.estimatedTime} min
              </p>
            </div>
          </div>

          {/* Steps */}
          {route.steps && route.steps.length > 0 && (
            <div className="p-4 max-h-48 overflow-y-auto">
              <p className="text-xs font-medium text-neutral-500 mb-2">
                DIRECTIONS
              </p>
              <div className="space-y-3">
                {route.steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-[#1F7A4D] text-white flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      {index < route.steps.length - 1 && (
                        <div className="w-0.5 h-full bg-neutral-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="text-sm text-neutral-700">
                        {step.instruction}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {step.distance}m
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(!fromBuilding || !toBuilding) && !route && !isLoading && (
        <div className="p-4 border-t border-neutral-200 text-center text-sm text-neutral-500">
          {!fromBuilding && toBuilding
            ? "Click a building on the map to set your starting point"
            : !toBuilding && fromBuilding
            ? "Click a building on the map to set your destination"
            : "Select buildings on the map to get directions"}
        </div>
      )}
    </div>
  );
}
