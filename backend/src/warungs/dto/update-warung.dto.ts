import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class UpdateWarungDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(30)
  creditDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
}
