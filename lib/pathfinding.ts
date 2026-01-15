interface PathNode {
  nodeId: string;
  coordinates: { lat: number; lng: number };
  mapPosition: { x: number; y: number };
  type: "intersection" | "building_entrance" | "waypoint";
  buildingId?: string;
  name?: string;
  connectedNodes: {
    nodeId: string;
    distance: number;
    walkTime: number;
    isAccessible: boolean;
  }[];
}

interface PathResult {
  path: { nodeId: string; mapPosition: { x: number; y: number } }[];
  totalDistance: number;
  estimatedTime: number;
  steps: NavigationStep[];
}

interface NavigationStep {
  instruction: string;
  distance: number;
  landmark?: string;
}

class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  push(item: T, priority: number) {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const result = this.heap[0].item;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return result;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
      [this.heap[parentIndex], this.heap[index]] = [
        this.heap[index],
        this.heap[parentIndex],
      ];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number) {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild].priority < this.heap[smallest].priority
      ) {
        smallest = leftChild;
      }
      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].priority < this.heap[smallest].priority
      ) {
        smallest = rightChild;
      }
      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function findShortestPath(
  nodes: PathNode[],
  startId: string,
  endId: string,
  accessibleOnly: boolean = false
): PathResult | null {
  const nodeMap = new Map<string, PathNode>();
  nodes.forEach((n) => nodeMap.set(n.nodeId, n));

  const startNode = nodeMap.get(startId);
  const endNode = nodeMap.get(endId);

  if (!startNode || !endNode) return null;

  const heuristic = (nodeId: string): number => {
    const node = nodeMap.get(nodeId);
    if (!node) return Infinity;
    return haversineDistance(
      node.coordinates.lat,
      node.coordinates.lng,
      endNode.coordinates.lat,
      endNode.coordinates.lng
    );
  };

  const openSet = new PriorityQueue<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const distanceUsed = new Map<string, number>();
  const timeUsed = new Map<string, number>();

  gScore.set(startId, 0);
  fScore.set(startId, heuristic(startId));
  distanceUsed.set(startId, 0);
  timeUsed.set(startId, 0);
  openSet.push(startId, fScore.get(startId)!);

  const closedSet = new Set<string>();

  while (!openSet.isEmpty()) {
    const current = openSet.pop()!;

    if (current === endId) {
      const path: { nodeId: string; mapPosition: { x: number; y: number } }[] =
        [];
      let node: string | undefined = current;

      while (node) {
        const pathNode = nodeMap.get(node)!;
        path.unshift({
          nodeId: node,
          mapPosition: pathNode.mapPosition,
        });
        node = cameFrom.get(node);
      }

      return {
        path,
        totalDistance: Math.round(distanceUsed.get(endId)!),
        estimatedTime: Math.round(timeUsed.get(endId)! / 60),
        steps: generateSteps(path, nodeMap),
      };
    }

    closedSet.add(current);
    const currentNode = nodeMap.get(current)!;

    for (const neighbor of currentNode.connectedNodes) {
      if (closedSet.has(neighbor.nodeId)) continue;
      if (accessibleOnly && !neighbor.isAccessible) continue;

      const tentativeGScore = gScore.get(current)! + neighbor.distance;

      if (tentativeGScore < (gScore.get(neighbor.nodeId) ?? Infinity)) {
        cameFrom.set(neighbor.nodeId, current);
        gScore.set(neighbor.nodeId, tentativeGScore);
        fScore.set(
          neighbor.nodeId,
          tentativeGScore + heuristic(neighbor.nodeId)
        );
        distanceUsed.set(
          neighbor.nodeId,
          distanceUsed.get(current)! + neighbor.distance
        );
        timeUsed.set(
          neighbor.nodeId,
          timeUsed.get(current)! + neighbor.walkTime
        );
        openSet.push(neighbor.nodeId, fScore.get(neighbor.nodeId)!);
      }
    }
  }

  return null;
}

function generateSteps(
  path: { nodeId: string; mapPosition: { x: number; y: number } }[],
  nodeMap: Map<string, PathNode>
): NavigationStep[] {
  const steps: NavigationStep[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const current = nodeMap.get(path[i].nodeId)!;
    const next = nodeMap.get(path[i + 1].nodeId)!;
    const connection = current.connectedNodes.find(
      (c) => c.nodeId === next.nodeId
    );

    if (!connection) continue;

    const direction = getDirection(current.mapPosition, next.mapPosition);

    let instruction = "";
    if (next.type === "building_entrance") {
      instruction = `Head ${direction} and arrive at ${next.name || "your destination"}`;
    } else if (next.name) {
      instruction = `Walk ${direction} past ${next.name} (${connection.distance}m)`;
    } else {
      instruction = `Continue ${direction} for ${connection.distance}m`;
    }

    steps.push({
      instruction,
      distance: connection.distance,
      landmark: next.type === "building_entrance" ? next.buildingId : undefined,
    });
  }

  return steps;
}

function getDirection(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  if (angle >= -22.5 && angle < 22.5) return "east";
  if (angle >= 22.5 && angle < 67.5) return "southeast";
  if (angle >= 67.5 && angle < 112.5) return "south";
  if (angle >= 112.5 && angle < 157.5) return "southwest";
  if (angle >= 157.5 || angle < -157.5) return "west";
  if (angle >= -157.5 && angle < -112.5) return "northwest";
  if (angle >= -112.5 && angle < -67.5) return "north";
  return "northeast";
}

export function findBuildingEntranceNode(
  nodes: PathNode[],
  buildingId: string
): PathNode | undefined {
  return nodes.find(
    (n) => n.type === "building_entrance" && n.buildingId === buildingId
  );
}
