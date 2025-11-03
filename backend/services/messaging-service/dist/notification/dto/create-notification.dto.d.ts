import { NotificationType, NotificationCategory, UserType } from '../schemas/notification.schema';
export declare class CreateNotificationDto {
    userId: string;
    userType: UserType;
    title: string;
    message: string;
    notificationType: NotificationType;
    category: NotificationCategory;
    metadata?: any;
    expiresAt?: Date;
}
