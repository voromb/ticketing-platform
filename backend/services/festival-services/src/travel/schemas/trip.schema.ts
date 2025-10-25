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
  companyId: string; // ID de la compañía de viajes

  @Prop({ required: true })
  companyName: string; // Nombre de la compañía

  @Prop({ required: true })
  region: string; // SPAIN, EUROPE

  @Prop({ required: true })
  managedBy: string; // Email del COMPANY_ADMIN

  @Prop()
  vehicleType: string; // BUS/TRAIN/PLANE/FERRY

  @Prop()
  vehicleCapacity: number; // Capacidad del vehículo

  @Prop()
  vehiclePlate: string; // Matrícula del vehículo

  @Prop({ type: Object })
  driverInfo: {
    name: string;
    phone: string;
    license: string;
  };

  @Prop({ default: 'APPROVED' })
  approvalStatus: string; // PENDING/APPROVED/REJECTED

  @Prop()
  lastModifiedBy: string;

  @Prop()
  lastApprovedBy: string;

  @Prop()
  lastApprovedAt: Date;

  @Prop()
  cancellationPolicy: string;

  @Prop({ required: true })
  festivalId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
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
