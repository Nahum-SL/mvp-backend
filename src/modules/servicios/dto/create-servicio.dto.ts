import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsInt,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  icon?: string;

  // Transformación para asegurar que siempre sea un Array de strings
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  })
  businessTypes!: string[];

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  })
  painPoints!: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  })
  features?: string[]; // Los recibimos como array de strings por simplicidad

  // Convertimos el string "true"/"false" del FormData a Boolean real
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isVisible?: boolean;

  // Convertimos el string "1" del FormData a Number real
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  order?: number;
}
