import { ReceivableStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class QueryReceivableDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  warungId?: string;

  @IsOptional()
  @IsEnum(['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE'], {
    message: 'Status must be one of: UNPAID, PARTIAL, PAID, OVERDUE',
  })
  status?: ReceivableStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  overdueOnly?: boolean;
}
