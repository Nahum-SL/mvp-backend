// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { prismaAdp } from 'src/db';

@Injectable()
export class AdminService {
  async getStats() {
    // Ejecutamos todas las promesas en paralelo para máxima velocidad
    const [leadsCount, postsCount, linksCount] = await Promise.all([
      prismaAdp.contacto.count(),
      prismaAdp.post.count(),
      prismaAdp.intranetLink.count(),
    ]);

    return {
      leads: leadsCount,
      posts: postsCount,
      links: linksCount,
      views: '1.2k', // Esto vendría de una integración con Google Analytics o una tabla de logs
    };
  }
}
