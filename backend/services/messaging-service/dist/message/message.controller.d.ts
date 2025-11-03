import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    sendMessage(createMessageDto: CreateMessageDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("./schemas/message.schema").MessageDocument, {}, {}> & import("./schemas/message.schema").Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
    }>;
    getConversations(req: any): Promise<{
        conversationId: unknown;
        participants: import("./schemas/conversation.schema").Participant[];
        conversationType: import("./schemas/conversation.schema").ConversationType;
        subject: string | undefined;
        lastMessageAt: Date;
        lastMessagePreview: string;
        unreadCount: number;
    }[]>;
    getMessages(conversationId: string, query: GetMessagesDto, req: any): Promise<{
        conversation: import("mongoose").Document<unknown, {}, import("./schemas/conversation.schema").ConversationDocument, {}, {}> & import("./schemas/conversation.schema").Conversation & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        messages: (import("mongoose").Document<unknown, {}, import("./schemas/message.schema").MessageDocument, {}, {}> & import("./schemas/message.schema").Message & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
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
    markAsRead(messageId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    markConversationAsRead(conversationId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteConversation(conversationId: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
