import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsUUID()
  warungId?: string;
}
