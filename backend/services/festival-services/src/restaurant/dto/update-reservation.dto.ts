import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../schemas/reservation.schema';

export class UpdateReservationDto {
  @ApiProperty({ 
    description: 'Nuevo nombre del cliente',
    example: 'María González López',
    required: false
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ 
    description: 'Nuevo email del cliente',
    example: 'maria.gonzalez@newemail.com',
    required: false
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ 
    description: 'Nuevo número de comensales',
    example: 6,
    minimum: 1,
    maximum: 20,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  partySize?: number;

  @ApiProperty({ 
    description: 'Nueva fecha y hora de la reserva',
    example: '2025-06-15T21:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  reservationDate?: string;

  @ApiProperty({ 
    description: 'Nueva duración en minutos',
    example: 150,
    minimum: 30,
    maximum: 300,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(300)
  duration?: number;

  @ApiProperty({ 
    description: 'Nuevo número de mesa',
    example: 8,
    required: false
  })
  @IsOptional()
  @IsNumber()
  tableNumber?: number;

  @ApiProperty({ 
    description: 'Nuevo estado de la reserva',
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
    required: false
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiProperty({ 
    description: 'Nuevas peticiones especiales',
    example: 'Mesa en terraza, sin música alta',
    required: false
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({ 
    description: 'Razón de cancelación (si aplica)',
    example: 'Cambio de planes del cliente',
    required: false
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiProperty({ 
    description: 'Precio estimado de la reserva',
    example: 85.50,
    required: false
  })
  @IsOptional()
  @IsNumber()
  estimatedPrice?: number;

  @ApiProperty({ 
    description: 'Precio real final',
    example: 92.30,
    required: false
  })
  @IsOptional()
  @IsNumber()
  actualPrice?: number;
}
