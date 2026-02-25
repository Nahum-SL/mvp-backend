import { IsString, IsOptional, IsUrl, IsInt, IsBoolean } from 'class-validator';

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
  order?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: string;
}
