import { IsOptional, IsString, IsDecimal, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    debtLimit?: number;
}

export class UpdateCustomerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    debtLimit?: number;
}
