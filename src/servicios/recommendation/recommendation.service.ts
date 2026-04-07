import { Injectable } from '@nestjs/common';
import { Service } from '@prisma/client';
import { ServiceFilters, ScoredService } from './type';
import { FEATURED_PRIORITY_IDS } from './constants';
import { prismaAdp } from 'src/db';

@Injectable()
export class RecommendationService {
  buildRecommendation(services: Service[], filters: ServiceFilters) {
    const hasFilters =
      filters.businessType || filters.painPoint || filters.search;

    if (!hasFilters) {
      return {
        bestMatch: null,
        alternatives: [],
        insights: null,
      };
    }

    const scored: ScoredService[] = services.map((svc) => {
      const result = this.calculateScore(svc, filters);

      return {
        ...svc,
        relevanceScore: result.score,
        recommendationMeta: result.meta,
      };
    });

    const sorted = scored
      .filter((s) => s.relevanceScore >= 30)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (sorted.length === 0) {
      return {
        bestMatch: null,
        alternatives: [],
        insights: null,
      };
    }

    const bestMatch = sorted[0];

    return {
      bestMatch,
      alternatives: sorted.slice(1, 3),
      insights: this.generateInsights(bestMatch, filters),
    };
  }

  //  MOTOR DE SCORING
  private calculateScore(service: Service, filters: ServiceFilters) {
    let score = 0;
    const reasons: string[] = [];

    const hasBusinessType =
      filters.businessType &&
      service.businessTypes.includes(filters.businessType);
    const hasPainPoint =
      filters.painPoint && service.painPoints.includes(filters.painPoint);

    //  Match por tipo de negocio
    if (filters.businessType) {
      if (hasBusinessType) {
        score += 50;
        reasons.push('Compatible con tu tipo de negocio');
      } else {
        score -= 10;
      }
    }

    //  Match por pain point
    if (filters.painPoint) {
      if (hasPainPoint) {
        score += 40;
        reasons.push('Resuelve tu problema principal');
      }
    }

    //  Match por búsqueda
    if (filters.search) {
      const search = filters.search.toLowerCase();

      if (
        service.title.toLowerCase().includes(search) ||
        service.description.toLowerCase().includes(search)
      ) {
        score += 20;
        reasons.push('Coincide con tu búsqueda');
      }
    }

    if (FEATURED_PRIORITY_IDS.includes(service.id)) {
      score += 5;
      reasons.push('Servicio estratégico recomendado');
    }

    //  Métricas simuladas (luego puedes persistir esto)
    const impact = Math.min(100, 60 + score * 0.5) + (service.id % 5);
    const effort = Math.max(10, 70 - score * 0.3) + (service.id % 3);
    const risk = Math.max(5, 50 - score * 0.2) + (service.id % 2);

    return {
      score,
      meta: {
        impact,
        effort,
        risk,
        reasons,
      },
    };
  }

  //  GENERADOR DE INSIGHTS (nivel consultora)
  private generateInsights(service: ScoredService, filters: ServiceFilters) {
    const confidence = Math.min(0.95, service.relevanceScore / 100);

    const dynamicSummary = filters.painPoint
      ? `Recomendado para abordar "${filters.painPoint}" con alto impacto y bajo riesgo.`
      : `Alta alineación con el perfil de negocio seleccionado.`;

    return {
      summary: dynamicSummary,
      confidence,
      reasoning: [
        ...service.recommendationMeta.reasons,
        `Impacto estimado: ${Math.round(service.recommendationMeta.impact)}%`,
        `Esfuerzo estimado: ${Math.round(service.recommendationMeta.effort)}%`,
        `Riesgo estimado: ${Math.round(service.recommendationMeta.risk)}%`,
      ],
    };
  }

  private calculatePriorityScore(meta: {
    impact: number;
    effort: number;
    risk: number;
  }) {
    return Math.max(0, meta.impact * 2 - meta.effort - meta.risk);
  }

  async compare(ids: number[], filters: ServiceFilters) {
    if (!ids || ids.length === 0) return [];

    // 1. traer servicios desde DB
    const services = await prismaAdp.service.findMany({
      where: {
        id: { in: ids },
        isVisible: true,
      },
      include: {
        features: true,
      },
    });

    // 2. aplicar scoring (MISMA LÓGICA)
    const scored = services.map((svc) => {
      const result = this.calculateScore(svc, filters);

      return {
        ...svc,
        relevanceScore: result.score,
        recommendationMeta: result.meta,
        priorityScore: this.calculatePriorityScore(result.meta),
      };
    });

    // 3. ordenar
    return scored.sort((a, b) => b.priorityScore - a.priorityScore);
  }
}
