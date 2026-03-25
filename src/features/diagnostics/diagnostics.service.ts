// src/features/diagnostics/diagnostics.service.ts
import { Injectable } from '@nestjs/common';
import { RiskLevel } from 'generated/prisma/enums';
import { prismaAdp } from 'src/db';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';

@Injectable()
export class DiagnosticsService {
  calculateRisk(responses: Record<string, boolean>) {
    // Definimos pesos por área de ASESCON
    const weights = {
      tax: 35, // Tributario es crítico
      labor: 30, // Laboral es muy sensible
      legal: 15, // Societario/Legal
      accounting: 20, // Libros y registros
    };

    let score = 100;

    // Si la respuesta es 'false' (No lo tiene), restamos el peso
    if (!responses.tax) score -= weights.tax;
    if (!responses.labor) score -= weights.labor;
    if (!responses.legal) score -= weights.legal;
    if (!responses.accounting) score -= weights.accounting;

    // Determinar nivel basado en score final
    let risk: RiskLevel = RiskLevel.BAJO;
    if (score < 40) risk = RiskLevel.CRITICO;
    else if (score < 70) risk = RiskLevel.ALTO;
    else if (score < 90) risk = RiskLevel.MEDIO;

    return { score, risk };
  }

  // --- NUEVO MÉTODO PARA GUARDAR EN DB ---
  async saveToDb(
    data: CreateDiagnosticDto & { score: number; overallRisk: RiskLevel },
  ) {
    return prismaAdp.businessDiagnostic.create({
      data: {
        contactName: data.contactName,
        companyName: data.companyName,
        ruc: data.ruc,
        email: data.email,
        phone: data.phone,
        responses: data.responses, // Prisma maneja el objeto JSON automáticamente
        score: data.score,
        overallRisk: data.overallRisk,
        source: data.source || 'radar_general',
      },
    });
  }
}
