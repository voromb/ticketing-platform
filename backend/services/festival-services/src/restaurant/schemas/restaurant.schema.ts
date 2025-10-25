import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  companyId: string; // ID de la compañía que gestiona

  @Prop({ required: true })
  companyName: string; // Nombre de la compañía

  @Prop({ required: true })
  region: string; // SPAIN, EUROPE, etc.

  @Prop({ required: true })
  managedBy: string; // Email del COMPANY_ADMIN

  @Prop({ default: 'APPROVED' })
  approvalStatus: string; // PENDING/APPROVED/REJECTED

  @Prop()
  lastModifiedBy: string; // Quién hizo el último cambio

  @Prop()
  lastApprovedBy: string; // Quién aprobó

  @Prop()
  lastApprovedAt: Date; // Cuándo se aprobó

  @Prop({ required: true })
  festivalId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  cuisine: string; // Tipo de cocina: italiana, mexicana, vegana, etc

  @Prop({ required: true })
  location: string; // Ubicación dentro del festival

  @Prop({ required: true })
  capacity: number; // Aforo máximo

  @Prop({ default: 0 })
  currentOccupancy: number; // Ocupación actual

  @Prop({
    type: [
      {
        day: String,
        openTime: String,
        closeTime: String,
      },
    ],
    required: true,
  })
  schedule: {
    day: string;
    openTime: string;
    closeTime: string;
  }[];

  @Prop({
    type: [
      {
        itemId: String,
        name: String,
        description: String,
        price: Number,
        category: String,
        dietary: [String], // vegetarian, vegan, gluten-free
        available: Boolean,
      },
    ],
    default: [],
  })
  menu: {
    itemId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    dietary: string[];
    available: boolean;
  }[];

  @Prop({ default: true })
  acceptsReservations: boolean;

  @Prop({ default: 30 })
  reservationDurationMinutes: number;

  @Prop({ default: 25 })
  reservationPrice: number; // Precio de la reserva para paquetes

  @Prop({
    type: String,
    enum: ['OPEN', 'CLOSED', 'FULL'],
    default: 'OPEN',
  })
  status: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
