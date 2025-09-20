import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  name: string;
  description: string;
  date: Date;
  venue: {
    name: string;
    address: string;
    capacity: number;
  };
  totalCapacity: number;
  availableSeats: number;
  basePrice: number;
  status: "draft" | "published" | "sold_out" | "cancelled";
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    venue: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      capacity: { type: Number, required: true },
    },
    totalCapacity: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "sold_out", "cancelled"],
      default: "published",
    },
    imageUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEvent>("Event", EventSchema);
