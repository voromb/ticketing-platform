import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsDate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  NotificationType,
  NotificationCategory,
  UserType,
} from '../schemas/notification.schema';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID del usuario destinatario' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: UserType, description: 'Tipo de usuario' })
  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType;

  @ApiProperty({ description: 'Título de la notificación' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Mensaje de la notificación' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: NotificationType, description: 'Tipo de notificación' })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  notificationType: NotificationType;

  @ApiProperty({
    enum: NotificationCategory,
    description: 'Categoría de la notificación',
  })
  @IsEnum(NotificationCategory)
  @IsNotEmpty()
  category: NotificationCategory;

  @ApiPropertyOptional({ description: 'Metadata adicional' })
  @IsObject()
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Fecha de expiración' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;
}
