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
  features?: string[]; // Los recibimos como array de strings por simplicidad

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsInt()
  @IsOptional()
  order?: number;
}
