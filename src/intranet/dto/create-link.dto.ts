import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLinkDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  // 1. QUITAMOS @IsUrl() y dejamos @IsString() para permitir "/"
  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  order?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isVisible?: boolean;
}
