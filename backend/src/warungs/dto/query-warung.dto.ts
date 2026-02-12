import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryWarungDto extends PaginationDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  blocked?: boolean;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
