import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, IsEnum, Min, IsDateString } from 'class-validator';

enum ProductType {
  TSHIRT = 'TSHIRT',
  HOODIE = 'HOODIE',
  VINYL = 'VINYL',
  CD = 'CD',
  POSTER = 'POSTER',
  ACCESSORIES = 'ACCESSORIES',
  OTHER = 'OTHER'
}

export class CreateProductDto {
  @IsOptional()
  @IsString()
  festivalId?: string;

  @IsOptional()
  @IsString()
  bandId?: string;

  @IsOptional()
  @IsString()
  bandName?: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalStock?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  exclusive?: boolean;

  @IsOptional()
  @IsBoolean()
  preOrderEnabled?: boolean;

  @IsOptional()
  @IsDateString()
  releaseDate?: Date;
}