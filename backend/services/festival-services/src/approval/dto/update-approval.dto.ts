export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class UpdateApprovalDto {
  service?: string;
  entityId?: string;
  entityType?: string;
  requestedBy?: string;
  priority?: string;
  metadata?: any;
  status?: string;
  comments?: string;
  approvedBy?: string;
  rejectedBy?: string;
}
