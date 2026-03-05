// src/intranet/intranet.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from 'generated/prisma/enums';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class IntranetService {
  constructor(private prisma: PrismaService) {}

  // Probando con admin
  async getLinksByRole(role: Role) {
    // Si el usuario es ADMIN, ve todos (incluso los no visibles)
    // Si es USER, solo ve los visibles.
    const whereCondition = role === 'ADMIN' ? {} : { isVisible: true };

    return this.prisma.intranetLink.findMany({
      where: whereCondition,
      orderBy: { order: 'asc' },
    });
  }

  // --- MÉTODOS PARA EL ADMIN ---

  async findAll() {
    return this.prisma.intranetLink.findMany({
      orderBy: { order: 'asc' },
    });
  }

  // Buscar por ID
  async findOne(id: number) {
    const link = await this.prisma.intranetLink.findUnique({ where: { id } });
    if (!link) throw new NotFoundException(`Link con ID ${id} no encontrado`);
    return link;
  }

  // Crear el Link
  async create(data: CreateLinkDto) {
    return this.prisma.intranetLink.create({ data });
  }

  // Actualizar Link
  async update(id: number, data: UpdateLinkDto) {
    await this.findOne(id); // Valida si existe
    return this.prisma.intranetLink.update({
      where: { id },
      data,
    });
  }

  // Eliminar Link
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.intranetLink.delete({ where: { id } });
  }
}
