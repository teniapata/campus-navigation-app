"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { ISavedLocation, IBuilding } from "@/models/interface/building.interface";

export function useSavedLocations() {
  const { data: session } = useSession();
  const [savedLocations, setSavedLocations] = useState<ISavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedLocations = useCallback(async () => {
    if (!session) {
      setSavedLocations([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/saved-locations");

      if (!response.ok) {
        throw new Error("Failed to fetch saved locations");
      }

      const data = await response.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformed: ISavedLocation[] = data.map((sl: any) => ({
        id: sl._id,
        building: sl.building
          ? {
              id: sl.building._id,
              name: sl.building.name,
              type: sl.building.type,
              departments: sl.building.departments,
              hours: sl.building.hours,
              coordinates: {
                x: sl.building.mapPosition?.x ?? 50,
                y: sl.building.mapPosition?.y ?? 50,
              },
              description: sl.building.description,
            }
          : null,
        nickname: sl.nickname,
        notes: sl.notes,
        createdAt: new Date(sl.createdAt),
      }));

      setSavedLocations(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchSavedLocations();
  }, [fetchSavedLocations]);

  const saveLocation = async (
    building: IBuilding,
    nickname?: string,
    notes?: string
  ) => {
    if (!session) {
      throw new Error("Must be logged in to save locations");
    }

    try {
      const response = await fetch("/api/saved-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: building.id,
          nickname,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save location");
      }

      await fetchSavedLocations();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const removeLocation = async (savedLocationId: string) => {
    if (!session) {
      throw new Error("Must be logged in to remove locations");
    }

    try {
      const response = await fetch(`/api/saved-locations/${savedLocationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove location");
      }

      await fetchSavedLocations();
      return true;
    } catch (err) {
      throw err;
    }
  };

  const isLocationSaved = (buildingId: string) => {
    return savedLocations.some((sl) => sl.building?.id === buildingId);
  };

  const getSavedLocationForBuilding = (buildingId: string) => {
    return savedLocations.find((sl) => sl.building?.id === buildingId);
  };

  return {
    savedLocations,
    isLoading,
    error,
    saveLocation,
    removeLocation,
    isLocationSaved,
    getSavedLocationForBuilding,
    refetch: fetchSavedLocations,
  };
}
