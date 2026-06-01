// src/admin/admin.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardStatsService } from './services/dashboard-stats.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly dashboardStatsService: DashboardStatsService) {}

  @Get('stats')
  getDashboardStats() {
    return this.dashboardStatsService.getStats();
  }
}
