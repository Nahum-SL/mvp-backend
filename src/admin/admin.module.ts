import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AnalyticsService } from './services/analytics.service';
import { DashboardStatsService } from './services/dashboard-stats.service';

@Module({
  controllers: [AdminController],
  providers: [AnalyticsService, DashboardStatsService],
  exports: [AnalyticsService, DashboardStatsService],
})
export class AdminModule {}
