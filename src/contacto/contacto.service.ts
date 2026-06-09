import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { CreateContactoDto } from './dto/create-contact.dto';
import { ContactStatus } from '@prisma/client';
import { AuditService } from 'src/audit/audit.service';

@Injectable()
export class ContactoService {
  constructor(private auditService: AuditService) {}
  // Público: Registro desde el Landing Page
  async create(createContactoDto: CreateContactoDto) {
    try {
      return await prismaAdp.contacto.create({
        data: {
          name: createContactoDto.name,
          email: createContactoDto.email,
          telefono: createContactoDto.telefono,
          fechaNac: new Date(createContactoDto.fechaNac),
          comentario: createContactoDto.comentario || null,
          status: ContactStatus.PENDING,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';

      try {
        await this.auditService.log(
          'ERROR',
          `Error al guardar contacto de ${createContactoDto.email}`,
          message, // 👈 Pasamos directamente el string plano que te da el catch
        );
      } catch (auditError) {
        console.error('Error crítico guardando la auditoría:', auditError);
      }

      throw new InternalServerErrorException(
        `Error al registrar el contacto: ${message}`,
      );
    }
  }

  // ---------- RUTAS ADMINISTRATIVAS ---------- //

  // Privado: Gestión administrativa
  async findAll() {
    console.time('contact');
    const res = await prismaAdp.contacto.findMany({
      select: {
        id: true,
        email: true,
        telefono: true,
        fechaNac: true,
        status: true,
        comentario: true,
        createdAt: true,
        name: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    console.timeEnd('contact');
    return res;
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
