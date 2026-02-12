import { IsInt, IsString, IsUUID } from 'class-validator';

export class StockOpnameDto {
  @IsUUID()
  warehouseId: string;

  @IsUUID()
  productId: string;

  @IsInt()
  actualQty: number;

  @IsString()
  reason: string;
}
