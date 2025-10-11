import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {
  @IsOptional()
  @IsString()
  @IsEnum(['OPEN', 'CLOSED', 'FULL'])
  status?: string;
}
