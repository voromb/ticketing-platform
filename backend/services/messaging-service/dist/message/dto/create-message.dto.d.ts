import { SenderType, MessageType } from '../schemas/message.schema';
export declare class CreateMessageDto {
    recipientId: string;
    recipientType: SenderType;
    recipientName?: string;
    content: string;
    subject?: string;
    messageType?: MessageType;
    metadata?: any;
}
