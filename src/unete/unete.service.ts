import { Injectable, NotFoundException } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { JobAppStatus } from 'generated/prisma/enums';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class UneteService {
  async create(createDto: CreateApplicationDto & { cvUrl: string }) {
    return prismaAdp.jobApplication.create({
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
      return prismaAdp.jobApplication.update({
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
  async findAll() {
    return prismaAdp.jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
