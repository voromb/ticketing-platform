import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsEnum } from 'class-validator';

enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PRE_ORDER = 'PRE_ORDER',
  COMING_SOON = 'COMING_SOON'
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}