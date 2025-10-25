import {
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsOptional,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TripStatus } from '../schemas/trip.schema';

class LocationDto {
  @IsString()
  location: string;

  @IsDateString()
  datetime?: Date;

  @IsArray()
  @IsOptional()
  coordinates?: number[];
}

export class CreateTripDto {
  @IsString()
  festivalId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @ValidateNested()
  @Type(() => LocationDto)
  departure: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  arrival: LocationDto;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}
