import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISavedLocationDocument extends Document {
  user: Types.ObjectId;
  building: Types.ObjectId;
  nickname?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedLocationSchema = new Schema<ISavedLocationDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    building: { type: Schema.Types.ObjectId, ref: "Building", required: true },
    nickname: { type: String, maxlength: 50 },
    notes: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);

SavedLocationSchema.index({ user: 1, building: 1 }, { unique: true });

export const SavedLocation =
  mongoose.models.SavedLocation ||
  mongoose.model<ISavedLocationDocument>("SavedLocation", SavedLocationSchema);
