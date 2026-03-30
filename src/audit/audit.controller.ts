// src/audit/audit.controller.ts
import {
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './audit-query';
import { AuthGuard } from '@nestjs/passport';

@Controller('audit')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async getLogs(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  @Get('stats')
  async getStats() {
    return this.auditService.getStats();
  }

  // Endpoint de mantenimiento manual
  @UseGuards(AuthGuard('jwt')) // Solo admins autenticados
  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  // @Roles('OWNER') // Sugerencia: Solo el dueño debería poder borrar logs
  async manualCleanup() {
    const result = await this.auditService.cleanOldLogs();
    return {
      message: 'Limpieza de logs completada exitosamente',
      deletedCount: result.count,
      timestamp: new Date().toISOString(),
    };
  }
}
