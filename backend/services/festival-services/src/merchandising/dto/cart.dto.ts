import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ 
    description: 'ID del producto a añadir',
    example: '68eaad44a1d6b219c62f3d90'
  })
  @IsString()
  productId: string;

  @ApiProperty({ 
    description: 'Cantidad a añadir al carrito',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ 
    description: 'Talla del producto (si aplica)',
    example: 'L',
    required: false
  })
  @IsOptional()
  @IsString()
  size?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ 
    description: 'Nueva cantidad del producto',
    example: 3,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ 
    description: 'Nueva talla del producto (si aplica)',
    example: 'XL',
    required: false
  })
  @IsOptional()
  @IsString()
  size?: string;
}

export class ApplyCouponDto {
  @ApiProperty({ 
    description: 'Código del cupón de descuento',
    example: 'FESTIVAL2025'
  })
  @IsString()
  couponCode: string;
}
