import mongoose, { Schema, Document } from "mongoose";

export interface IPathNodeDocument extends Document {
  nodeId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapPosition: {
    x: number;
    y: number;
  };
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

const PathNodeSchema = new Schema<IPathNodeDocument>({
  nodeId: { type: String, required: true, unique: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  mapPosition: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  type: {
    type: String,
    enum: ["intersection", "building_entrance", "waypoint"],
    required: true,
  },
  buildingId: { type: String },
  name: { type: String },
  connectedNodes: [
    {
      nodeId: { type: String, required: true },
      distance: { type: Number, required: true },
      walkTime: { type: Number, required: true },
      isAccessible: { type: Boolean, default: true },
    },
  ],
});

export const PathNode =
  mongoose.models.PathNode ||
  mongoose.model<IPathNodeDocument>("PathNode", PathNodeSchema);
