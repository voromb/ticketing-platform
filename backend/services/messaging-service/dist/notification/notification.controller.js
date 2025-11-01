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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("./notification.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
let NotificationController = class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async createNotification(createNotificationDto) {
        return this.notificationService.createNotification(createNotificationDto);
    }
    async getNotifications(category, req) {
        const userId = req.user?.userId || 'test-user-id';
        return this.notificationService.getNotifications(userId, category);
    }
    async getUnreadCount(req) {
        const userId = req.user?.userId || 'test-user-id';
        return this.notificationService.getUnreadCount(userId);
    }
    async markAsRead(notificationId, req) {
        const userId = req.user?.userId || 'test-user-id';
        return this.notificationService.markAsRead(notificationId, userId);
    }
    async markAllAsRead(req) {
        const userId = req.user?.userId || 'test-user-id';
        return this.notificationService.markAllAsRead(userId);
    }
    async deleteNotification(notificationId, req) {
        const userId = req.user?.userId || 'test-user-id';
        return this.notificationService.deleteNotification(notificationId, userId);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una notificación (uso interno/admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notificación creada correctamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener notificaciones del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de notificaciones' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, type: String }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener contador de notificaciones no leídas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contador de no leídas' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':notificationId/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar notificación como leída' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificación marcada como leída' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    __param(0, (0, common_1.Param)('notificationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar todas las notificaciones como leídas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Todas las notificaciones marcadas como leídas' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':notificationId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar notificación' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Notificación eliminada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    __param(0, (0, common_1.Param)('notificationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map