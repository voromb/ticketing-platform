import { IsString, IsEnum, IsOptional, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SenderType, MessageType } from '../schemas/message.schema';

export class CreateMessageDto {
  @ApiProperty({ description: 'ID del destinatario' })
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({ enum: SenderType, description: 'Tipo de destinatario' })
  @IsEnum(SenderType)
  @IsNotEmpty()
  recipientType: SenderType;

  @ApiPropertyOptional({ description: 'Nombre del destinatario' })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiProperty({ description: 'Contenido del mensaje' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Asunto de la conversación (opcional)' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ enum: MessageType, description: 'Tipo de mensaje' })
  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

  @ApiPropertyOptional({ description: 'Metadata adicional' })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
