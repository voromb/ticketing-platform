import { IsString, IsEmail, IsNumber, IsOptional, Min, IsDateString, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({ 
    description: 'ID del restaurante a reservar',
    example: '68eaaa0e112be5ef489e27b0'
  })
  @IsString()
  restaurantId: string;

  @ApiProperty({ 
    description: 'ID del usuario que hace la reserva',
    example: 'user-123'
  })
  @IsString()
  userId: string;

  @ApiProperty({ 
    description: 'Nombre completo del cliente',
    example: 'María González López'
  })
  @IsString()
  customerName: string;

  @ApiProperty({ 
    description: 'Email del cliente',
    example: 'maria.gonzalez@email.com'
  })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ 
    description: 'Número de comensales',
    example: 4,
    minimum: 1,
    maximum: 20
  })
  @IsNumber()
  @Min(1)
  @Max(20)
  partySize: number;

  @ApiProperty({ 
    description: 'Fecha y hora de la reserva (ISO string)',
    example: '2025-06-15T20:30:00.000Z'
  })
  @IsDateString()
  reservationDate: string;

  @ApiProperty({ 
    description: 'Duración estimada en minutos',
    example: 120,
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
    description: 'Número de mesa preferida (si disponible)',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  tableNumber?: number;

  @ApiProperty({ 
    description: 'Peticiones especiales',
    example: 'Mesa junto a la ventana, celebración de cumpleaños',
    required: false
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({ 
    description: 'Información adicional de la reserva',
    example: { 
      phoneNumber: '+34666777888', 
      dietaryRestrictions: ['vegetarian', 'gluten-free'],
      occasion: 'birthday'
    },
    required: false
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
