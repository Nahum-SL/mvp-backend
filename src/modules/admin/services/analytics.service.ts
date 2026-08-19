// src/admin/services/analytics.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';

import {
  ACTIVE_USERS_METRIC,
  ANALYTICS_LAST_30_DAYS,
  ANALYTICS_LAST_7_DAYS,
} from '../constants/analitycs.constants';

import { DAYS_OF_WEEK } from '../constants/dashboard.constants';

export interface ChartItem {
  day: string;
  value: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  private readonly analyticsClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  });

  async getViews(): Promise<string> {
    try {
      const [response] = await this.analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [ANALYTICS_LAST_30_DAYS],
        metrics: [{ name: ACTIVE_USERS_METRIC }],
      });

      const total =
        response.rows?.reduce(
          (acc, row) => acc + Number(row.metricValues?.[0]?.value ?? 0),
          0,
        ) ?? 0;

      return total > 999 ? `${(total / 1000).toFixed(1)}k` : total.toString();
    } catch (error) {
      this.logger.error('GA4 getViews', error);
      return '0';
    }
  }

  async getViewsChart(): Promise<ChartItem[]> {
    try {
      const [response] = await this.analyticsClient.runReport({
        property: `properties/${process.env.GA4_PROPERTY_ID}`,
        dateRanges: [ANALYTICS_LAST_7_DAYS],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: ACTIVE_USERS_METRIC }],
      });

      return this.transformChart(response);
    } catch (error) {
      this.logger.error('GA4 getViewsChart', error);
      return [];
    }
  }

  private transformChart(
    response: protos.google.analytics.data.v1beta.IRunReportResponse,
  ): ChartItem[] {
    if (!response.rows) return [];

    return response.rows.map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? '';

      const date = new Date(
        `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`,
      );

      return {
        day: DAYS_OF_WEEK[date.getDay()],
        value: Number(row.metricValues?.[0]?.value ?? 0),
      };
    });
  }
}
