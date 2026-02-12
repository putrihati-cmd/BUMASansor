import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

class DOItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @Min(0)
  price: number;
}

export class CreateDODto {
  @IsUUID()
  warungId: string;

  @IsUUID()
  warehouseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DOItemDto)
  items: DOItemDto[];

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(30)
  creditDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export { DOItemDto };
