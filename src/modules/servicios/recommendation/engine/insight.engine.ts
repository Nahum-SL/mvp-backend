// src/servicio/recommendation/engine/insight.engine.ts
import { ScoredService, ServiceFilters } from '../type';

export interface InsightResult {
  summary: string;
  confidence: number;
  reasoning: string[];
}

export class InsightEngine {
  static generateInsights(
    service: ScoredService,
    filters: ServiceFilters,
  ): InsightResult {
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
}
