// src/admin/dto/dashboard-stats.dto.ts
export class DashboardStatsDto {
  leads: number;
  posts: number;
  links: number;
  views: string; // La enviamos como string por si queremos formatearla (ej: "1.2k")
}
