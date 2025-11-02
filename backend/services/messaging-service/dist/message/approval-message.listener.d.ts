import { MessageService } from './message.service';
export declare class ApprovalMessageListener {
    private readonly messageService;
    constructor(messageService: MessageService);
    handleApprovalRequested(data: any): Promise<void>;
    handleApprovalGranted(data: any): Promise<void>;
    handleApprovalRejected(data: any): Promise<void>;
    private buildApprovalRequestMessage;
    private getResourceIcon;
    private getResourceTypeLabel;
    private getSuperAdminId;
}
