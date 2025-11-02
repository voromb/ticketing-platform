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
exports.ApprovalMessageListener = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const message_service_1 = require("./message.service");
let ApprovalMessageListener = class ApprovalMessageListener {
    messageService;
    constructor(messageService) {
        this.messageService = messageService;
        console.log('✅ ApprovalMessageListener iniciado');
    }
    async handleApprovalRequested(data) {
        console.log('🔔 Enviando mensaje de solicitud de aprobación al SUPER_ADMIN');
        const { resourceType, resourceName, requestedBy, requestedByName, approvalId, metadata } = data;
        const superAdminId = await this.getSuperAdminId();
        if (!superAdminId) {
            console.warn('⚠️ No se encontró SUPER_ADMIN para enviar el mensaje');
            return;
        }
        const messageContent = this.buildApprovalRequestMessage(resourceType, resourceName, requestedByName, metadata);
        try {
            await this.messageService.sendDetailedSystemMessage({
                recipientId: superAdminId,
                recipientType: 'SUPER_ADMIN',
                recipientName: 'Super Admin',
                senderId: 'SYSTEM',
                senderType: 'SYSTEM',
                senderName: 'Sistema de Aprobaciones',
                content: messageContent,
                subject: `Nueva solicitud de aprobación: ${resourceType}`,
                messageType: 'APPROVAL_REQUEST',
                metadata: {
                    approvalId,
                    resourceType,
                    resourceName,
                    requestedBy,
                    requestedByName,
                },
            });
            console.log('✅ Mensaje de solicitud enviado al SUPER_ADMIN');
        }
        catch (error) {
            console.error('❌ Error enviando mensaje de solicitud:', error);
        }
    }
    async handleApprovalGranted(data) {
        console.log('✅ Enviando mensaje de aprobación al COMPANY_ADMIN');
        const { resourceType, resourceName, approvedBy, approvedByName, requestedBy, requestedByName } = data;
        const icon = this.getResourceIcon(resourceType);
        const typeLabel = this.getResourceTypeLabel(resourceType);
        const messageContent = `✅ SOLICITUD APROBADA\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `${icon} ${typeLabel}: ${resourceName}\n` +
            `👤 Aprobado por: ${approvedByName}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🎉 ¡Felicidades! Tu recurso ya está disponible y activo en el sistema.`;
        try {
            await this.messageService.sendDetailedSystemMessage({
                recipientId: requestedBy,
                recipientType: 'COMPANY_ADMIN',
                recipientName: requestedByName,
                senderId: 'SYSTEM',
                senderType: 'SYSTEM',
                senderName: 'Sistema de Aprobaciones',
                content: messageContent,
                subject: `Solicitud aprobada: ${resourceType}`,
                messageType: 'APPROVAL_GRANTED',
                metadata: {
                    resourceType,
                    resourceName,
                    approvedBy,
                    approvedByName,
                },
            });
            console.log('✅ Mensaje de aprobación enviado al COMPANY_ADMIN');
        }
        catch (error) {
            console.error('❌ Error enviando mensaje de aprobación:', error);
        }
    }
    async handleApprovalRejected(data) {
        console.log('❌ Enviando mensaje de rechazo al COMPANY_ADMIN');
        const { resourceType, resourceName, rejectedBy, rejectedByName, requestedBy, requestedByName, reason } = data;
        const icon = this.getResourceIcon(resourceType);
        const typeLabel = this.getResourceTypeLabel(resourceType);
        const messageContent = `❌ SOLICITUD RECHAZADA\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `${icon} ${typeLabel}: ${resourceName}\n` +
            `👤 Rechazado por: ${rejectedByName}\n` +
            `💬 Motivo: ${reason || 'No se especificó un motivo'}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `📝 Por favor, revisa los detalles y vuelve a intentarlo.`;
        try {
            await this.messageService.sendDetailedSystemMessage({
                recipientId: requestedBy,
                recipientType: 'COMPANY_ADMIN',
                recipientName: requestedByName,
                senderId: 'SYSTEM',
                senderType: 'SYSTEM',
                senderName: 'Sistema de Aprobaciones',
                content: messageContent,
                subject: `Solicitud rechazada: ${resourceType}`,
                messageType: 'APPROVAL_REJECTED',
                metadata: {
                    resourceType,
                    resourceName,
                    rejectedBy,
                    rejectedByName,
                    reason,
                },
            });
            console.log('✅ Mensaje de rechazo enviado al COMPANY_ADMIN');
        }
        catch (error) {
            console.error('❌ Error enviando mensaje de rechazo:', error);
        }
    }
    buildApprovalRequestMessage(resourceType, resourceName, requestedByName, metadata) {
        const typeLabel = this.getResourceTypeLabel(resourceType);
        const icon = this.getResourceIcon(resourceType);
        let message = `${icon} NUEVA SOLICITUD DE APROBACIÓN\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `📋 Tipo: ${typeLabel}\n`;
        message += `🏷️ Nombre: ${resourceName}\n`;
        message += `👤 Solicitado por: ${requestedByName}\n`;
        if (metadata?.region) {
            message += `🌍 Región: ${metadata.region}\n`;
        }
        if (metadata) {
            message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            if (resourceType === 'PRODUCT') {
                message += `💰 Precio: ${metadata.price || 'N/A'}€\n`;
                if (metadata.stock?.total) {
                    message += `📦 Stock: ${metadata.stock.total} unidades\n`;
                }
            }
            else if (resourceType === 'TRIP') {
                message += `🚌 Capacidad: ${metadata.capacity || 'N/A'} personas\n`;
                if (metadata.vehicleType) {
                    message += `🚗 Tipo de vehículo: ${metadata.vehicleType}\n`;
                }
            }
            else if (resourceType === 'RESTAURANT') {
                message += `🪑 Capacidad: ${metadata.capacity || 'N/A'} personas\n`;
                if (metadata.cuisine) {
                    message += `🍽️ Cocina: ${metadata.cuisine}\n`;
                }
            }
        }
        message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += `⚠️ Por favor, revisa y aprueba o rechaza esta solicitud en el panel de aprobaciones.`;
        return message;
    }
    getResourceIcon(resourceType) {
        const icons = {
            RESTAURANT: '🍽️',
            TRIP: '✈️',
            PRODUCT: '🛍️',
        };
        return icons[resourceType] || '📦';
    }
    getResourceTypeLabel(resourceType) {
        const labels = {
            RESTAURANT: 'Restaurante',
            TRIP: 'Viaje',
            PRODUCT: 'Producto',
        };
        return labels[resourceType] || resourceType;
    }
    async getSuperAdminId() {
        return '26fa8809-a1a4-4242-9d09-42e65e5ee368';
    }
};
exports.ApprovalMessageListener = ApprovalMessageListener;
__decorate([
    (0, microservices_1.EventPattern)('approval.requested'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovalMessageListener.prototype, "handleApprovalRequested", null);
__decorate([
    (0, microservices_1.EventPattern)('approval.granted'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovalMessageListener.prototype, "handleApprovalGranted", null);
__decorate([
    (0, microservices_1.EventPattern)('approval.rejected'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApprovalMessageListener.prototype, "handleApprovalRejected", null);
exports.ApprovalMessageListener = ApprovalMessageListener = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [message_service_1.MessageService])
], ApprovalMessageListener);
//# sourceMappingURL=approval-message.listener.js.map