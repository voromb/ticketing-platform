import { IsString, IsOptional } from 'class-validator';

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
  @IsString()
  service: string;

  @IsString()
  entityId: string;

  @IsString()
  entityType: string;

  @IsString()
  requestedBy: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  metadata?: any;
}
