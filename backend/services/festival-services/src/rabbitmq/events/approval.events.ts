export enum ApprovalEventType {
  REQUEST_CREATED = 'approval.request.created',
  APPROVAL_GRANTED = 'approval.granted',
  APPROVAL_REJECTED = 'approval.rejected',
}

export interface ApprovalRequestEvent {
  type: ApprovalEventType;
  data: {
    id: string;
    entityId: string;
    entityType: 'travel' | 'restaurant' | 'merchandising';
    requestedBy: string;
    reason: string;
    metadata?: Record<string, any>;
  };
}

export interface ApprovalResponseEvent {
  type: ApprovalEventType;
  data: {
    approvalId: string;
    entityId: string;
    entityType: string;
    status: 'approved' | 'rejected';
    approvedBy?: string;
    rejectedBy?: string;
    comments?: string;
    approvedAt?: Date;
    rejectedAt?: Date;
  };
}