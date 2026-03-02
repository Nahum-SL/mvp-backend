import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JobAppStatus } from 'generated/prisma/enums';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class UneteService {
  constructor(private prisma: PrismaService) {}

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
  async update(id: number, status: JobAppStatus) {
    return this.prisma.jobApplication.update({
      where: { id },
      data: { status },
    });
  }

  // Obtener los datos
  async findAll() {
    return this.prisma.jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
