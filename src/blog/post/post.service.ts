import { Injectable } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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

  // Actualizar
  async update(id: number, updatePostDto: UpdatePostDto, imageUrl?: string) {
    return await prismaAdp.post.update({
      where: { id },
      data: {
        ...updatePostDto,
        ...(imageUrl && { image: imageUrl }), // Solo actualiza la imagen si viene una nueva URL
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
  // En post.service.ts
  async findAllPublic() {
    return await prismaAdp.post.findMany({
      where: { published: true }, // 👈 Importante para que no se vean los borradores en el Home
      orderBy: { createdAt: 'desc' },
      include: { author: true, category: true },
    });
  }

  async findOneBySlug(slug: string) {
    const post = await prismaAdp.post.findUnique({
      where: { slug },
      include: {
        category: true,
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) return null;
    return post;
  }
}
