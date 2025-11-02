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
exports.MessageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const message_service_1 = require("./message.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const get_messages_dto_1 = require("./dto/get-messages.dto");
let MessageController = class MessageController {
    messageService;
    constructor(messageService) {
        this.messageService = messageService;
    }
    async sendMessage(createMessageDto, req) {
        try {
            console.log('🔍 Headers recibidos:', req.headers);
            const senderId = req.headers['x-user-id'] || req.headers['xuserid'] || req.user?.userId || 'test-user-id';
            const senderType = req.headers['x-user-type'] || req.headers['xusertype'] || req.user?.userType || 'USER';
            const senderName = req.headers['x-user-name'] || req.headers['xusername'] || req.user?.userName || 'Usuario Test';
            console.log('🔍 Datos extraídos:', { senderId, senderType, senderName });
            console.log('📨 Enviando mensaje:', {
                senderId,
                senderType,
                senderName,
                recipientId: createMessageDto.recipientId,
                recipientType: createMessageDto.recipientType,
                content: createMessageDto.content.substring(0, 50) + '...'
            });
            const result = await this.messageService.sendMessage(createMessageDto, senderId, senderType, senderName);
            console.log('✅ Mensaje enviado exitosamente');
            return result;
        }
        catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            throw error;
        }
    }
    async getConversations(req) {
        const userId = req.headers['x-user-id'] || req.user?.userId || 'test-user-id';
        console.log('📋 Obteniendo conversaciones para userId:', userId);
        return this.messageService.getConversations(userId);
    }
    async getMessages(conversationId, query, req) {
        const userId = req.headers['x-user-id'] || req.user?.userId || 'test-user-id';
        console.log('💬 Obteniendo mensajes de conversación:', conversationId, 'para userId:', userId);
        return this.messageService.getMessages(conversationId, userId, query);
    }
    async markAsRead(messageId, req) {
        const userId = req.headers['x-user-id'] || req.user?.userId || 'test-user-id';
        return this.messageService.markAsRead(messageId, userId);
    }
    async markConversationAsRead(conversationId, req) {
        const userId = req.headers['x-user-id'] || req.user?.userId || 'test-user-id';
        return this.messageService.markConversationAsRead(conversationId, userId);
    }
    async deleteConversation(conversationId, req) {
        const userId = req.headers['x-user-id'] || req.user?.userId || 'test-user-id';
        return this.messageService.deleteConversation(conversationId, userId);
    }
};
exports.MessageController = MessageController;
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar un mensaje manual' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mensaje enviado correctamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las conversaciones del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de conversaciones' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mensajes de una conversación' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensajes de la conversación' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversación no encontrada' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_messages_dto_1.GetMessagesDto, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Patch)(':messageId/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar mensaje como leído' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensaje marcado como leído' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Mensaje no encontrado' }),
    __param(0, (0, common_1.Param)('messageId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('conversations/:conversationId/read-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar toda la conversación como leída' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversación marcada como leída' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversación no encontrada' }),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "markConversationAsRead", null);
__decorate([
    (0, common_1.Delete)('conversations/:conversationId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar conversación (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Conversación eliminada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversación no encontrada' }),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "deleteConversation", null);
exports.MessageController = MessageController = __decorate([
    (0, swagger_1.ApiTags)('messages'),
    (0, common_1.Controller)('messages'),
    __metadata("design:paramtypes", [message_service_1.MessageService])
], MessageController);
//# sourceMappingURL=message.controller.js.map