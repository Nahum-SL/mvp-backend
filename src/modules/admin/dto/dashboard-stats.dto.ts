export class DashboardChartItemDto {
  day!: string;
  value!: number;
}

export class DashboardStatsDto {
  leads!: number;
  posts!: number;
  links!: number;
  views!: string;
  chartData!: DashboardChartItemDto[];
  viewsChart!: DashboardChartItemDto[];
}
