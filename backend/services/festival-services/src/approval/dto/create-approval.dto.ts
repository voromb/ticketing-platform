import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum ApprovalService {
  TRAVEL = 'TRAVEL',
  RESTAURANT = 'RESTAURANT',
  MERCHANDISING = 'MERCHANDISING',
}

export enum ApprovalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class CreateApprovalDto {
  @IsEnum(ApprovalService)
  service: ApprovalService;

  @IsString()
  entityId: string;

  @IsString()
  entityType: string;

  @IsString()
  requestedBy: string;

  @IsOptional()
  @IsEnum(ApprovalPriority)
  priority?: ApprovalPriority;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
