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
  buyPrice: number;

  @Type(() => Number)
  @Min(0)
  sellPrice: number;

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
