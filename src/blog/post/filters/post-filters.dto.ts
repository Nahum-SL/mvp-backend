// src/blog/dto/post-admin-filters.dto.ts
import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class PostAdminFiltersDto {
  @IsOptional()
  @Transform(({ value }) => Math.min(1, Number(value)))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Math.min(100, Math.max(1, Number(value))))
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  published?: boolean;
}
