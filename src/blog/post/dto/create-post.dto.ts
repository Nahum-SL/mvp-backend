import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  excerpt: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @Type(() => Number) // Convierte el string de FormData a número
  @IsNumber()
  categoryId: number;

  @Type(() => Boolean) // Convierte "true"/"false" a booleano
  @IsBoolean()
  published: boolean;
}
