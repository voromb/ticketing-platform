import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: false })
  size?: string; // Para productos con tallas

  @Prop({ required: true, min: 0 })
  unitPrice: number; // Precio al momento de añadir al carrito

  @Prop({ required: true, min: 0 })
  totalPrice: number; // quantity * unitPrice
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  @Prop({ required: true, default: 0, min: 0 })
  totalAmount: number;

  @Prop({ required: true, default: 0, min: 0 })
  totalItems: number;

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop({ required: false })
  couponCode?: string;

  @Prop({ required: false, default: 0 })
  discount?: number;

  @Prop({ required: false, default: 0 })
  finalAmount?: number; // totalAmount - discount
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Índices para optimización
CartSchema.index({ userId: 1 }, { unique: true }); // Un carrito por usuario
CartSchema.index({ lastUpdated: 1 }); // Para limpiar carritos antiguos
