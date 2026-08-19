import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsString()
  @Length(2, 100)
  name!: string;
}

// Tabla user ->
// Identidad
// Seguridad
// Relaciones
// Auditoria

// El backend decide el rol
