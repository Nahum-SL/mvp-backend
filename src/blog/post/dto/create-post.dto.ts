import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  categoryId: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  published: boolean;
}
