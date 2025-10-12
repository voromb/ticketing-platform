import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../schemas/order.schema';

export class ShippingAddressDto {
  @ApiProperty({ 
    description: 'Nombre completo del destinatario',
    example: 'Ana García López'
  })
  @IsString()
  fullName: string;

  @ApiProperty({ 
    description: 'Dirección completa',
    example: 'Calle Mayor 123, 2º B'
  })
  @IsString()
  address: string;

  @ApiProperty({ 
    description: 'Ciudad',
    example: 'Madrid'
  })
  @IsString()
  city: string;

  @ApiProperty({ 
    description: 'Código postal',
    example: '28001'
  })
  @IsString()
  postalCode: string;

  @ApiProperty({ 
    description: 'País',
    example: 'España'
  })
  @IsString()
  country: string;

  @ApiProperty({ 
    description: 'Teléfono de contacto',
    example: '+34666777888',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateOrderDto {
  @ApiProperty({ 
    description: 'ID del usuario que hace el pedido',
    example: 'user-123'
  })
  @IsString()
  userId: string;

  @ApiProperty({ 
    description: 'Email del cliente',
    example: 'ana.garcia@email.com'
  })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ 
    description: 'Dirección de envío',
    type: ShippingAddressDto
  })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ 
    description: 'Código de cupón aplicado',
    example: 'FESTIVAL2025',
    required: false
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ 
    description: 'Información adicional del pedido',
    example: { 
      paymentMethod: 'credit_card',
      deliveryInstructions: 'Dejar en portería'
    },
    required: false
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateOrderDto {
  @ApiProperty({ 
    description: 'Nuevo estado del pedido',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    required: false
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ 
    description: 'Nuevo estado del pago',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    required: false
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ 
    description: 'Número de seguimiento',
    example: 'TRK123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiProperty({ 
    description: 'Fecha estimada de entrega',
    example: '2025-06-20T10:00:00.000Z',
    required: false
  })
  @IsOptional()
  estimatedDelivery?: Date;

  @ApiProperty({ 
    description: 'Razón de cancelación (si aplica)',
    example: 'Producto agotado',
    required: false
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiProperty({ 
    description: 'Costo de envío',
    example: 5.99,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiProperty({ 
    description: 'Impuestos aplicados',
    example: 8.50,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxes?: number;
}
