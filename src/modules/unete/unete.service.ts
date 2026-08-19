import { Injectable, NotFoundException } from '@nestjs/common';
import { JobAppStatus } from '@prisma/client';
import { CreateApplicationDto } from './dto/create-application.dto';

import { PrismaService } from 'prisma/prisma.service';
import { uneteSelect } from './constants/unete.select';

@Injectable()
export class UneteService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createDto: CreateApplicationDto & { cvUrl: string }) {
    return this.prisma.jobApplication.create({
      data: {
        fullName: createDto.fullName,
        dni: createDto.dni,
        age: createDto.age,
        email: createDto.email,
        phone: createDto.phone,
        experience: createDto.experience,
        position: createDto.position,
        cvUrl: createDto.cvUrl,
        status: 'PENDIENTE',
      },
    });
  }

  // JobAppStatus: En el schema.prisma esta de esta manera -->
  // enum JobAppStatus {
  //   PENDIENTE
  //   REVISADO
  //   RECHAZADO
  // }

  // Actualizar
  async update(id: string, status: JobAppStatus) {
    try {
      return this.prisma.jobApplication.update({
        where: { id: id },
        data: { status },
      });
    } catch (error) {
      // Si Prisma no encuentra el ID, lanza un error específico
      throw new NotFoundException(
        error,
        `La postulación con ID ${id} no existe.`,
      );
    }
  }

  // Obtener los datos
  async findAdminAll() {
    const res = this.prisma.jobApplication.findMany({
      select: uneteSelect,
      orderBy: { createdAt: 'desc' },
    });
    return res;
  }
}
