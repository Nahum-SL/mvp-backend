import { Injectable } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  async create(data: CreatePostDto, imageUrl: string, authorId: string) {
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return await prismaAdp.post.create({
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        // Usamos el ID de categoría que viene del DTO
        categoryId: Number(data.categoryId),
        // Relacionamos con el autor (String)
        authorId: authorId,
        image: imageUrl,
        published: String(data.published) === 'true', // Manejo robusto de FormData
        slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
        readingTime: Math.ceil(data.content.split(' ').length / 200),
      },
      include: {
        category: true,
        author: { select: { name: true } },
      },
    });
  }

  // Añadimos este para la tabla del Admin en Next.js
  async findAllAdmin() {
    return await prismaAdp.post.findMany({
      include: {
        category: true,
        author: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
