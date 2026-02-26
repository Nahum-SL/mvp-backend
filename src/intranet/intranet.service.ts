import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class IntranetService {
  constructor(private prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getLinksByRole(role: Role) {
    // Por ahora, traemos todos los visibles, pero podrías filtrar
    // Más adelante agregar un campo minRole a la tabla IntranetLink
    return this.prisma.intranetLink.findMany({
      where: {
        isVisible: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  // Busqueda en general
  async findAll() {
    return this.prisma.intranetLink.findMany({ orderBy: { order: 'asc' } });
  }
}
