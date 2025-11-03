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
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
const conversation_schema_1 = require("./schemas/conversation.schema");
const rabbitmq_service_1 = require("../rabbitmq/rabbitmq.service");
let MessageService = class MessageService {
    messageModel;
    conversationModel;
    rabbitMQService;
    constructor(messageModel, conversationModel, rabbitMQService) {
        this.messageModel = messageModel;
        this.conversationModel = conversationModel;
        this.rabbitMQService = rabbitMQService;
    }
    async sendMessage(createMessageDto, senderId, senderType, senderName) {
        try {
            const { recipientId, recipientType, recipientName, content, subject, messageType, metadata } = createMessageDto;
            console.log('🔍 Buscando o creando conversación...');
            let conversation = await this.findOrCreateConversation(senderId, senderType, senderName, recipientId, recipientType, recipientName || 'Usuario', subject);
            console.log('✅ Conversación encontrada/creada:', conversation._id);
            const message = new this.messageModel({
                conversationId: conversation._id,
                senderId,
                senderType,
                senderName,
                content,
                messageType: messageType || message_schema_1.MessageType.TEXT,
                metadata,
                isRead: false,
            });
            await message.save();
            console.log('✅ Mensaje guardado:', message._id);
            conversation.lastMessageAt = new Date();
            conversation.lastMessagePreview = content.substring(0, 100);
            const currentUnread = conversation.unreadCount.get(recipientId) || 0;
            conversation.unreadCount.set(recipientId, currentUnread + 1);
            await conversation.save();
            console.log('✅ Conversación actualizada');
            try {
                await this.rabbitMQService.publishEvent('message.sent', {
                    messageId: message._id.toString(),
                    conversationId: conversation._id.toString(),
                    recipientId,
                    recipientType,
                    sentAt: new Date(),
                });
                console.log('✅ Evento publicado en RabbitMQ');
            }
            catch (rabbitError) {
                console.warn('⚠️ Error publicando evento en RabbitMQ (no crítico):', rabbitError);
            }
            return {
                success: true,
                message: 'Mensaje enviado correctamente',
                data: message,
            };
        }
        catch (error) {
            console.error('❌ Error en sendMessage:', error);
            throw error;
        }
    }
    async getConversations(userId) {
        const conversations = await this.conversationModel
            .find({
            'participants.userId': userId,
            isActive: true,
        })
            .sort({ lastMessageAt: -1 })
            .exec();
        return conversations.map((conv) => ({
            conversationId: conv._id,
            participants: conv.participants,
            conversationType: conv.conversationType,
            subject: conv.subject,
            lastMessageAt: conv.lastMessageAt,
            lastMessagePreview: conv.lastMessagePreview,
            unreadCount: conv.unreadCount.get(userId) || 0,
        }));
    }
    async getMessages(conversationId, userId, query) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversación no encontrada');
        }
        const isParticipant = conversation.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            throw new common_1.BadRequestException('No tienes acceso a esta conversación');
        }
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const messages = await this.messageModel
            .find({ conversationId: new mongoose_2.Types.ObjectId(conversationId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.messageModel.countDocuments({
            conversationId: new mongoose_2.Types.ObjectId(conversationId),
        });
        return {
            conversation,
            messages: messages.reverse(),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async markAsRead(messageId, userId) {
        const message = await this.messageModel.findById(messageId);
        if (!message) {
            throw new common_1.NotFoundException('Mensaje no encontrado');
        }
        const conversation = await this.conversationModel.findById(message.conversationId);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversación no encontrada');
        }
        const isRecipient = conversation.participants.some((p) => p.userId === userId && p.userId !== message.senderId);
        if (!isRecipient) {
            throw new common_1.BadRequestException('No puedes marcar este mensaje como leído');
        }
        message.isRead = true;
        message.readAt = new Date();
        await message.save();
        const currentUnread = conversation.unreadCount.get(userId) || 0;
        if (currentUnread > 0) {
            conversation.unreadCount.set(userId, currentUnread - 1);
            await conversation.save();
        }
        return { success: true, message: 'Mensaje marcado como leído' };
    }
    async markConversationAsRead(conversationId, userId) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversación no encontrada');
        }
        await this.messageModel.updateMany({
            conversationId: new mongoose_2.Types.ObjectId(conversationId),
            isRead: false,
            senderId: { $ne: userId },
        }, {
            $set: { isRead: true, readAt: new Date() },
        });
        conversation.unreadCount.set(userId, 0);
        await conversation.save();
        return { success: true, message: 'Conversación marcada como leída' };
    }
    async deleteConversation(conversationId, userId) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) {
            throw new common_1.NotFoundException('Conversación no encontrada');
        }
        const isParticipant = conversation.participants.some((p) => p.userId === userId);
        if (!isParticipant) {
            throw new common_1.BadRequestException('No tienes acceso a esta conversación');
        }
        conversation.isActive = false;
        await conversation.save();
        return { success: true, message: 'Conversación eliminada' };
    }
    async findOrCreateConversation(user1Id, user1Type, user1Name, user2Id, user2Type, user2Name, subject) {
        const existingConversation = await this.conversationModel.findOne({
            'participants.userId': { $all: [user1Id, user2Id] },
            isActive: true,
        });
        if (existingConversation) {
            return existingConversation;
        }
        const participants = [
            { userId: user1Id, userType: user1Type, userName: user1Name },
            { userId: user2Id, userType: user2Type, userName: user2Name },
        ];
        let conversationType = conversation_schema_1.ConversationType.PRIVATE;
        if (user1Type === message_schema_1.SenderType.SYSTEM || user2Type === message_schema_1.SenderType.SYSTEM) {
            conversationType = conversation_schema_1.ConversationType.SYSTEM;
        }
        else if (user1Type === message_schema_1.SenderType.SUPER_ADMIN || user2Type === message_schema_1.SenderType.SUPER_ADMIN) {
            conversationType = conversation_schema_1.ConversationType.SUPPORT;
        }
        const conversation = new this.conversationModel({
            participants,
            conversationType,
            subject: subject || 'Nueva conversación',
            lastMessageAt: new Date(),
            lastMessagePreview: 'Conversación iniciada',
            unreadCount: new Map(),
            isActive: true,
        });
        return await conversation.save();
    }
    async sendSystemMessage(recipientId, recipientType, content, metadata) {
        return this.sendMessage({
            recipientId,
            recipientType,
            recipientName: 'Usuario',
            content,
            messageType: message_schema_1.MessageType.SYSTEM_ALERT,
            metadata,
        }, 'SYSTEM', message_schema_1.SenderType.SYSTEM, 'Sistema Ticketing Master');
    }
    async sendDetailedSystemMessage(data) {
        console.log('📨 Enviando mensaje del sistema:', data);
        return this.sendMessage({
            recipientId: data.recipientId,
            recipientType: data.recipientType,
            recipientName: data.recipientName,
            content: data.content,
            subject: data.subject,
            messageType: data.messageType,
            metadata: data.metadata,
        }, data.senderId, data.senderType, data.senderName);
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(1, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        rabbitmq_service_1.RabbitMQService])
], MessageService);
//# sourceMappingURL=message.service.js.map