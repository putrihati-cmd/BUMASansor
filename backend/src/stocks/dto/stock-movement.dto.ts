import { MovementType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class StockMovementDto {
  @IsEnum(MovementType)
  movementType: MovementType;

  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsUUID()
  fromWarehouseId?: string;

  @IsOptional()
  @IsUUID()
  toWarehouseId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
