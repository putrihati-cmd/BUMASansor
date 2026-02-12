import { IsOptional, IsString } from 'class-validator';

export class ConfirmDeliveryDto {
  @IsOptional()
  @IsString()
  photoProof?: string;
}
