import { type BusinessTypeID, type PainPointID } from './constants';
import { Service } from '@prisma/client';

export interface ServiceRecommendationMeta {
  impact: number;
  effort: number;
  risk: number;
  reasons: string[];
}

export type ScoredService = Service & {
  relevanceScore: number;
  recommendationMeta: ServiceRecommendationMeta;
};

export interface ServiceFilters {
  businessType?: BusinessTypeID;
  painPoint?: PainPointID;
  search?: string;
}

export interface RecommendationResult {
  bestMatch: ScoredService | null;
  alternatives: ScoredService[];
  insights: {
    summary: string;
    confidence: number;
    reasoning: string[];
  };
}
