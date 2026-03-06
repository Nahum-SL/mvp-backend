// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Ejecutamos todas las promesas en paralelo para máxima velocidad
    const [leadsCount, postsCount, linksCount] = await Promise.all([
      this.prisma.contacto.count(),
      this.prisma.post.count(),
      this.prisma.intranetLink.count(),
    ]);

    return {
      leads: leadsCount,
      posts: postsCount,
      links: linksCount,
      views: '1.2k', // Esto vendría de una integración con Google Analytics o una tabla de logs
    };
  }
}
