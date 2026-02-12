import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  location: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
