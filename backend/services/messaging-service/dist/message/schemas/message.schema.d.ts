import { Document, Types } from 'mongoose';
export type MessageDocument = Message & Document;
export declare enum SenderType {
    USER = "USER",
    COMPANY_ADMIN = "COMPANY_ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
    SYSTEM = "SYSTEM"
}
export declare enum MessageType {
    TEXT = "TEXT",
    NOTIFICATION = "NOTIFICATION",
    SYSTEM_ALERT = "SYSTEM_ALERT"
}
export declare enum ActionType {
    PURCHASE = "PURCHASE",
    APPROVAL = "APPROVAL",
    REJECTION = "REJECTION",
    INFO = "INFO"
}
export declare enum ResourceType {
    RESTAURANT = "RESTAURANT",
    TRAVEL = "TRAVEL",
    PRODUCT = "PRODUCT"
}
export declare class MessageMetadata {
    orderId?: string;
    approvalId?: string;
    resourceType?: ResourceType;
    resourceId?: string;
    actionType?: ActionType;
}
export declare class Message {
    conversationId: Types.ObjectId;
    senderId: string;
    senderType: SenderType;
    senderName: string;
    content: string;
    messageType: MessageType;
    metadata?: MessageMetadata;
    isRead: boolean;
    readAt?: Date;
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, Document<unknown, any, Message, any, {}> & Message & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, import("mongoose").FlatRecord<Message>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Message> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
