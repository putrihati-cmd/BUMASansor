import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsUUID()
  categoryId: string;

  @Type(() => Number)
  @Min(0)
  basePrice: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  suggestedPrice?: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
