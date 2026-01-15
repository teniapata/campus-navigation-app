import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEventDocument extends Document {
  title: string;
  description: string;
  building: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  category: "academic" | "social" | "sports" | "religious" | "career" | "other";
  organizer: string;
  image?: string;
  attendeeLimit?: number;
  isPublic: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEventDocument>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    building: { type: Schema.Types.ObjectId, ref: "Building", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isAllDay: { type: Boolean, default: false },
    category: {
      type: String,
      required: true,
      enum: ["academic", "social", "sports", "religious", "career", "other"],
    },
    organizer: { type: String, required: true },
    image: { type: String },
    attendeeLimit: { type: Number },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ title: "text", description: "text" });

export const Event =
  mongoose.models.Event || mongoose.model<IEventDocument>("Event", EventSchema);
