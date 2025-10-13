import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TripDocument = Trip & Document;

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  BOARDING = 'BOARDING',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Schema()
export class Location {
  @Prop({ required: true })
  location: string;

  @Prop()
  datetime?: Date;

  @Prop({ type: [Number] })
  coordinates?: number[];
}

@Schema({ timestamps: true })
export class Trip {
  @Prop({ required: true })
  festivalId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Location, required: true })
  departure: Location;

  @Prop({ type: Location, required: true })
  arrival: Location;

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 0, min: 0 })
  bookedSeats: number;

  @Prop({ enum: TripStatus, default: TripStatus.SCHEDULED })
  status: TripStatus;

  @Prop({ default: false })
  requiresApproval: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
