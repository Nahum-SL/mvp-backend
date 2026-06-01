import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { prismaAdp } from 'src/db';
import { AuditQueryDto } from './dto/audit-query';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  // Crear un log
  async log(action: string, status: string, message: string, metadata?: any) {
    return await prismaAdp.auditLog.create({
      data: { action, status, message, metadata },
    });
  }

  // Obtener logs para el Dashboard con filtros
  async findAll(query: AuditQueryDto) {
    const { action, status, limit = '50' } = query;

    return await prismaAdp.auditLog.findMany({
      where: {
        action: action ? { contains: action, mode: 'insensitive' } : undefined,
        status: status || undefined,
      },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener estadísticas rápidas para el Dashboard
  async getStats() {
    const [total, errors, last24h] = await Promise.all([
      prismaAdp.auditLog.count(),
      prismaAdp.auditLog.count({ where: { status: 'ERROR' } }),
      prismaAdp.auditLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return { total, errors, last24h };
  }

  // Se ejecutará el primer día de cada mes a la medianoche
  // Algoritmo de limpieza de logs antiguos (más de 2 meses)
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async handleLogCleanup() {
    this.logger.log(
      'Iniciando limpieza automática de logs (mayores a 2 meses)...',
    );
    try {
      const deleted = await this.cleanOldLogs();
      this.logger.log(
        `Limpieza completada. Se eliminaron ${deleted.count} registros.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error en la limpieza automática de logs: ${message}`);
    }
  }

  async cleanOldLogs() {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);

    const result = await prismaAdp.auditLog.deleteMany({
      where: {
        createdAt: { lt: threeMonthsAgo },
      },
    });
    return result;
  }
}
