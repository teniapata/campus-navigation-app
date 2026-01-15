"use client";

import { useState } from "react";
import { INavigationRoute } from "@/models/interface/building.interface";

export function useNavigation() {
  const [route, setRoute] = useState<INavigationRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function calculateRoute(
    fromBuildingId: string,
    toBuildingId: string,
    accessible: boolean = false
  ) {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromBuildingId,
          toBuildingId,
          accessible,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to calculate route");
      }

      const data = await response.json();
      setRoute(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      setRoute(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  function clearRoute() {
    setRoute(null);
    setError(null);
  }

  return {
    route,
    isLoading,
    error,
    calculateRoute,
    clearRoute,
  };
}
