import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Building } from "@/models/schemas/building.schema";
import { navigationValidator } from "@/lib/validators";

// Calculate distance between two points using Haversine formula (for geo coordinates)
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate walking directions based on relative positions
function generateDirections(
  fromBuilding: { name: string; coordinates: { lat: number; lng: number }; mapPosition: { x: number; y: number } },
  toBuilding: { name: string; coordinates: { lat: number; lng: number }; mapPosition: { x: number; y: number } },
  distance: number
): { instruction: string; distance: number }[] {
  const steps: { instruction: string; distance: number }[] = [];

  const dx = toBuilding.mapPosition.x - fromBuilding.mapPosition.x;
  const dy = toBuilding.mapPosition.y - fromBuilding.mapPosition.y;

  // Determine primary direction
  let primaryDirection = "";
  let secondaryDirection = "";

  if (Math.abs(dy) > Math.abs(dx)) {
    primaryDirection = dy > 0 ? "south" : "north";
    if (Math.abs(dx) > 5) {
      secondaryDirection = dx > 0 ? "east" : "west";
    }
  } else {
    primaryDirection = dx > 0 ? "east" : "west";
    if (Math.abs(dy) > 5) {
      secondaryDirection = dy > 0 ? "south" : "north";
    }
  }

  const directionText = secondaryDirection
    ? `${primaryDirection}-${secondaryDirection}`
    : primaryDirection;

  steps.push({
    instruction: `Exit ${fromBuilding.name} and head ${directionText}`,
    distance: Math.round(distance * 0.1),
  });

  if (distance > 200) {
    steps.push({
      instruction: `Continue walking ${directionText} along the main pathway`,
      distance: Math.round(distance * 0.7),
    });
  }

  steps.push({
    instruction: `Arrive at ${toBuilding.name}`,
    distance: Math.round(distance * 0.2),
  });

  return steps;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { fromBuildingId, toBuildingId } = navigationValidator.parse(body);

    const [fromBuilding, toBuilding] = await Promise.all([
      Building.findById(fromBuildingId),
      Building.findById(toBuildingId),
    ]);

    if (!fromBuilding || !toBuilding) {
      return NextResponse.json(
        { error: "Building not found" },
        { status: 404 }
      );
    }

    // Calculate distance using geo coordinates
    const distance = haversineDistance(
      fromBuilding.coordinates.lat,
      fromBuilding.coordinates.lng,
      toBuilding.coordinates.lat,
      toBuilding.coordinates.lng
    );

    // Estimate walking time (average walking speed: 1.4 m/s = 84 m/min)
    const estimatedTime = Math.max(1, Math.round(distance / 84));

    // Generate path points for map display
    const path = [
      {
        nodeId: "start",
        coordinates: {
          lat: fromBuilding.coordinates.lat,
          lng: fromBuilding.coordinates.lng,
        },
        mapPosition: {
          x: fromBuilding.mapPosition.x,
          y: fromBuilding.mapPosition.y,
        },
      },
      {
        nodeId: "end",
        coordinates: {
          lat: toBuilding.coordinates.lat,
          lng: toBuilding.coordinates.lng,
        },
        mapPosition: {
          x: toBuilding.mapPosition.x,
          y: toBuilding.mapPosition.y,
        },
      },
    ];

    // Generate directions
    const steps = generateDirections(
      {
        name: fromBuilding.name,
        coordinates: fromBuilding.coordinates,
        mapPosition: fromBuilding.mapPosition,
      },
      {
        name: toBuilding.name,
        coordinates: toBuilding.coordinates,
        mapPosition: toBuilding.mapPosition,
      },
      distance
    );

    return NextResponse.json({
      path,
      totalDistance: Math.round(distance),
      estimatedTime,
      steps,
      fromBuilding: {
        id: fromBuilding._id,
        name: fromBuilding.name,
        mapPosition: fromBuilding.mapPosition,
      },
      toBuilding: {
        id: toBuilding._id,
        name: toBuilding.name,
        mapPosition: toBuilding.mapPosition,
      },
    });
  } catch (error) {
    console.error("Error calculating route:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to calculate route" },
      { status: 500 }
    );
  }
}
