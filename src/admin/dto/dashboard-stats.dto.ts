// src/admin/dto/dashboard-stats.dto.ts
export class DashboardStatsDto {
  leads!: number;
  posts!: number;
  links!: number;
  views!: string;
  chartData!: { day: string; value: number }[];
  viewsChart!: { day: string; value: number }[];
}
