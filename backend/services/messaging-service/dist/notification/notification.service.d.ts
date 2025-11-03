import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
export declare class NotificationService {
    private notificationModel;
    private rabbitMQService;
    constructor(notificationModel: Model<NotificationDocument>, rabbitMQService: RabbitMQService);
    createNotification(createNotificationDto: CreateNotificationDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    getNotifications(userId: string, category?: string): Promise<{
        notifications: (import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        unreadCount: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    cleanOldNotifications(): Promise<number>;
}
