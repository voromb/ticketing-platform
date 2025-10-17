import mongoose, { Schema, Document } from "mongoose";

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId; 
  eventId: string; 
  createdAt?: Date;
  updatedAt?: Date;
}

const LikeSchema: Schema<ILike> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Evita duplicados: un usuario solo puede dar un like por evento
LikeSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model<ILike>("Like", LikeSchema);
