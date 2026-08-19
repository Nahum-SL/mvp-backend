import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RecommendationQueryDto } from './recommendation-query.dto';

export class CompareServicesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids!: number[];

  @ValidateNested()
  @Type(() => RecommendationQueryDto)
  filters!: RecommendationQueryDto;
}
