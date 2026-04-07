import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { RecommendationService } from './recommendation/recommendation.service';

import { ServiceFilters } from './recommendation/type';
@Injectable()
export class ServicioService {
  constructor(private recommendationService: RecommendationService) {}

  async create(createServicioDto: CreateServicioDto, imageUrl?: string) {
    // 1. Extraemos features y limpiamos los datos que vienen del FormData
    const { features, ...data } = createServicioDto;

    return await prismaAdp.service.create({
      data: {
        ...data,
        // Aseguramos tipos correctos para Prisma/PostgreSQL
        icon: data.icon || null,
        image: imageUrl || null,

        // Manejo de Arrays (NestJS/Multer a veces los agrupa raro si vienen de FormData)
        businessTypes: Array.isArray(data.businessTypes)
          ? data.businessTypes
          : data.businessTypes
            ? [data.businessTypes]
            : [],

        painPoints: Array.isArray(data.painPoints) ? data.painPoints : [],

        isVisible: String(data.isVisible) === 'true',
        order: Number(data.order || 0),

        // Relación 1:N con Features
        features: {
          create: Array.isArray(features)
            ? features.map((name) => ({ name }))
            : features
              ? [{ name: features }]
              : [],
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
    await this.findOneById(id);

    const updateData: any = {
      ...data,
      // Asegurar que sean arrays incluso si llegan como string desde FormData
      businessTypes: data.businessTypes
        ? Array.isArray(data.businessTypes)
          ? data.businessTypes
          : [data.businessTypes]
        : undefined,
      painPoints: data.painPoints
        ? Array.isArray(data.painPoints)
          ? data.painPoints
          : [data.painPoints]
        : undefined,
    };

    if (imageUrl) updateData.image = imageUrl; // Usar 'image' que es tu columna en DB
    if (data.order) updateData.order = Number(data.order);
    if (data.isVisible !== undefined)
      updateData.isVisible = String(data.isVisible) === 'true';

    return await prismaAdp.service.update({
      where: { id },
      data: {
        ...updateData,
        ...(features && {
          features: {
            deleteMany: {}, // Limpia las anteriores
            create: (Array.isArray(features) ? features : [features]).map(
              (name) => ({ name }),
            ),
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
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID inválido');
    }

    return await prismaAdp.service.findUnique({
      where: { id },
      include: { features: true },
    });
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

  async getRecommendation(filters: ServiceFilters) {
    const services = await prismaAdp.service.findMany({
      where: { isVisible: true },
      include: { features: true },
    });

    return this.recommendationService.buildRecommendation(services, filters);
  }
}
