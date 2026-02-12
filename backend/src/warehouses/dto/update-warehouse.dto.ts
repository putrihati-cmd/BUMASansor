import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  location?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
