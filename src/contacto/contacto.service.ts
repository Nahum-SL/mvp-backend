import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateContactoDto } from './dto/create-contact.dto';
import { ContactStatus } from 'generated/prisma/enums';

@Injectable()
export class ContactoService {
  constructor(private prisma: PrismaService) {}

  // Público: Registro desde el Landing Page
  async create(createContactoDto: CreateContactoDto) {
    try {
      return await this.prisma.contacto.create({
        data: {
          ...createContactoDto,
          fechaNac: new Date(createContactoDto.fechaNac),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al registrar el contacto: ' + error.message,
      );
    }
  }

  // ---------- RUTAS ADMINISTRATIVAS ---------- //

  // Privado: Gestión administrativa
  async findAll() {
    return this.prisma.contacto.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const contacto = await this.prisma.contacto.findUnique({ where: { id } });
    if (!contacto)
      throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
    return contacto;
  }

  async updateStatus(id: string, status: ContactStatus) {
    await this.findOne(id); // Validamos que exista
    return this.prisma.contacto.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contacto.delete({ where: { id } });
  }
}
