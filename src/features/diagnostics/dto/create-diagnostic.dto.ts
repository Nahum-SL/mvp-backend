// src/features/diagnostics/dto/create-diagnostic.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  Length,
  IsPhoneNumber,
} from 'class-validator';

export class CreateDiagnosticDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de contacto es obligatorio' })
  contactName!: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11, { message: 'El RUC debe tener 11 dígitos' })
  ruc?: string;

  @IsEmail({}, { message: 'El formato del correo es inválido' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  @Length(9, 15)
  phone!: string;

  @IsObject()
  @IsNotEmpty()
  // Aquí recibimos { tax: boolean, labor: boolean, etc. }
  responses!: Record<string, boolean>;

  @IsString()
  @IsOptional()
  source?: string;
}
