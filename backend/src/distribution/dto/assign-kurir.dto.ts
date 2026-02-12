import { IsUUID } from 'class-validator';

export class AssignKurirDto {
  @IsUUID()
  kurirId: string;
}
