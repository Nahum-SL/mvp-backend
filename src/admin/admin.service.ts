// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { startOfDay, subDays, format } from 'date-fns';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

@Injectable()
export class AdminService {
  private analyticsClient: BetaAnalyticsDataClient;

  constructor() {
    this.analyticsClient = new BetaAnalyticsDataClient({
      keyFilename: 'path/to/your-credentials.json', // Usa variables de entorno mejor
    });
  }

  async getViews(): Promise<string> {
    try {
      const [response] = await this.analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`, // Usa Env vars
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      });

      const value = response.rows?.[0]?.metricValues?.[0]?.value || '0';
      return this.formatViews(value); // Formateamos aquí (ej: 1200 -> 1.2k)
    } catch (error) {
      console.error('GA4 Error:', error);
      return '0'; // Fallback si la API de Google falla
    }
  }

  async getStats() {
    const sevenDaysAgo = startOfDay(subDays(new Date(), 6));

    // Añadimos getViews() al Promise.all para que todo corra en paralelo
    const [leadsCount, postsCount, linksCount, weeklyLeads, viewsCount] =
      await Promise.all([
        prismaAdp.contacto.count(),
        prismaAdp.post.count(),
        prismaAdp.intranetLink.count(),
        prismaAdp.contacto.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true },
        }),
        this.getViews(), // <--- Llamada real a Google Analytics
      ]);

    return {
      leads: leadsCount,
      posts: postsCount,
      links: linksCount,
      views: viewsCount,
      chartData: this.prepareChartData(weeklyLeads),
    };
  }

  private prepareChartData(leads: { createdAt: Date }[]) {
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
  private formatViews(v: string | number) {
    const num = Number(v);
    return num > 999 ? `${(num / 1000).toFixed(1)}k` : v.toString();
  }
}
