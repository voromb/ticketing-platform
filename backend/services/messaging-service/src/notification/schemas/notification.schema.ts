import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export enum NotificationCategory {
  PURCHASE = 'PURCHASE',
  APPROVAL = 'APPROVAL',
  SYSTEM = 'SYSTEM',
  GENERAL = 'GENERAL',
}

export enum UserType {
  USER = 'USER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Schema({ _id: false })
export class NotificationMetadata {
  @Prop()
  orderId?: string;

  @Prop()
  approvalId?: string;

  @Prop()
  resourceType?: string;

  @Prop()
  resourceId?: string;

  @Prop()
  actionUrl?: string;
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: String, enum: UserType, required: true })
  userType: UserType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: NotificationType, required: true })
  notificationType: NotificationType;

  @Prop({ type: String, enum: NotificationCategory, required: true })
  category: NotificationCategory;

  @Prop({ type: NotificationMetadata })
  metadata?: NotificationMetadata;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop()
  expiresAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índices para optimización
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ category: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
