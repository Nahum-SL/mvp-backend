import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsUrl,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'El formato del correo es inválido ' })
  @IsNotEmpty({ message: 'El correo es obligatorio ' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria ' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio ' })
  name: string;

  @IsEnum(Role, { message: 'EL rol proporcionado no es valido' })
  @IsOptional()
  role?: Role;

  @IsUrl({}, { message: 'El avatar debe ser una URL válida' })
  @IsOptional()
  avatar?: string;
}
