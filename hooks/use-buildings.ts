"use client";

import { useState, useEffect, useCallback } from "react";
import { IBuilding } from "@/models/interface/building.interface";

interface UseBuildingsOptions {
  type?: string;
  search?: string;
}

export function useBuildings(options: UseBuildingsOptions = {}) {
  const [buildings, setBuildings] = useState<IBuilding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuildings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.type && options.type !== "all") {
        params.set("type", options.type);
      }
      if (options.search) {
        params.set("search", options.search);
      }

      const response = await fetch(`/api/buildings?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch buildings");
      }

      const data = await response.json();

      const transformed: IBuilding[] = data.map(
        (b: {
          _id: string;
          name: string;
          type: "academic" | "hostel" | "service" | "event";
          departments?: string[];
          hours?: string;
          mapPosition: { x: number; y: number };
          coordinates?: { lat: number; lng: number };
          image?: string;
          description?: string;
          amenities?: string[];
          floor_count?: number;
          accessibility?: boolean;
        }) => ({
          id: b._id,
          name: b.name,
          type: b.type,
          departments: b.departments,
          hours: b.hours,
          coordinates: { x: b.mapPosition.x, y: b.mapPosition.y },
          geoCoordinates: b.coordinates,
          image: b.image,
          description: b.description,
          amenities: b.amenities,
          floor_count: b.floor_count,
          accessibility: b.accessibility,
        })
      );

      setBuildings(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [options.type, options.search]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  return { buildings, isLoading, error, refetch: fetchBuildings };
}
