import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export enum ConversationType {
  PRIVATE = 'PRIVATE',
  SUPPORT = 'SUPPORT',
  SYSTEM = 'SYSTEM',
}

export enum UserType {
  USER = 'USER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Schema({ _id: false })
export class Participant {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: String, enum: UserType, required: true })
  userType: UserType;

  @Prop({ required: true })
  userName: string;

  @Prop()
  lastReadAt?: Date;
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [Participant], required: true })
  participants: Participant[];

  @Prop({ type: String, enum: ConversationType, default: ConversationType.PRIVATE })
  conversationType: ConversationType;

  @Prop()
  subject?: string;

  @Prop({ required: true })
  lastMessageAt: Date;

  @Prop({ required: true })
  lastMessagePreview: string;

  @Prop({ type: Map, of: Number, default: {} })
  unreadCount: Map<string, number>;

  @Prop({ default: true })
  isActive: boolean;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Índices para optimización
ConversationSchema.index({ 'participants.userId': 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ isActive: 1 });
