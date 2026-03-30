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
  // src/blog/post.service.ts

  async update(id: number, updatePostDto: UpdatePostDto, imageUrl?: string) {
    try {
      // 1. Validar que el post existe
      const postExists = await prismaAdp.post.findUnique({ where: { id } });
      if (!postExists) throw new Error('Post no encontrado');

      // 2. Limpiar los datos para Prisma
      const data: any = {};

      if (updatePostDto.title) data.title = updatePostDto.title;
      if (updatePostDto.excerpt) data.excerpt = updatePostDto.excerpt;
      if (updatePostDto.content) data.content = updatePostDto.content;

      // Forzamos conversión manual por seguridad
      if (updatePostDto.categoryId)
        data.categoryId = Number(updatePostDto.categoryId);

      // Manejo de booleanos desde String (FormData)
      if (updatePostDto.published !== undefined) {
        data.published = String(updatePostDto.published) === 'true';
      }

      if (imageUrl) data.image = imageUrl;

      // Solo actualizamos el slug si el título cambió
      if (updatePostDto.title && updatePostDto.title !== postExists.title) {
        const baseSlug = updatePostDto.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        data.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      return await prismaAdp.post.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('ERROR_EN_PRISMA:', error);
      throw error;
    }
  }

  async delete(id: number) {
    // 1. Buscamos el post para saber si existe y obtener la URL de la imagen
    const post = await prismaAdp.post.findUnique({ where: { id } });
    if (!post) throw new Error('Post no encontrado');

    // 2. Borramos de la base de datos
    await prismaAdp.post.delete({ where: { id } });

    // Retornamos el post completo por si el controlador necesita la URL de la imagen para borrarla de Cloudinary
    return post;
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

  // Buscar por Id
  async findOneById(id: number) {
    const post = await prismaAdp.post.findUnique({
      where: { id },
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
