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
import { AuditQueryDto } from './dto/audit-query';

// Guards
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
// Decorator
import { Roles } from 'src/common/decorators/role.decorator';

import { Role } from '@prisma/client';

@Controller('audit')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getLogs(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  // Obtener los stats de los modulos
  @Get('stats')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStats() {
    return this.auditService.getStats();
  }

  // Endpoint de mantenimiento manual
  @Post('cleanup')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
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
