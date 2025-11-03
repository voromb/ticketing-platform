import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private rabbitMQService: RabbitMQService,
  ) {}

  /**
   * Crear una notificación
   */
  async createNotification(createNotificationDto: CreateNotificationDto) {
    const notification = new this.notificationModel(createNotificationDto);
    await notification.save();

    // Publicar evento
    await this.rabbitMQService.publishEvent('notification.created', {
      notificationId: (notification._id as any).toString(),
      userId: notification.userId,
      notificationType: notification.notificationType,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: 'Notificación creada correctamente',
      data: notification,
    };
  }

  /**
   * Obtener notificaciones de un usuario
   */
  async getNotifications(userId: string, category?: string) {
    const filter: any = { userId };
    if (category) {
      filter.category = category;
    }

    const notifications = await this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    const unreadCount = await this.notificationModel.countDocuments({
      userId,
      isRead: false,
    });

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({
      userId,
      isRead: false,
    });

    return { unreadCount: count };
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return { success: true, message: 'Notificación marcada como leída' };
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );

    return { success: true, message: 'Todas las notificaciones marcadas como leídas' };
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(notificationId: string, userId: string) {
    const result = await this.notificationModel.deleteOne({
      _id: notificationId,
      userId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return { success: true, message: 'Notificación eliminada' };
  }

  /**
   * Limpiar notificaciones antiguas (más de 30 días)
   */
  async cleanOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true,
    });

    console.log(`🧹 Limpieza automática: ${result.deletedCount} notificaciones eliminadas`);
    return result.deletedCount;
  }
}
