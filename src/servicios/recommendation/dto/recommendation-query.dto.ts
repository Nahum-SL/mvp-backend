import { IsIn, IsOptional, IsString } from 'class-validator';
import {
  BUSINESS_TYPES,
  PAIN_POINTS,
  type BusinessTypeID,
  type PainPointID,
} from '../constants';

export class RecommendationQueryDto {
  @IsOptional()
  @IsIn(BUSINESS_TYPES.map((b) => b.id))
  businessType?: BusinessTypeID;

  @IsOptional()
  @IsIn(PAIN_POINTS.map((p) => p.id))
  painPoint?: PainPointID;

  @IsOptional()
  @IsString()
  search?: string;
}
