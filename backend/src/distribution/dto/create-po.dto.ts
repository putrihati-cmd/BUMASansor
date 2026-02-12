import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class POItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @Min(0)
  price: number;
}

export class CreatePODto {
  @IsUUID()
  supplierId: string;

  @IsUUID()
  warehouseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POItemDto)
  items: POItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export { POItemDto };
