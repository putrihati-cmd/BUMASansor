import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  receivableId: string;

  @Type(() => Number)
  @Min(1)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  proofUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
