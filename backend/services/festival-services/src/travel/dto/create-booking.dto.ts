import { IsString, IsEmail, IsNumber, IsOptional, Min, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ 
    description: 'ID del viaje a reservar',
    example: '68eaa4ee1b963876d9c7533d'
  })
  @IsString()
  tripId: string;

  @ApiProperty({ 
    description: 'ID del usuario que hace la reserva',
    example: 'user-123'
  })
  @IsString()
  userId: string;

  @ApiProperty({ 
    description: 'Nombre completo del pasajero',
    example: 'Juan Pérez García'
  })
  @IsString()
  passengerName: string;

  @ApiProperty({ 
    description: 'Email del pasajero',
    example: 'juan.perez@email.com'
  })
  @IsEmail()
  passengerEmail: string;

  @ApiProperty({ 
    description: 'Número de asientos a reservar',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  seatsBooked: number;

  @ApiProperty({ 
    description: 'Información adicional de la reserva',
    example: { specialRequests: 'Asiento ventana', phoneNumber: '+34666777888' },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
