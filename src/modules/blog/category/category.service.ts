import { Injectable, ConflictException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-categoy.dto';
import { generateSlug } from 'src/common/utils/slug.utils';

import { PrismaErrorMessage } from 'src/common/constants/prisma-errors';

import { PrismaService } from 'prisma/prisma.service';
@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}
  //
  async create(dto: CreateCategoryDto) {
    const slug = generateSlug(dto.slug || dto.name);

    try {
      return await this.prisma.category.create({
        data: { ...dto, slug },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      if (message === 'P2002') {
        throw new ConflictException(PrismaErrorMessage.P2002);
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } }, // Útil para ver cuántos posts tiene cada una
    });
  }
}
