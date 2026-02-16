import { OrderType, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class SaleItemModifierDto {
  @IsUUID()
  modifierId: string;
}

class SaleItemDto {
  @IsUUID()
  warungProductId: string;

  @Type(() => Number)
  @Min(1)
  quantity: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemModifierDto)
  modifiers?: SaleItemModifierDto[];
}

export class CreateSaleDto {
  @IsUUID()
  warungId: string;

  @IsOptional()
  @IsUUID()
  shiftId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export { SaleItemDto };
