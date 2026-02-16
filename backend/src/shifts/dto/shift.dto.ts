import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OpenShiftDto {
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    startCash: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class CloseShiftDto {
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    endCash: number;

    @IsOptional()
    @IsString()
    notes?: string;
}
