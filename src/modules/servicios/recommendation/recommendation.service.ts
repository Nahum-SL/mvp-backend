// src/servicio/recommendation/recommendation.service.ts
import { Injectable } from '@nestjs/common';
import { Service } from '@prisma/client';
// Types
import { ServiceFilters, ScoredService, RecommendationResult } from './type';
// Services
import { PrismaService } from 'prisma/prisma.service';
// Engine - utils
import { ScoringEngine } from './engine/scoring.engine';
import { InsightEngine } from './engine/insight.engine';
import { PriorityEngine } from './engine/priority.engine';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}
  buildRecommendation(
    services: Service[],
    filters: ServiceFilters,
  ): RecommendationResult {
    const hasFilters =
      filters.businessType || filters.painPoint || filters.search;

    if (!hasFilters) {
      return { bestMatch: null, alternatives: [], insights: null };
    }

    const scored: ScoredService[] = services.map((svc) => {
      const result = ScoringEngine.calculateScore(svc, filters);
      return {
        ...svc,
        relevanceScore: result.score,
        recommendationMeta: result.meta,
      };
    });

    const sorted = scored
      .filter((s) => s.relevanceScore >= 30)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (sorted.length === 0 || !sorted[0]) {
      return { bestMatch: null, alternatives: [], insights: null };
    }

    const bestMatch = sorted[0];

    return {
      bestMatch,
      alternatives: sorted.slice(1, 3),
      insights: InsightEngine.generateInsights(bestMatch, filters),
    };
  }

  // AHORA ESTE MÉTODO ES PÚBLICO Y TOTALMENTE TIPADO COHERENTEMENTE
  getEnrichedService(service: Service, filters: ServiceFilters) {
    const result = ScoringEngine.calculateScore(service, filters);
    const priorityScore = PriorityEngine.calculatePriorityScore(result.meta);

    return {
      ...service,
      relevanceScore: result.score,
      recommendationMeta: result.meta,
      priorityScore,
    };
  }

  async compare(ids: number[], filters: ServiceFilters) {
    if (!ids || ids.length === 0) return [];

    const services = await this.prisma.service.findMany({
      where: { id: { in: ids }, isVisible: true },
      include: { features: true },
    });

    const scored = services.map((svc) => this.getEnrichedService(svc, filters));

    return scored.sort((a, b) => b.priorityScore - a.priorityScore);
  }
}
