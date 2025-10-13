import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum ApprovalStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ApprovalDecisionDto {
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @IsString()
  decidedBy: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
