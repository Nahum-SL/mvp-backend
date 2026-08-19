import { IsEmail, IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  dni!: string;

  @Type(() => Number) // Convierte el string del form-data a número
  @IsInt()
  @Min(18)
  age!: number;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @Type(() => Number)
  @IsInt()
  experience!: number;

  @IsString()
  position!: string;
}
