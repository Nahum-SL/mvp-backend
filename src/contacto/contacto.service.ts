import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateContactoDto } from './dto/create-contact.dto';
import { ContactStatus } from 'generated/prisma/enums';
@Injectable()
export class ContactoService {
  constructor(private prisma: PrismaService) {}

  async create(createContactoDto: CreateContactoDto) {
    try {
      return await this.prisma.contacto.create({
        data: {
          ...createContactoDto,
          fechaNac: new Date(createContactoDto.fechaNac), // Convertimos string a Date de JS
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'No se pudo procesar el formulario de contacto',
      );
    }
  }

  // Este método solo lo usaría el ADMIN desde la Intranet para ver los leads
  async findAll() {
    return this.prisma.contacto.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: number, status: ContactStatus) {
    return this.prisma.contacto.update({
      where: { id },
      data: { status },
    });
  }
}
