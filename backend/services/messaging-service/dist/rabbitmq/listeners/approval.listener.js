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
exports.ApprovalListener = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../rabbitmq.service");
const message_service_1 = require("../../message/message.service");
const notification_service_1 = require("../../notification/notification.service");
const message_schema_1 = require("../../message/schemas/message.schema");
const notification_schema_1 = require("../../notification/schemas/notification.schema");
let ApprovalListener = class ApprovalListener {
    rabbitMQService;
    messageService;
    notificationService;
    constructor(rabbitMQService, messageService, notificationService) {
        this.rabbitMQService = rabbitMQService;
        this.messageService = messageService;
        this.notificationService = notificationService;
    }
    async onModuleInit() {
        await this.rabbitMQService.subscribeToEvent('approval.requested', 'messaging_approval_requested', this.handleApprovalRequested.bind(this));
        await this.rabbitMQService.subscribeToEvent('approval.granted', 'messaging_approval_granted', this.handleApprovalGranted.bind(this));
        await this.rabbitMQService.subscribeToEvent('approval.rejected', 'messaging_approval_rejected', this.handleApprovalRejected.bind(this));
    }
    async handleApprovalRequested(data) {
        try {
            const { approvalId, resourceType, resourceName, companyAdminId, companyAdminName, companyName, priority, } = data;
            const resourceTypeText = this.getResourceTypeText(resourceType);
            const messageContent = `Nueva solicitud de aprobación pendiente 📋\n\n` +
                `Tipo: ${resourceTypeText}\n` +
                `Nombre: ${resourceName}\n` +
                `Empresa: ${companyName}\n` +
                `Solicitado por: ${companyAdminName}\n` +
                `Prioridad: ${priority}\n\n` +
                `Por favor, revisa y aprueba/rechaza esta solicitud.`;
            const superAdminId = 'super-admin-id';
            await this.messageService.sendSystemMessage(superAdminId, message_schema_1.SenderType.SUPER_ADMIN, messageContent, { approvalId, resourceType, resourceId: data.resourceId, actionType: 'APPROVAL' });
            await this.notificationService.createNotification({
                userId: superAdminId,
                userType: notification_schema_1.UserType.SUPER_ADMIN,
                title: `Nueva solicitud: ${resourceTypeText}`,
                message: `${companyName} solicita aprobación para "${resourceName}"`,
                notificationType: notification_schema_1.NotificationType.INFO,
                category: notification_schema_1.NotificationCategory.APPROVAL,
                metadata: {
                    approvalId,
                    resourceType,
                    resourceId: data.resourceId,
                    actionUrl: `/admin/approvals/${approvalId}`,
                },
            });
            console.log(`✅ Notificación de aprobación enviada a SUPER_ADMIN para ${resourceType}`);
        }
        catch (error) {
            console.error('❌ Error procesando approval.requested:', error);
            throw error;
        }
    }
    async handleApprovalGranted(data) {
        try {
            const { approvalId, resourceType, resourceName, companyAdminId, reviewedBy } = data;
            const resourceTypeText = this.getResourceTypeText(resourceType);
            const messageContent = `¡Felicidades! Tu solicitud ha sido aprobada ✅\n\n` +
                `Tipo: ${resourceTypeText}\n` +
                `Nombre: ${resourceName}\n` +
                `Aprobado por: ${reviewedBy}\n\n` +
                `Tu ${resourceTypeText.toLowerCase()} ya está disponible en el sistema.`;
            await this.messageService.sendSystemMessage(companyAdminId, message_schema_1.SenderType.COMPANY_ADMIN, messageContent, { approvalId, resourceType, resourceId: data.resourceId, actionType: 'APPROVAL' });
            await this.notificationService.createNotification({
                userId: companyAdminId,
                userType: notification_schema_1.UserType.COMPANY_ADMIN,
                title: '¡Solicitud aprobada!',
                message: `Tu ${resourceTypeText.toLowerCase()} "${resourceName}" ha sido aprobado`,
                notificationType: notification_schema_1.NotificationType.SUCCESS,
                category: notification_schema_1.NotificationCategory.APPROVAL,
                metadata: { approvalId, resourceType, resourceId: data.resourceId },
            });
            console.log(`✅ Notificación de aprobación enviada a COMPANY_ADMIN ${companyAdminId}`);
        }
        catch (error) {
            console.error('❌ Error procesando approval.granted:', error);
            throw error;
        }
    }
    async handleApprovalRejected(data) {
        try {
            const { approvalId, resourceType, resourceName, companyAdminId, reviewedBy, rejectionReason, } = data;
            const resourceTypeText = this.getResourceTypeText(resourceType);
            const messageContent = `Tu solicitud ha sido rechazada ❌\n\n` +
                `Tipo: ${resourceTypeText}\n` +
                `Nombre: ${resourceName}\n` +
                `Revisado por: ${reviewedBy}\n` +
                `Razón: ${rejectionReason || 'No especificada'}\n\n` +
                `Por favor, revisa los comentarios y realiza los ajustes necesarios.`;
            await this.messageService.sendSystemMessage(companyAdminId, message_schema_1.SenderType.COMPANY_ADMIN, messageContent, { approvalId, resourceType, resourceId: data.resourceId, actionType: 'REJECTION' });
            await this.notificationService.createNotification({
                userId: companyAdminId,
                userType: notification_schema_1.UserType.COMPANY_ADMIN,
                title: 'Solicitud rechazada',
                message: `Tu ${resourceTypeText.toLowerCase()} "${resourceName}" ha sido rechazado`,
                notificationType: notification_schema_1.NotificationType.ERROR,
                category: notification_schema_1.NotificationCategory.APPROVAL,
                metadata: {
                    approvalId,
                    resourceType,
                    resourceId: data.resourceId,
                    rejectionReason,
                },
            });
            console.log(`✅ Notificación de rechazo enviada a COMPANY_ADMIN ${companyAdminId}`);
        }
        catch (error) {
            console.error('❌ Error procesando approval.rejected:', error);
            throw error;
        }
    }
    getResourceTypeText(resourceType) {
        const types = {
            RESTAURANT: 'Restaurante',
            TRAVEL: 'Viaje',
            PRODUCT: 'Producto',
        };
        return types[resourceType] || resourceType;
    }
};
exports.ApprovalListener = ApprovalListener;
exports.ApprovalListener = ApprovalListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        message_service_1.MessageService,
        notification_service_1.NotificationService])
], ApprovalListener);
//# sourceMappingURL=approval.listener.js.map