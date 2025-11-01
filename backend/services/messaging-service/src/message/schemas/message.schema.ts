import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

export enum SenderType {
  USER = 'USER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  SYSTEM = 'SYSTEM',
}

export enum MessageType {
  TEXT = 'TEXT',
  NOTIFICATION = 'NOTIFICATION',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export enum ActionType {
  PURCHASE = 'PURCHASE',
  APPROVAL = 'APPROVAL',
  REJECTION = 'REJECTION',
  INFO = 'INFO',
}

export enum ResourceType {
  RESTAURANT = 'RESTAURANT',
  TRAVEL = 'TRAVEL',
  PRODUCT = 'PRODUCT',
}

@Schema({ _id: false })
export class MessageMetadata {
  @Prop()
  orderId?: string;

  @Prop()
  approvalId?: string;

  @Prop({ type: String, enum: ResourceType })
  resourceType?: ResourceType;

  @Prop()
  resourceId?: string;

  @Prop({ type: String, enum: ActionType })
  actionType?: ActionType;
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  senderId: string;

  @Prop({ type: String, enum: SenderType, required: true })
  senderType: SenderType;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String, enum: MessageType, default: MessageType.TEXT })
  messageType: MessageType;

  @Prop({ type: MessageMetadata })
  metadata?: MessageMetadata;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Índices para optimización
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ isRead: 1 });
