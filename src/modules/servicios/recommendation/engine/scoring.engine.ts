// src/servicio/recommendation/engine/scoring.engine.ts
import { Service } from '@prisma/client';
import { ServiceFilters, ServiceRecommendationMeta } from '../type';

export interface ScoringResult {
  score: number;
  meta: ServiceRecommendationMeta;
}

export class ScoringEngine {
  static calculateScore(
    service: Service,
    filters: ServiceFilters,
  ): ScoringResult {
    let score = 0;
    const reasons: string[] = [];

    const hasBusinessType =
      filters.businessType &&
      service.businessTypes.includes(filters.businessType);
    const hasPainPoint =
      filters.painPoint && service.painPoints.includes(filters.painPoint);

    // Match por tipo de negocio
    if (filters.businessType) {
      if (hasBusinessType) {
        score += 50;
        reasons.push('Compatible con tu tipo de negocio');
      } else {
        score -= 10;
      }
    }

    // Match por pain point
    if (filters.painPoint) {
      if (hasPainPoint) {
        score += 40;
        reasons.push('Resuelve tu problema principal');
      }
    }

    // Match por búsqueda de texto
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (
        service.title.toLowerCase().includes(search) ||
        (service.description &&
          service.description.toLowerCase().includes(search))
      ) {
        score += 20;
        reasons.push('Coincide con tu búsqueda');
      }
    }

    // Métricas de viabilidad
    const impact = Math.min(100, 60 + score * 0.5);
    const effort = Math.max(10, 70 - score * 0.3);
    const risk = Math.max(5, 50 - score * 0.2);

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
}
