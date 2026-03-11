import { Injectable, NotFoundException } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServicioService {
  async create(createServicioDto: CreateServicioDto, imageUrl?: string) {
    const { features, ...data } = createServicioDto;

    return await prismaAdp.service.create({
      data: {
        ...data,
        icon: imageUrl || null,
        businessTypes: Array.isArray(data.businessTypes)
          ? data.businessTypes
          : [],
        painPoints: Array.isArray(data.painPoints) ? data.painPoints : [],
        isVisible: String(data.isVisible) === 'true',
        order: Number(data.order || 0),
        features: {
          create: features?.map((name) => ({ name })) || [],
        },
      },
      include: { features: true },
    });
  }

  async findAll(type?: string, pain?: string) {
    return await prismaAdp.service.findMany({
      where: {
        isVisible: true,
        ...(type && { businessTypes: { has: type } }),
        ...(pain && { painPoints: { has: pain } }),
      },
      include: { features: true },
      orderBy: { order: 'asc' },
    });
  }

  // Actualizar usando el ID numérico
  async update(
    id: number,
    updateServicioDto: UpdateServicioDto,
    imageUrl?: string,
  ) {
    const { features, ...data } = updateServicioDto;

    // 1. Verificar existencia con el helper ajustado a number
    await this.findOneById(id);

    const updateData: any = { ...data };

    if (imageUrl) updateData.icon = imageUrl;
    if (data.order) updateData.order = Number(data.order);
    if (data.isVisible !== undefined)
      updateData.isVisible = String(data.isVisible) === 'true';

    return await prismaAdp.service.update({
      where: { id }, // Prisma ahora espera un Int
      data: {
        ...updateData,
        ...(imageUrl && { image: imageUrl }),
        ...(features && {
          features: {
            deleteMany: {},
            create: features.map((name) => ({ name })),
          },
        }),
      },
      include: { features: true },
    });
  }

  async remove(id: number) {
    await this.findOneById(id);
    return await prismaAdp.service.delete({ where: { id } });
  }

  // Buscamos por slug (común para SEO en la web pública)
  async findOneBySlug(slug: string) {
    const servicio = await prismaAdp.service.findUnique({
      where: { slug },
      include: { features: true },
    });

    if (!servicio)
      throw new NotFoundException(`Servicio con slug ${slug} no encontrado`);
    return servicio;
  }

  // Helper interno ajustado a Number
  async findOneById(id: number) {
    const servicio = await prismaAdp.service.findUnique({
      where: { id },
      include: { features: true },
    });
    if (!servicio)
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    return servicio;
  }

  // Obtener datos para el admin
  async findAllAdmin() {
    return await prismaAdp.service.findMany({
      include: {
        features: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener datos para ser publicos
  async findAllPublic() {
    return await prismaAdp.service.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: 'desc' },
      include: { features: true },
    });
  }
}
