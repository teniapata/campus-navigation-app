"use client";

import { Clock, MapPin, Navigation, X, Bookmark, Share2, Accessibility } from "lucide-react";
import { useSession } from "next-auth/react";
import { IBuilding } from "@/models/interface/building.interface";
import { Button } from "./ui/button";
import Image from "next/image";
import { useSavedLocations } from "@/hooks/use-saved-locations";
import { toast } from "sonner";

interface BuildingDetailDrawerProps {
  building: IBuilding;
  onClose: () => void;
  onGetDirections?: (building: IBuilding) => void;
}

export function BuildingDetailDrawer({
  building,
  onClose,
  onGetDirections,
}: BuildingDetailDrawerProps) {
  const { data: session } = useSession();
  const { isLocationSaved, saveLocation, getSavedLocationForBuilding, removeLocation } = useSavedLocations();

  const isSaved = isLocationSaved(building.id);
  const savedLocation = getSavedLocationForBuilding(building.id);

  const handleSaveLocation = async () => {
    if (!session) {
      toast.error("Please sign in to save locations");
      return;
    }

    try {
      if (isSaved && savedLocation) {
        await removeLocation(savedLocation.id);
        toast.success("Location removed from saved");
      } else {
        await saveLocation(building);
        toast.success("Location saved!");
      }
    } catch {
      toast.error("Failed to update saved locations");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: building.name,
          text: building.description || `Check out ${building.name} at Covenant University`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // User cancelled or share failed
    }
  };

  return (
    <>
      {/* Backdrop */}
      <Button
        className="fixed inset-0 bg-black/20 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white dark:bg-neutral-900 shadow-2xl z-50 animate-slideInRight flex flex-col max-w-full">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-neutral-900 pr-8 text-lg md:text-xl font-semibold">
              {building.name}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>

          {/* Building Image */}
          <div className="w-full h-40 md:h-48 bg-neutral-100 rounded-lg overflow-hidden relative">
            <Image
              src={building.image || "https://images.unsplash.com/photo-1667273704095-66c1e361cfdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwYnVpbGRpbmclMjBleHRlcmlvcnxlbnwxfHx8fDE3NjU2MjIyODl8MA&ixlib=rb-4.1.0&q=80&w=1080"}
              alt={building.name}
              fill
              className="object-cover"
              unoptimized={building.image?.startsWith("/uploads") || false}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Description */}
          {building.description && (
            <div className="mb-6">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {building.description}
              </div>
            </div>
          )}

          {/* Opening Hours */}
          {building.hours && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Opening Hours
                </h3>
              </div>
              <div className="text-sm text-neutral-600 pl-6">
                {building.hours}
              </div>
            </div>
          )}

          {/* Departments */}
          {building.departments && building.departments.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Departments & Facilities
                </h3>
              </div>
              <div className="space-y-2 pl-6">
                {building.departments.map((dept, index) => (
                  <div
                    key={index}
                    className="text-sm text-neutral-600 py-1.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    {dept}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {building.amenities && building.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-2">
                Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {building.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <div className="text-xs text-neutral-500 mb-2">
              Location Information
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              Map Position: {building.coordinates.x.toFixed(1)}%, {building.coordinates.y.toFixed(1)}%
            </div>
            {building.floor_count && (
              <div className="text-sm text-neutral-700 mt-1">
                Floors: {building.floor_count}
              </div>
            )}
            <div className={`text-sm mt-1 flex items-center gap-1.5 ${building.accessibility ? "text-green-600" : "text-neutral-400"}`}>
              <Accessibility className="w-4 h-4" />
              {building.accessibility ? "Wheelchair Accessible" : "Not Wheelchair Accessible"}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          <button
            onClick={() => onGetDirections?.(building)}
            className="w-full py-3 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#196841] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Navigation className="w-5 h-5" />
            <span>Get Directions</span>
          </button>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={handleSaveLocation}
              className={`py-2.5 border rounded-lg transition-colors text-sm flex items-center justify-center gap-2 ${
                isSaved
                  ? "bg-[#1F7A4D] text-white border-[#1F7A4D]"
                  : "border-neutral-300 text-neutral-700 hover:bg-white"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleShare}
              className="py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-white transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
