import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    createNotification(createNotificationDto: CreateNotificationDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").NotificationDocument, {}, {}> & import("./schemas/notification.schema").Notification & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    getNotifications(category: string, req: any): Promise<{
        notifications: (import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").NotificationDocument, {}, {}> & import("./schemas/notification.schema").Notification & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        unreadCount: number;
    }>;
    getUnreadCount(req: any): Promise<{
        unreadCount: number;
    }>;
    markAsRead(notificationId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteNotification(notificationId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
