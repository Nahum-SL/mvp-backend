import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { CreateContactoDto } from './dto/create-contact.dto';
import { ContactStatus } from 'generated/prisma/enums';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class ContactoService {
  constructor(private auditService: AuditService) {}
  // Público: Registro desde el Landing Page
  async create(createContactoDto: CreateContactoDto) {
    try {
      return await prismaAdp.contacto.create({
        data: {
          ...createContactoDto,
          fechaNac: new Date(createContactoDto.fechaNac),
        },
      });
    } catch (error) {
      await this.auditService.log(
        'ERROR',
        `Error al guardar contacto de ${createContactoDto.email}`,
        error.message,
      );
      throw new InternalServerErrorException(
        'Error al registrar el contacto: ' + error.message,
      );
    }
  }

  // ---------- RUTAS ADMINISTRATIVAS ---------- //

  // Privado: Gestión administrativa
  async findAll() {
    return prismaAdp.contacto.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const contacto = await prismaAdp.contacto.findUnique({ where: { id } });
    if (!contacto)
      throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
    return contacto;
  }

  async updateStatus(id: string, status: ContactStatus) {
    await this.findOne(id); // Validamos que exista
    return prismaAdp.contacto.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return prismaAdp.contacto.delete({ where: { id } });
  }
}
