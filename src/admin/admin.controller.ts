// src/admin/admin.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt')) // Considera crear un RolesGuard si hay 'Editor' vs 'SuperAdmin'
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getDashboardStats() {
    // Es buena práctica envolver esto en un log para saber quién accede a las métricas
    return this.adminService.getStats();
  }
}
