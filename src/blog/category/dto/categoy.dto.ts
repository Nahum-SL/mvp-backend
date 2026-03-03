import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
