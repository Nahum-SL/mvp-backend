// src/intranet/intranet.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from '@prisma/client';
// Actions
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { intranetSelect } from './constants/intranet.select';

@Injectable()
export class IntranetService {
  constructor(private readonly prisma: PrismaService) {}
  // Probando con admin
  async getLinks() {
    const res = await this.prisma.intranetLink.findMany({
      select: intranetSelect,
      orderBy: { order: 'asc' },
    });
    return res;
  }

  // Buscar por ID
  async findOne(id: number) {
    const link = await this.prisma.intranetLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException(`Link con ID ${id} no encontrado`);
    return link;
  }

  // Crear el Link
  async create(data: CreateLinkDto) {
    return await this.prisma.intranetLink.create({ data });
  }

  // Actualizar Link
  async update(id: number, data: UpdateLinkDto) {
    await this.findOne(id); // Valida si existe
    return await this.prisma.intranetLink.update({
      where: { id },
      data,
    });
  }

  // Eliminar Link
  async delete(id: number) {
    await this.findOne(id);
    return await this.prisma.intranetLink.delete({ where: { id } });
  }

  // --- MÉTODOS PARA PUBLICOS ---
  async findPublicLinks(role: string) {
    // Si el usuario es ADMIN, ve todos (incluso los no visibles)
    // Si es USER, solo ve los visibles.
    const isAdmin = role === Role.ADMIN || role === Role.OWNER;
    const whereCondition = isAdmin ? {} : { isVisible: true };

    const link = await this.prisma.intranetLink.findMany({
      where: whereCondition,
      orderBy: { order: 'asc' },
    });

    return link;
  }
}
