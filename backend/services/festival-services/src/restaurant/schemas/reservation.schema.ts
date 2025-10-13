import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReservationDocument = Reservation & Document;

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REQUIRES_APPROVAL = 'REQUIRES_APPROVAL',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true, min: 1 })
  partySize: number;

  @Prop({ required: true })
  reservationDate: Date;

  @Prop({ required: true, default: 120 }) // 2 horas por defecto
  duration: number; // en minutos

  @Prop({ required: false })
  tableNumber?: number;

  @Prop({ 
    type: String, 
    enum: Object.values(ReservationStatus), 
    default: ReservationStatus.PENDING 
  })
  status: ReservationStatus;

  @Prop({ required: false })
  specialRequests?: string;

  @Prop({ required: false })
  approvalId?: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;

  @Prop({ required: false })
  cancellationReason?: string;

  @Prop({ required: false })
  confirmedAt?: Date;

  @Prop({ required: false })
  cancelledAt?: Date;

  @Prop({ required: false })
  completedAt?: Date;

  @Prop({ required: false })
  estimatedPrice?: number;

  @Prop({ required: false })
  actualPrice?: number;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Índices para optimización
ReservationSchema.index({ restaurantId: 1 });
ReservationSchema.index({ userId: 1 });
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ reservationDate: 1 });
ReservationSchema.index({ restaurantId: 1, reservationDate: 1 }); // Para consultas de disponibilidad
