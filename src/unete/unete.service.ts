import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UneteService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.jobApplication.create({
      data: {
        ...data,
        status: 'PENDIENTE',
      },
    });
  }
}
