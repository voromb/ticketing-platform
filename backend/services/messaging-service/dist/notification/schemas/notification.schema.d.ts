import { Document } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare enum NotificationType {
    SUCCESS = "SUCCESS",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
}
export declare enum NotificationCategory {
    PURCHASE = "PURCHASE",
    APPROVAL = "APPROVAL",
    SYSTEM = "SYSTEM",
    GENERAL = "GENERAL"
}
export declare enum UserType {
    USER = "USER",
    COMPANY_ADMIN = "COMPANY_ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare class NotificationMetadata {
    orderId?: string;
    approvalId?: string;
    resourceType?: string;
    resourceId?: string;
    actionUrl?: string;
}
export declare class Notification {
    userId: string;
    userType: UserType;
    title: string;
    message: string;
    notificationType: NotificationType;
    category: NotificationCategory;
    metadata?: NotificationMetadata;
    isRead: boolean;
    readAt?: Date;
    expiresAt?: Date;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any, {}> & Notification & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Notification> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
