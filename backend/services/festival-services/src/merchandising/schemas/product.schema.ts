import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  companyId: string; // ID de la compañía de merchandising

  @Prop({ required: true })
  companyName: string; // Nombre de la compañía

  @Prop({ required: true })
  region: string; // SPAIN, EUROPE

  @Prop({ required: true })
  managedBy: string; // Email del COMPANY_ADMIN

  @Prop({ type: Object })
  supplier: {
    name: string;
    contact: string;
    country: string;
  };

  @Prop()
  costPrice: number; // Precio de coste

  @Prop()
  margin: number; // Margen de beneficio (%)

  @Prop({ default: 'APPROVED' })
  approvalStatus: string; // PENDING/APPROVED/REJECTED

  @Prop()
  lastModifiedBy: string;

  @Prop()
  lastApprovedBy: string;

  @Prop()
  lastApprovedAt: Date;

  @Prop({ type: Object })
  shippingInfo: {
    weight: number;
    dimensions: string;
    shippingTime: number;
  };

  @Prop()
  festivalId: string;

  @Prop()
  bandId: string;

  @Prop()
  bandName: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: ['TSHIRT', 'HOODIE', 'VINYL', 'CD', 'POSTER', 'ACCESSORIES', 'OTHER'],
    required: true
  })
  type: string;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: [String],
    default: []
  })
  sizes: string[]; // ['S', 'M', 'L', 'XL', 'XXL'] para ropa

  @Prop({
    type: {
      total: Number,
      available: Number,
      reserved: Number
    },
    required: true
  })
  stock: {
    total: number;
    available: number;
    reserved: number;
  };

  @Prop({
    type: [String],
    default: []
  })
  images: string[];

  @Prop({ default: false })
  exclusive: boolean; // Producto exclusivo VIP

  @Prop({ default: false })
  preOrderEnabled: boolean;

  @Prop({ default: null })
  releaseDate: Date;

  @Prop({
    type: String,
    enum: ['AVAILABLE', 'OUT_OF_STOCK', 'PRE_ORDER', 'COMING_SOON'],
    default: 'AVAILABLE'
  })
  status: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  soldUnits: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);