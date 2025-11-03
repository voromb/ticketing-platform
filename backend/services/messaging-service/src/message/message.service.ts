import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument, SenderType, MessageType } from './schemas/message.schema';
import {
  Conversation,
  ConversationDocument,
  ConversationType,
  UserType,
  Participant,
} from './schemas/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private rabbitMQService: RabbitMQService,
  ) {}

  /**
   * Enviar un mensaje manual
   */
  async sendMessage(createMessageDto: CreateMessageDto, senderId: string, senderType: SenderType, senderName: string) {
    try {
      const { recipientId, recipientType, recipientName, content, subject, messageType, metadata } = createMessageDto;

      console.log('🔍 Buscando o creando conversación...');
      
      // Buscar o crear conversación
      let conversation = await this.findOrCreateConversation(
        senderId,
        senderType,
        senderName,
        recipientId,
        recipientType,
        recipientName || 'Usuario',
        subject,
      );

      console.log('✅ Conversación encontrada/creada:', conversation._id);

      // Crear mensaje
      const message = new this.messageModel({
        conversationId: conversation._id,
        senderId,
        senderType,
        senderName,
        content,
        messageType: messageType || MessageType.TEXT,
        metadata,
        isRead: false,
      });

      await message.save();
      console.log('✅ Mensaje guardado:', message._id);

      // Actualizar conversación
      conversation.lastMessageAt = new Date();
      conversation.lastMessagePreview = content.substring(0, 100);
      
      // Incrementar contador de no leídos para el destinatario
      const currentUnread = conversation.unreadCount.get(recipientId) || 0;
      conversation.unreadCount.set(recipientId, currentUnread + 1);
      
      await conversation.save();
      console.log('✅ Conversación actualizada');

      // Publicar evento
      try {
        await this.rabbitMQService.publishEvent('message.sent', {
          messageId: (message._id as any).toString(),
          conversationId: (conversation._id as any).toString(),
          recipientId,
          recipientType,
          sentAt: new Date(),
        });
        console.log('✅ Evento publicado en RabbitMQ');
      } catch (rabbitError) {
        console.warn('⚠️ Error publicando evento en RabbitMQ (no crítico):', rabbitError);
        // No lanzar error, el mensaje ya se guardó
      }

      return {
        success: true,
        message: 'Mensaje enviado correctamente',
        data: message,
      };
    } catch (error) {
      console.error('❌ Error en sendMessage:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las conversaciones de un usuario
   */
  async getConversations(userId: string) {
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

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string, userId: string, query: GetMessagesDto) {
    // Verificar que el usuario es participante
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException('No tienes acceso a esta conversación');
    }

    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const messages = await this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.messageModel.countDocuments({
      conversationId: new Types.ObjectId(conversationId),
    });

    return {
      conversation,
      messages: messages.reverse(), // Mostrar del más antiguo al más reciente
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(messageId: string, userId: string) {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    // Verificar que el usuario es el destinatario (no el remitente)
    const conversation = await this.conversationModel.findById(message.conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }
    const isRecipient = conversation.participants.some(
      (p) => p.userId === userId && p.userId !== message.senderId,
    );

    if (!isRecipient) {
      throw new BadRequestException('No puedes marcar este mensaje como leído');
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    // Decrementar contador de no leídos
    const currentUnread = conversation!.unreadCount.get(userId) || 0;
    if (currentUnread > 0) {
      conversation!.unreadCount.set(userId, currentUnread - 1);
      await conversation!.save();
    }

    return { success: true, message: 'Mensaje marcado como leído' };
  }

  /**
   * Marcar todos los mensajes de una conversación como leídos
   */
  async markConversationAsRead(conversationId: string, userId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    // Actualizar todos los mensajes no leídos
    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        isRead: false,
        senderId: { $ne: userId }, // No marcar los propios mensajes
      },
      {
        $set: { isRead: true, readAt: new Date() },
      },
    );

    // Resetear contador
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    return { success: true, message: 'Conversación marcada como leída' };
  }

  /**
   * Eliminar conversación (soft delete)
   */
  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const isParticipant = conversation.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException('No tienes acceso a esta conversación');
    }

    conversation.isActive = false;
    await conversation.save();

    return { success: true, message: 'Conversación eliminada' };
  }

  /**
   * Buscar o crear conversación entre dos usuarios
   */
  private async findOrCreateConversation(
    user1Id: string,
    user1Type: SenderType,
    user1Name: string,
    user2Id: string,
    user2Type: SenderType,
    user2Name: string,
    subject?: string,
  ): Promise<ConversationDocument> {
    // Buscar conversación existente
    const existingConversation = await this.conversationModel.findOne({
      'participants.userId': { $all: [user1Id, user2Id] },
      isActive: true,
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Crear nueva conversación
    const participants: Participant[] = [
      { userId: user1Id, userType: user1Type as unknown as UserType, userName: user1Name },
      { userId: user2Id, userType: user2Type as unknown as UserType, userName: user2Name },
    ];

    // Determinar tipo de conversación
    let conversationType = ConversationType.PRIVATE;
    if (user1Type === SenderType.SYSTEM || user2Type === SenderType.SYSTEM) {
      conversationType = ConversationType.SYSTEM;
    } else if (user1Type === SenderType.SUPER_ADMIN || user2Type === SenderType.SUPER_ADMIN) {
      conversationType = ConversationType.SUPPORT;
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

  /**
   * Enviar mensaje del sistema (automático)
   */
  async sendSystemMessage(recipientId: string, recipientType: SenderType, content: string, metadata?: any) {
    return this.sendMessage(
      {
        recipientId,
        recipientType,
        recipientName: 'Usuario',
        content,
        messageType: MessageType.SYSTEM_ALERT,
        metadata,
      },
      'SYSTEM',
      SenderType.SYSTEM,
      'Sistema Ticketing Master',
    );
  }

  /**
   * Enviar mensaje del sistema con detalles completos (para aprobaciones automáticas)
   */
  async sendDetailedSystemMessage(data: {
    recipientId: string;
    recipientType: string;
    recipientName: string;
    senderId: string;
    senderType: string;
    senderName: string;
    content: string;
    subject?: string;
    messageType?: string;
    metadata?: any;
  }) {
    console.log('📨 Enviando mensaje del sistema:', data);

    return this.sendMessage(
      {
        recipientId: data.recipientId,
        recipientType: data.recipientType as any,
        recipientName: data.recipientName,
        content: data.content,
        subject: data.subject,
        messageType: data.messageType as MessageType,
        metadata: data.metadata,
      },
      data.senderId,
      data.senderType as SenderType,
      data.senderName,
    );
  }
}
