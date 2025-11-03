"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderListener = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../rabbitmq.service");
const message_service_1 = require("../../message/message.service");
const notification_service_1 = require("../../notification/notification.service");
const message_schema_1 = require("../../message/schemas/message.schema");
const notification_schema_1 = require("../../notification/schemas/notification.schema");
let OrderListener = class OrderListener {
    rabbitMQService;
    messageService;
    notificationService;
    constructor(rabbitMQService, messageService, notificationService) {
        this.rabbitMQService = rabbitMQService;
        this.messageService = messageService;
        this.notificationService = notificationService;
    }
    async onModuleInit() {
        await this.rabbitMQService.subscribeToEvent('order.completed', 'messaging_order_completed', this.handleOrderCompleted.bind(this));
        await this.rabbitMQService.subscribeToEvent('payment.completed', 'messaging_payment_completed', this.handlePaymentCompleted.bind(this));
        await this.rabbitMQService.subscribeToEvent('order.cancelled', 'messaging_order_cancelled', this.handleOrderCancelled.bind(this));
    }
    async handleOrderCompleted(data) {
        try {
            const { orderId, userId, userName, eventName, totalAmount, ticketQuantity } = data;
            const messageContent = `¡Gracias por tu compra en Ticketing Master! 🎉\n\n` +
                `Has adquirido ${ticketQuantity} entrada(s) para ${eventName}.\n` +
                `Total: €${totalAmount}\n\n` +
                `Tu orden #${orderId} ha sido procesada exitosamente. ` +
                `Recibirás tus tickets por correo electrónico.`;
            await this.messageService.sendSystemMessage(userId, message_schema_1.SenderType.USER, messageContent, { orderId, eventName, actionType: 'PURCHASE' });
            await this.notificationService.createNotification({
                userId,
                userType: notification_schema_1.UserType.USER,
                title: '¡Compra exitosa!',
                message: `Has comprado ${ticketQuantity} entrada(s) para ${eventName}`,
                notificationType: notification_schema_1.NotificationType.SUCCESS,
                category: notification_schema_1.NotificationCategory.PURCHASE,
                metadata: { orderId, eventName, totalAmount },
            });
            console.log(`✅ Mensaje de agradecimiento enviado al usuario ${userId} por orden ${orderId}`);
        }
        catch (error) {
            console.error('❌ Error procesando order.completed:', error);
            throw error;
        }
    }
    async handlePaymentCompleted(data) {
        try {
            const { orderId, userId, amount, paymentMethod } = data;
            await this.notificationService.createNotification({
                userId,
                userType: notification_schema_1.UserType.USER,
                title: 'Pago confirmado',
                message: `Tu pago de €${amount} ha sido procesado correctamente`,
                notificationType: notification_schema_1.NotificationType.SUCCESS,
                category: notification_schema_1.NotificationCategory.PURCHASE,
                metadata: { orderId, amount, paymentMethod },
            });
            console.log(`✅ Notificación de pago enviada al usuario ${userId}`);
        }
        catch (error) {
            console.error('❌ Error procesando payment.completed:', error);
            throw error;
        }
    }
    async handleOrderCancelled(data) {
        try {
            const { orderId, userId, userName, reason } = data;
            const messageContent = `Tu orden #${orderId} ha sido cancelada.\n\n` +
                `Razón: ${reason || 'No especificada'}\n\n` +
                `Si tienes alguna pregunta, no dudes en contactarnos.`;
            await this.messageService.sendSystemMessage(userId, message_schema_1.SenderType.USER, messageContent, { orderId, actionType: 'INFO' });
            await this.notificationService.createNotification({
                userId,
                userType: notification_schema_1.UserType.USER,
                title: 'Orden cancelada',
                message: `Tu orden #${orderId} ha sido cancelada`,
                notificationType: notification_schema_1.NotificationType.WARNING,
                category: notification_schema_1.NotificationCategory.PURCHASE,
                metadata: { orderId, reason },
            });
            console.log(`✅ Notificación de cancelación enviada al usuario ${userId}`);
        }
        catch (error) {
            console.error('❌ Error procesando order.cancelled:', error);
            throw error;
        }
    }
};
exports.OrderListener = OrderListener;
exports.OrderListener = OrderListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        message_service_1.MessageService,
        notification_service_1.NotificationService])
], OrderListener);
//# sourceMappingURL=order.listener.js.map