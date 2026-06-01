// src/admin/services/dashboard-stats.service.ts

import { Injectable } from '@nestjs/common';
import { format, startOfDay, subDays } from 'date-fns';
import { prismaAdp } from 'src/db';
import { AnalyticsService } from './analytics.service';

import {
  DASHBOARD_RANGE_DAYS,
  DAYS_OF_WEEK,
} from '../constants/dashboard.constants';

@Injectable()
export class DashboardStatsService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async getStats() {
    const sevenDaysAgo = startOfDay(
      subDays(new Date(), DASHBOARD_RANGE_DAYS - 1),
    );

    const [leads, posts, links, weeklyLeads, views, viewsChart] =
      await Promise.all([
        prismaAdp.contacto.count(),
        prismaAdp.post.count(),
        prismaAdp.intranetLink.count(),
        prismaAdp.contacto.findMany({
          where: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
          select: {
            createdAt: true,
          },
        }),
        this.analyticsService.getViews(),
        this.analyticsService.getViewsChart(),
      ]);

    return {
      leads,
      posts,
      links,
      views,
      chartData: this.buildLeadsChart(weeklyLeads),
      viewsChart,
    };
  }

  private buildLeadsChart(leads: { createdAt: Date }[]) {
    const last7Days = Array.from({
      length: DASHBOARD_RANGE_DAYS,
    }).map((_, index) => {
      const date = subDays(new Date(), DASHBOARD_RANGE_DAYS - 1 - index);

      return {
        day: DAYS_OF_WEEK[date.getDay()],
        fullDate: format(date, 'yyyy-MM-dd'),
        value: 0,
      };
    });

    leads.forEach((lead) => {
      const date = format(lead.createdAt, 'yyyy-MM-dd');

      const entry = last7Days.find((item) => item.fullDate === date);

      if (entry) {
        entry.value += 1;
      }
    });

    return last7Days.map(({ day, value }) => ({
      day,
      value,
    }));
  }
}
