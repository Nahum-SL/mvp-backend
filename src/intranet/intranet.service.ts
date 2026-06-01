// src/intranet/intranet.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { Role } from '@prisma/client';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class IntranetService {
  // Probando con admin
  async getLinksByRole(role?: Role) {
    // Si el usuario es ADMIN, ve todos (incluso los no visibles)
    // Si es USER, solo ve los visibles.
    const whereCondition = role === Role.ADMIN ? {} : { isVisible: true };

    return prismaAdp.intranetLink.findMany({
      where: whereCondition,
      orderBy: { order: 'asc' },
    });
  }

  // --- MÉTODOS PARA EL ADMIN ---

  async findAll() {
    console.time('intranet-links');
    const res = prismaAdp.intranetLink.findMany({
      select: {
        id: true,
        title: true,
        url: true,
        isVisible: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    });
    console.timeEnd('intranet-links');
    return res;
  }

  // Buscar por ID
  async findOne(id: number) {
    const link = await prismaAdp.intranetLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException(`Link con ID ${id} no encontrado`);
    return link;
  }

  // Crear el Link
  async create(data: CreateLinkDto) {
    return prismaAdp.intranetLink.create({ data });
  }

  // Actualizar Link
  async update(id: number, data: UpdateLinkDto) {
    await this.findOne(id); // Valida si existe
    return prismaAdp.intranetLink.update({
      where: { id },
      data,
    });
  }

  // Eliminar Link
  async remove(id: number) {
    await this.findOne(id);
    return prismaAdp.intranetLink.delete({ where: { id } });
  }
}
