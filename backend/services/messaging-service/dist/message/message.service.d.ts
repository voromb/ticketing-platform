import { Model } from 'mongoose';
import { Message, MessageDocument, SenderType } from './schemas/message.schema';
import { Conversation, ConversationDocument, ConversationType, Participant } from './schemas/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
export declare class MessageService {
    private messageModel;
    private conversationModel;
    private rabbitMQService;
    constructor(messageModel: Model<MessageDocument>, conversationModel: Model<ConversationDocument>, rabbitMQService: RabbitMQService);
    sendMessage(createMessageDto: CreateMessageDto, senderId: string, senderType: SenderType, senderName: string): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, MessageDocument, {}, {}> & Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    getConversations(userId: string): Promise<{
        conversationId: unknown;
        participants: Participant[];
        conversationType: ConversationType;
        subject: string | undefined;
        lastMessageAt: Date;
        lastMessagePreview: string;
        unreadCount: number;
    }[]>;
    getMessages(conversationId: string, userId: string, query: GetMessagesDto): Promise<{
        conversation: import("mongoose").Document<unknown, {}, ConversationDocument, {}, {}> & Conversation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        messages: (import("mongoose").Document<unknown, {}, MessageDocument, {}, {}> & Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(messageId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    markConversationAsRead(conversationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteConversation(conversationId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private findOrCreateConversation;
    sendSystemMessage(recipientId: string, recipientType: SenderType, content: string, metadata?: any): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, MessageDocument, {}, {}> & Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    sendDetailedSystemMessage(data: {
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
    }): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, MessageDocument, {}, {}> & Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
}
