import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: string;
  seats: string[];
  price: number;
  finalPrice: number;
  status: "reserved" | "paid" | "cancelled" | "expired" | "used";
  qrCode?: string;
  purchasedAt?: Date;
  reservedAt: Date;
  expiresAt: Date;
}

const TicketSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    seats: [
      {
        type: String,
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["reserved", "paid", "cancelled", "expired", "used"],
      default: "reserved",
    },
    qrCode: String,
    purchasedAt: Date,
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 15 * 60 * 1000), // 15 minutos
    },
  },
  {
    timestamps: true,
  }
);

// Índice para buscar tickets por usuario
TicketSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ITicket>("Ticket", TicketSchema);
