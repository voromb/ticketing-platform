import { Document } from 'mongoose';
export type ConversationDocument = Conversation & Document;
export declare enum ConversationType {
    PRIVATE = "PRIVATE",
    SUPPORT = "SUPPORT",
    SYSTEM = "SYSTEM"
}
export declare enum UserType {
    USER = "USER",
    COMPANY_ADMIN = "COMPANY_ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare class Participant {
    userId: string;
    userType: UserType;
    userName: string;
    lastReadAt?: Date;
}
export declare class Conversation {
    participants: Participant[];
    conversationType: ConversationType;
    subject?: string;
    lastMessageAt: Date;
    lastMessagePreview: string;
    unreadCount: Map<string, number>;
    isActive: boolean;
}
export declare const ConversationSchema: import("mongoose").Schema<Conversation, import("mongoose").Model<Conversation, any, any, any, Document<unknown, any, Conversation, any, {}> & Conversation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Conversation, Document<unknown, {}, import("mongoose").FlatRecord<Conversation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Conversation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
