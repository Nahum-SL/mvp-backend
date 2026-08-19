// src/admin/admin.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardStatsService } from './services/dashboard-stats.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly dashboardStatsService: DashboardStatsService) {}

  @Get('stats')
  getDashboardStats() {
    return this.dashboardStatsService.getStats();
  }
}
