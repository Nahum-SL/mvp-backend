// src/intranet/dto/create-link.dto.ts
import { IsString, IsOptional, IsUrl, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLinkDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number) // Esto asegura que el string se convierta a número
  order?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean) // Esto asegura que el string "true" sea boolean true
  isVisible?: boolean;
}
