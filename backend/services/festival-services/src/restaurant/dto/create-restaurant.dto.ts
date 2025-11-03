import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleDto {
  @IsString()
  day: string;

  @IsString()
  openTime: string;

  @IsString()
  closeTime: string;
}

export class MenuItemDto {
  @IsString()
  itemId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  category: string;

  @IsArray()
  @IsString({ each: true })
  dietary: string[];

  @IsBoolean()
  available: boolean;
}

export class CreateRestaurantDto {
  @IsString()
  festivalId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsString()
  cuisine: string;

  @IsString()
  location: string;

  @IsNumber()
  @Min(0)
  capacity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedule?: ScheduleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  menu?: MenuItemDto[];

  @IsOptional()
  @IsBoolean()
  acceptsReservations?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(180)
  reservationDurationMinutes?: number;
}
