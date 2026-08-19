// src/features/diagnostics/diagnostics.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';
import { CreateDiagnosticDto } from './dto/create-diagnostic.dto';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Post('radar')
  async create(@Body() createDto: CreateDiagnosticDto) {
    // 1. Calculamos el Score y RiskLevel en el Service
    const { score, risk } = this.diagnosticsService.calculateRisk(
      createDto.responses,
    );

    // 2. Guardamos en la DB (Prisma) incluyendo los datos calculados
    // Aquí llamarías a tu repositorio o servicio de Prisma
    const record = await this.diagnosticsService.saveToDb({
      ...createDto,
      score,
      overallRisk: risk,
    });

    // 3. Devolvemos el resultado al frontend para que pinte el gráfico
    return {
      id: record.id,
      score,
      risk,
      message: this.getRiskMessage(risk),
    };
  }

  private getRiskMessage(risk: string) {
    const messages = {
      BAJO: 'Tu empresa tiene bases sólidas. ¡Sigue así!',
      MEDIO: 'Existen puntos ciegos que podrían generar multas leves.',
      ALTO: '¡Alerta! Tienes contingencias críticas por resolver.',
      CRITICO:
        'Riesgo inminente de cierre o embargo. Contacta a un asesor ahora.',
    };
    return messages[risk];
  }
}
