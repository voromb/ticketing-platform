import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { MessageService } from '../../message/message.service';
import { NotificationService } from '../../notification/notification.service';
import { SenderType } from '../../message/schemas/message.schema';
import {
  NotificationType,
  NotificationCategory,
  UserType,
} from '../../notification/schemas/notification.schema';

@Injectable()
export class OrderListener implements OnModuleInit {
  constructor(
    private rabbitMQService: RabbitMQService,
    private messageService: MessageService,
    private notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    // Escuchar evento de orden completada
    await this.rabbitMQService.subscribeToEvent(
      'order.completed',
      'messaging_order_completed',
      this.handleOrderCompleted.bind(this),
    );

    // Escuchar evento de pago completado
    await this.rabbitMQService.subscribeToEvent(
      'payment.completed',
      'messaging_payment_completed',
      this.handlePaymentCompleted.bind(this),
    );

    // Escuchar evento de orden cancelada
    await this.rabbitMQService.subscribeToEvent(
      'order.cancelled',
      'messaging_order_cancelled',
      this.handleOrderCancelled.bind(this),
    );
  }

  /**
   * Manejar orden completada - Enviar mensaje de agradecimiento
   */
  private async handleOrderCompleted(data: any) {
    try {
      const { orderId, userId, userName, eventName, totalAmount, ticketQuantity } = data;

      // Crear mensaje del sistema
      const messageContent = `¡Gracias por tu compra en Ticketing Master! 🎉\n\n` +
        `Has adquirido ${ticketQuantity} entrada(s) para ${eventName}.\n` +
        `Total: €${totalAmount}\n\n` +
        `Tu orden #${orderId} ha sido procesada exitosamente. ` +
        `Recibirás tus tickets por correo electrónico.`;

      await this.messageService.sendSystemMessage(
        userId,
        SenderType.USER,
        messageContent,
        { orderId, eventName, actionType: 'PURCHASE' },
      );

      // Crear notificación
      await this.notificationService.createNotification({
        userId,
        userType: UserType.USER,
        title: '¡Compra exitosa!',
        message: `Has comprado ${ticketQuantity} entrada(s) para ${eventName}`,
        notificationType: NotificationType.SUCCESS,
        category: NotificationCategory.PURCHASE,
        metadata: { orderId, eventName, totalAmount },
      });

      console.log(`✅ Mensaje de agradecimiento enviado al usuario ${userId} por orden ${orderId}`);
    } catch (error) {
      console.error('❌ Error procesando order.completed:', error);
      throw error;
    }
  }

  /**
   * Manejar pago completado - Confirmación de pago
   */
  private async handlePaymentCompleted(data: any) {
    try {
      const { orderId, userId, amount, paymentMethod } = data;

      // Crear notificación de pago
      await this.notificationService.createNotification({
        userId,
        userType: UserType.USER,
        title: 'Pago confirmado',
        message: `Tu pago de €${amount} ha sido procesado correctamente`,
        notificationType: NotificationType.SUCCESS,
        category: NotificationCategory.PURCHASE,
        metadata: { orderId, amount, paymentMethod },
      });

      console.log(`✅ Notificación de pago enviada al usuario ${userId}`);
    } catch (error) {
      console.error('❌ Error procesando payment.completed:', error);
      throw error;
    }
  }

  /**
   * Manejar orden cancelada
   */
  private async handleOrderCancelled(data: any) {
    try {
      const { orderId, userId, userName, reason } = data;

      // Crear mensaje del sistema
      const messageContent = `Tu orden #${orderId} ha sido cancelada.\n\n` +
        `Razón: ${reason || 'No especificada'}\n\n` +
        `Si tienes alguna pregunta, no dudes en contactarnos.`;

      await this.messageService.sendSystemMessage(
        userId,
        SenderType.USER,
        messageContent,
        { orderId, actionType: 'INFO' },
      );

      // Crear notificación
      await this.notificationService.createNotification({
        userId,
        userType: UserType.USER,
        title: 'Orden cancelada',
        message: `Tu orden #${orderId} ha sido cancelada`,
        notificationType: NotificationType.WARNING,
        category: NotificationCategory.PURCHASE,
        metadata: { orderId, reason },
      });

      console.log(`✅ Notificación de cancelación enviada al usuario ${userId}`);
    } catch (error) {
      console.error('❌ Error procesando order.cancelled:', error);
      throw error;
    }
  }
}
