import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REQUIRES_APPROVAL = 'REQUIRES_APPROVAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string; // Snapshot del nombre al momento del pedido

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: false })
  size?: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  totalPrice: number;

  @Prop({ required: false })
  productImage?: string; // Snapshot de la imagen
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class ShippingAddress {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: false })
  phone?: string;
}

export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  orderNumber: string; // Número único del pedido (ej: ORD-2025-001234)

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: false, default: 0 })
  discount: number;

  @Prop({ required: false, default: 0 })
  shippingCost: number;

  @Prop({ required: false, default: 0 })
  taxes: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.PENDING 
  })
  status: OrderStatus;

  @Prop({ 
    type: String, 
    enum: Object.values(PaymentStatus), 
    default: PaymentStatus.PENDING 
  })
  paymentStatus: PaymentStatus;

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ required: false })
  couponCode?: string;

  @Prop({ required: false })
  approvalId?: string;

  @Prop({ required: false })
  trackingNumber?: string;

  @Prop({ required: false })
  estimatedDelivery?: Date;

  @Prop({ required: false })
  deliveredAt?: Date;

  @Prop({ required: false })
  cancelledAt?: Date;

  @Prop({ required: false })
  cancellationReason?: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Índices para optimización
OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 }); // Para ordenar por fecha
