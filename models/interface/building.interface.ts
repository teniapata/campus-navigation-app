export interface IBuilding {
  id: string;
  name: string;
  type: "academic" | "hostel" | "service" | "event";
  departments?: string[];
  hours?: string;
  coordinates: { x: number; y: number };
  geoCoordinates?: { lat: number; lng: number };
  image?: string;
  description?: string;
  amenities?: string[];
  floor_count?: number;
  accessibility?: boolean;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  building: IBuilding;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  category: "academic" | "social" | "sports" | "religious" | "career" | "other";
  organizer: string;
  image?: string;
  isPublic: boolean;
}

export interface ISavedLocation {
  id: string;
  building: IBuilding;
  nickname?: string;
  notes?: string;
  createdAt: Date;
}

export interface INavigationStep {
  instruction: string;
  distance: number;
  landmark?: string;
}

export interface INavigationRoute {
  path: { nodeId: string; mapPosition: { x: number; y: number } }[];
  totalDistance: number;
  estimatedTime: number;
  steps: INavigationStep[];
}
