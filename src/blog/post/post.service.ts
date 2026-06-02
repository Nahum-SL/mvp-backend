import { Injectable } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';
import { PostAdminFiltersDto } from './filters/post-filters.dto';

import { Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  async create(data: CreatePostDto, imageUrl: string, authorId: string) {
    const safeSlug = slugify(data.slug || data.title, {
      lower: true,
      strict: true,
    });

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
        slug: safeSlug,
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
      if (updatePostDto.slug) {
        data.slug = slugify(updatePostDto.slug, {
          lower: true,
          strict: true,
        });
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

  async findAllAdmin(filters: PostAdminFiltersDto) {
    console.time('count');
    const { page = 1, limit = 10, search, categoryId, published } = filters;

    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      ...(search && {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),

      ...(categoryId && {
        categoryId,
      }),

      ...(published !== undefined && {
        published,
      }),
    };

    const [posts, totalItems] = await Promise.all([
      prismaAdp.post.findMany({
        skip,
        take: limit,
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          published: true,
          createdAt: true,
          category: {
            select: { name: true },
          },
          author: {
            select: { name: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      prismaAdp.post.count({ where }),
    ]);

    console.timeEnd('count');
    return {
      data: posts,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
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
