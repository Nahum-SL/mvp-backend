// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { startOfDay, subDays, format } from 'date-fns';
import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';

type ChartItem = {
  day: string;
  value: number;
};

@Injectable()
export class AdminService {
  private analyticsClient: BetaAnalyticsDataClient;

  constructor() {
    this.analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });
  }

  // 🔹 TOTAL DE VISITAS (para el card)
  async getViews(): Promise<string> {
    try {
      const [response] = await this.analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      });

      const total =
        response.rows?.reduce((acc, row) => {
          return acc + Number(row.metricValues?.[0]?.value ?? 0);
        }, 0) ?? 0;

      return this.formatViews(total);
    } catch (error) {
      console.error('GA4 Error (getViews):', error);
      return '0';
    }
  }

  // 🔹 VISITAS POR DÍA (para gráfico)
  async getViewsChart(): Promise<ChartItem[]> {
    try {
      const [response] = await this.analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
      });

      return this.prepareViewsChart(response);
    } catch (error) {
      console.error('GA4 Error (getViewsChart):', error);
      return [];
    }
  }

  // 🔹 TRANSFORMACIÓN TIPADA (sin any)
  private prepareViewsChart(
    response: protos.google.analytics.data.v1beta.IRunReportResponse,
  ): ChartItem[] {
    if (!response.rows) return [];

    return response.rows.map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? '';
      const value = Number(row.metricValues?.[0]?.value ?? 0);

      // Formato YYYYMMDD → día (Lun, Mar...)
      const parsedDate = new Date(
        `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`,
      );

      const day = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][
        parsedDate.getDay()
      ];

      return { day, value };
    });
  }

  // 🔹 MÉTODO PRINCIPAL
  async getStats() {
    const sevenDaysAgo = startOfDay(subDays(new Date(), 6));

    const [
      leadsCount,
      postsCount,
      linksCount,
      weeklyLeads,
      viewsCount,
      viewsChart,
    ] = await Promise.all([
      prismaAdp.contacto.count(),
      prismaAdp.post.count(),
      prismaAdp.intranetLink.count(),
      prismaAdp.contacto.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      this.getViews(),
      this.getViewsChart(),
    ]);

    return {
      leads: leadsCount,
      posts: postsCount,
      links: linksCount,
      views: viewsCount,
      chartData: this.prepareChartData(weeklyLeads),
      viewsChart,
    };
  }

  //  GRÁFICO DE LEADS
  private prepareChartData(leads: { createdAt: Date }[]): ChartItem[] {
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        day: days[date.getDay()],
        fullDate: format(date, 'yyyy-MM-dd'),
        value: 0,
      };
    });

    leads.forEach((lead) => {
      const dateStr = format(lead.createdAt, 'yyyy-MM-dd');
      const dayEntry = last7Days.find((d) => d.fullDate === dateStr);
      if (dayEntry) dayEntry.value++;
    });

    return last7Days.map(({ day, value }) => ({ day, value }));
  }

  private formatViews(v: number): string {
    return v > 999 ? `${(v / 1000).toFixed(1)}k` : v.toString();
  }
}
