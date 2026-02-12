import { SalePaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class SaleItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @Min(1)
  quantity: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  price?: number;
}

export class CreateSaleDto {
  @IsUUID()
  warungId: string;

  @IsUUID()
  warehouseId: string;

  @IsEnum(SalePaymentMethod)
  paymentMethod: SalePaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export { SaleItemDto };
