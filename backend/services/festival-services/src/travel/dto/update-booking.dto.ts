import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../schemas/booking.schema';

export class UpdateBookingDto {
  @ApiProperty({ 
    description: 'Nuevo nombre del pasajero',
    example: 'Juan Pérez García',
    required: false
  })
  @IsOptional()
  @IsString()
  passengerName?: string;

  @ApiProperty({ 
    description: 'Nuevo email del pasajero',
    example: 'juan.perez@newemail.com',
    required: false
  })
  @IsOptional()
  @IsEmail()
  passengerEmail?: string;

  @ApiProperty({ 
    description: 'Nuevo estado de la reserva',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
    required: false
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({ 
    description: 'Razón de cancelación (si aplica)',
    example: 'Cambio de planes del usuario',
    required: false
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
