"use client";

import { useState, useEffect, useCallback } from "react";
import { IEvent } from "@/models/interface/building.interface";

interface UseEventsOptions {
  category?: string;
  upcoming?: boolean;
  buildingId?: string;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.category && options.category !== "all") {
        params.set("category", options.category);
      }
      if (options.upcoming) {
        params.set("upcoming", "true");
      }
      if (options.buildingId) {
        params.set("buildingId", options.buildingId);
      }

      const response = await fetch(`/api/events?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformed: IEvent[] = data.map((e: any) => ({
        id: e._id,
        title: e.title,
        description: e.description,
        building: e.building
          ? {
              id: e.building._id,
              name: e.building.name,
              type: e.building.type,
              coordinates: e.building.mapPosition
                ? { x: e.building.mapPosition.x, y: e.building.mapPosition.y }
                : { x: 50, y: 50 },
            }
          : null,
        startDate: new Date(e.startDate),
        endDate: new Date(e.endDate),
        isAllDay: e.isAllDay,
        category: e.category,
        organizer: e.organizer,
        image: e.image,
        isPublic: e.isPublic,
      }));

      setEvents(transformed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [options.category, options.upcoming, options.buildingId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
}
