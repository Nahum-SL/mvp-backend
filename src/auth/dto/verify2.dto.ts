import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class Verify2faDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 digitos' })
  code: string;
}
