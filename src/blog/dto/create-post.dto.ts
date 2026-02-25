import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  excerpt: string; // Breve descripción para la card del blog

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readingTime?: number;

  @IsString()
  @IsNotEmpty()
  authorId: string; // El ID del usuario que crea el post

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
