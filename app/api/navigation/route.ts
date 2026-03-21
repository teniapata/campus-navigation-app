import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Building } from "@/models/schemas/building.schema";
import { PathNode, IPathNodeDocument } from "@/models/schemas/path-node.schema";
import { navigationValidator } from "@/lib/validators";

// Dijkstra's shortest path algorithm
function dijkstra(
  nodes: Map<string, IPathNodeDocument>,
  startId: string,
  endId: string,
  requireAccessible: boolean
): { path: string[]; totalDistance: number; totalWalkTime: number } | null {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const nodeId of nodes.keys()) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  }

  distances.set(startId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let minDist = Infinity;
    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < minDist) {
        minDist = dist;
        current = nodeId;
      }
    }

    if (current === null || current === endId) break;

    unvisited.delete(current);
    const currentNode = nodes.get(current);
    if (!currentNode) continue;

    for (const edge of currentNode.connectedNodes) {
      if (requireAccessible && !edge.isAccessible) continue;
      if (!unvisited.has(edge.nodeId)) continue;

      const alt = distances.get(current)! + edge.distance;
      if (alt < distances.get(edge.nodeId)!) {
        distances.set(edge.nodeId, alt);
        previous.set(edge.nodeId, current);
      }
    }
  }

  // Reconstruct path
  if (distances.get(endId) === Infinity) return null;

  const path: string[] = [];
  let current: string | null = endId;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  // Calculate total walk time along the path
  let totalWalkTime = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const node = nodes.get(path[i])!;
    const edge = node.connectedNodes.find((e) => e.nodeId === path[i + 1]);
    if (edge) totalWalkTime += edge.walkTime;
  }

  return {
    path,
    totalDistance: Math.round(distances.get(endId)!),
    totalWalkTime,
  };
}

// Generate human-readable directions from path
function generatePathDirections(
  pathNodeIds: string[],
  nodes: Map<string, IPathNodeDocument>
): { instruction: string; distance: number }[] {
  const steps: { instruction: string; distance: number }[] = [];

  if (pathNodeIds.length < 2) return steps;

  const startNode = nodes.get(pathNodeIds[0])!;

  steps.push({
    instruction: `Start at ${startNode.name || startNode.nodeId}`,
    distance: 0,
  });

  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const current = nodes.get(pathNodeIds[i])!;
    const next = nodes.get(pathNodeIds[i + 1])!;
    const edge = current.connectedNodes.find((e) => e.nodeId === next.nodeId);
    const distance = edge?.distance || 0;

    // Calculate direction
    const dx = next.mapPosition.x - current.mapPosition.x;
    const dy = next.mapPosition.y - current.mapPosition.y;

    let direction = "";
    if (Math.abs(dy) > Math.abs(dx)) {
      direction = dy > 0 ? "south" : "north";
      if (Math.abs(dx) > 3) direction += dx > 0 ? "-east" : "-west";
    } else {
      direction = dx > 0 ? "east" : "west";
      if (Math.abs(dy) > 3) direction += dy > 0 ? "-south" : "-north";
    }

    if (next.type === "building_entrance") {
      steps.push({
        instruction: `Arrive at ${next.name || next.nodeId}`,
        distance,
      });
    } else if (next.type === "intersection") {
      steps.push({
        instruction: `Continue ${direction} through ${next.name || "junction"}`,
        distance,
      });
    } else {
      steps.push({
        instruction: `Walk ${direction} along the pathway`,
        distance,
      });
    }
  }

  return steps;
}

// Fallback: simple haversine-based navigation
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { fromBuildingId, toBuildingId, accessible } = navigationValidator.parse(body);

    const [fromBuilding, toBuilding] = await Promise.all([
      Building.findById(fromBuildingId),
      Building.findById(toBuildingId),
    ]);

    if (!fromBuilding || !toBuilding) {
      return NextResponse.json({ error: "Building not found" }, { status: 404 });
    }

    // Try pathfinding with PathNodes
    const allNodes = await PathNode.find({});

    if (allNodes.length > 0) {
      const nodeMap = new Map<string, IPathNodeDocument>();
      for (const node of allNodes) {
        nodeMap.set(node.nodeId, node);
      }

      // Find entrance nodes for from/to buildings
      const fromEntrance = allNodes.find(
        (n) => n.type === "building_entrance" && n.buildingId === fromBuildingId
      );
      const toEntrance = allNodes.find(
        (n) => n.type === "building_entrance" && n.buildingId === toBuildingId
      );

      if (fromEntrance && toEntrance) {
        const result = dijkstra(
          nodeMap,
          fromEntrance.nodeId,
          toEntrance.nodeId,
          accessible || false
        );

        if (result) {
          const pathDetails = result.path.map((nodeId) => {
            const node = nodeMap.get(nodeId)!;
            return {
              nodeId: node.nodeId,
              coordinates: node.coordinates,
              mapPosition: node.mapPosition,
            };
          });

          const steps = generatePathDirections(result.path, nodeMap);
          const estimatedTime = Math.max(1, Math.round(result.totalWalkTime / 60));

          return NextResponse.json({
            path: pathDetails,
            totalDistance: result.totalDistance,
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
            method: "pathfinding",
            accessible: accessible || false,
          });
        }

        // If accessible route not found, inform user
        if (accessible) {
          return NextResponse.json(
            { error: "No accessible route found between these buildings" },
            { status: 404 }
          );
        }
      }
    }

    // Fallback: simple haversine calculation
    const distance = haversineDistance(
      fromBuilding.coordinates.lat,
      fromBuilding.coordinates.lng,
      toBuilding.coordinates.lat,
      toBuilding.coordinates.lng
    );

    const estimatedTime = Math.max(1, Math.round(distance / 84));

    const path = [
      {
        nodeId: "start",
        coordinates: fromBuilding.coordinates,
        mapPosition: fromBuilding.mapPosition,
      },
      {
        nodeId: "end",
        coordinates: toBuilding.coordinates,
        mapPosition: toBuilding.mapPosition,
      },
    ];

    const dx = toBuilding.mapPosition.x - fromBuilding.mapPosition.x;
    const dy = toBuilding.mapPosition.y - fromBuilding.mapPosition.y;
    const dir = Math.abs(dy) > Math.abs(dx)
      ? (dy > 0 ? "south" : "north")
      : (dx > 0 ? "east" : "west");

    const steps = [
      { instruction: `Exit ${fromBuilding.name} and head ${dir}`, distance: Math.round(distance * 0.1) },
      ...(distance > 200
        ? [{ instruction: `Continue walking along the main pathway`, distance: Math.round(distance * 0.7) }]
        : []),
      { instruction: `Arrive at ${toBuilding.name}`, distance: Math.round(distance * 0.2) },
    ];

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
      method: "direct",
      accessible: false,
    });
  } catch (error) {
    console.error("Error calculating route:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to calculate route" }, { status: 500 });
  }
}
