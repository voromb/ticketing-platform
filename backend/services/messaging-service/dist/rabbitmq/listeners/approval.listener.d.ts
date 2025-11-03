import { OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq.service';
import { MessageService } from '../../message/message.service';
import { NotificationService } from '../../notification/notification.service';
export declare class ApprovalListener implements OnModuleInit {
    private rabbitMQService;
    private messageService;
    private notificationService;
    constructor(rabbitMQService: RabbitMQService, messageService: MessageService, notificationService: NotificationService);
    onModuleInit(): Promise<void>;
    private handleApprovalRequested;
    private handleApprovalGranted;
    private handleApprovalRejected;
    private getResourceTypeText;
}
