import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class StockOpnameDto {
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsUUID()
  warungId?: string;

  @IsUUID()
  productId: string;

  @IsInt()
  actualQty: number;

  @IsString()
  reason: string;
}
