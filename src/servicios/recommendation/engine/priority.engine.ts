// src/servicio/recommendation/engine/priority.engine.ts
import { ServiceRecommendationMeta } from '../type';

export class PriorityEngine {
  static calculatePriorityScore(meta: ServiceRecommendationMeta): number {
    // Pondera el valor vs la fricción de implementación
    return Math.max(0, meta.impact * 2 - meta.effort - meta.risk);
  }
}
