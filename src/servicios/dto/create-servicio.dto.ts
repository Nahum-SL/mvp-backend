import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsInt,
  MinLength,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateServicioDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsArray()
  @IsString({ each: true })
  businessTypes: string[];

  @IsArray()
  @IsString({ each: true })
  painPoints: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  features?: string[]; // Los recibimos como array de strings por simplicidad

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsInt()
  @IsOptional()
  order?: number;
}
