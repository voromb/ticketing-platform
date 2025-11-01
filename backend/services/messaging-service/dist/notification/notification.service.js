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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./schemas/notification.schema");
const rabbitmq_service_1 = require("../rabbitmq/rabbitmq.service");
let NotificationService = class NotificationService {
    notificationModel;
    rabbitMQService;
    constructor(notificationModel, rabbitMQService) {
        this.notificationModel = notificationModel;
        this.rabbitMQService = rabbitMQService;
    }
    async createNotification(createNotificationDto) {
        const notification = new this.notificationModel(createNotificationDto);
        await notification.save();
        await this.rabbitMQService.publishEvent('notification.created', {
            notificationId: notification._id.toString(),
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
    async getNotifications(userId, category) {
        const filter = { userId };
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
    async getUnreadCount(userId) {
        const count = await this.notificationModel.countDocuments({
            userId,
            isRead: false,
        });
        return { unreadCount: count };
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationModel.findOne({
            _id: notificationId,
            userId,
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notificación no encontrada');
        }
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
        return { success: true, message: 'Notificación marcada como leída' };
    }
    async markAllAsRead(userId) {
        await this.notificationModel.updateMany({ userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } });
        return { success: true, message: 'Todas las notificaciones marcadas como leídas' };
    }
    async deleteNotification(notificationId, userId) {
        const result = await this.notificationModel.deleteOne({
            _id: notificationId,
            userId,
        });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Notificación no encontrada');
        }
        return { success: true, message: 'Notificación eliminada' };
    }
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        rabbitmq_service_1.RabbitMQService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map