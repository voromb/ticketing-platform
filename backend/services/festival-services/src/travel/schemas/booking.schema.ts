import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REQUIRES_APPROVAL = 'REQUIRES_APPROVAL',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Trip', required: true })
  tripId: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  passengerName: string;

  @Prop({ required: true })
  passengerEmail: string;

  @Prop({ required: true, min: 1 })
  seatsBooked: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ 
    type: String, 
    enum: Object.values(BookingStatus), 
    default: BookingStatus.PENDING 
  })
  status: BookingStatus;

  @Prop({ default: Date.now })
  bookingDate: Date;

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
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Índices para optimización
BookingSchema.index({ tripId: 1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ bookingDate: -1 });
