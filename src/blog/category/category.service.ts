import { Injectable, ConflictException } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { CreateCategoryDto } from './dto/create-categoy.dto';
import slugify from 'slugify'; // Opcional: pnpm add slugify

@Injectable()
export class CategoryService {
  //
  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || slugify(dto.name, { lower: true });

    try {
      return await prismaAdp.category.create({
        data: { ...dto, slug },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      if (message === 'P2002') {
        throw new ConflictException('La categoría o el slug ya existen');
      }
      throw error;
    }
  }

  async findAll() {
    return prismaAdp.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } }, // Útil para ver cuántos posts tiene cada una
    });
  }
}
