import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PackageOrderDocument = PackageOrder & Document;

@Schema({ timestamps: true, collection: 'package_orders' })
export class PackageOrder {
  @Prop({ required: true })
  userId: string; // ID del usuario que compra

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  festivalId: string;

  @Prop({ required: true })
  eventId: string;

  @Prop({ required: true })
  eventName: string;

  // TICKETS
  @Prop({ required: true })
  ticketQuantity: number;

  @Prop({ required: true })
  ticketPrice: number;

  @Prop({ required: true })
  ticketTotal: number; // ticketQuantity * ticketPrice

  // VIAJE (opcional)
  @Prop()
  tripId?: string;

  @Prop()
  tripName?: string;

  @Prop()
  tripPrice?: number;

  // RESTAURANTE (opcional)
  @Prop()
  restaurantId?: string;

  @Prop()
  restaurantName?: string;

  @Prop()
  restaurantPrice?: number;

  @Prop()
  reservationDate?: Date;

  @Prop()
  reservationTime?: string;

  @Prop({ default: 2 })
  numberOfPeople?: number;

  // MERCHANDISING (opcional)
  @Prop({
    type: [
      {
        productId: String,
        productName: String,
        quantity: Number,
        price: Number,
        total: Number,
      },
    ],
    default: [],
  })
  merchandising: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }[];

  @Prop({ default: 0 })
  merchandisingTotal: number;

  // TOTALES
  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  taxes: number;

  @Prop({ required: true })
  total: number;

  // ESTADO
  @Prop({
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  })
  paymentStatus: string;

  @Prop()
  paymentMethod?: string;

  @Prop()
  transactionId?: string;

  @Prop()
  notes?: string;
}

export const PackageOrderSchema = SchemaFactory.createForClass(PackageOrder);
