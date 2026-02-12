import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  buyPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  sellPrice?: number;

  @IsOptional()
  @IsString()
  unit?: string;

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
