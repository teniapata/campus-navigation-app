import mongoose, { Schema, Document } from "mongoose";

export interface IBuildingDocument extends Document {
  name: string;
  type: "academic" | "hostel" | "service" | "event";
  departments?: string[];
  hours?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapPosition: {
    x: number;
    y: number;
  };
  image?: string;
  description?: string;
  amenities?: string[];
  floor_count?: number;
  accessibility?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BuildingSchema = new Schema<IBuildingDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["academic", "hostel", "service", "event"],
    },
    departments: [{ type: String }],
    hours: { type: String },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    mapPosition: {
      x: { type: Number, required: true, min: 0, max: 100 },
      y: { type: Number, required: true, min: 0, max: 100 },
    },
    image: { type: String },
    description: { type: String },
    amenities: [{ type: String }],
    floor_count: { type: Number, default: 1 },
    accessibility: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BuildingSchema.index({ name: "text", description: "text", departments: "text" });

export const Building =
  mongoose.models.Building ||
  mongoose.model<IBuildingDocument>("Building", BuildingSchema);
