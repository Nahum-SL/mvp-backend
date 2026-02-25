import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  Matches,
  IsDateString,
} from 'class-validator';

export class CreateContactoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{9,15}$/, {
    message: 'El teléfono debe tener entre 9 y 15 dígitos (puede incluir +51)',
  })
  telefono: string;

  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe ser una fecha válida' },
  )
  @IsNotEmpty()
  fechaNac: string;

  @IsString()
  @IsOptional()
  comentario?: string;
}
