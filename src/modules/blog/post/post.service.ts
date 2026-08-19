import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
// Services
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { PrismaService } from 'prisma/prisma.service';
// Actions
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

// Utils
import { generateSlug } from 'src/common/utils/slug.utils';
import { calculateReadingTime } from 'src/common/utils/reading-time.utils';
import { postSelect } from './constants/post.select';

// Filter
import { PostAdminFiltersDto } from './filters/post-filters.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  private readonly logger = new Logger(PostsService.name);

  async create(
    data: CreatePostDto,
    file: Express.Multer.File,
    authorId: string,
  ) {
    let image: string | undefined;
    if (file) {
      const upload = await this.cloudinaryService.uploadFile(file, 'blog');
      image = upload.secure_url;
    }

    const safeSlug = generateSlug(data.slug || data.title);
    return this.prisma.post.create({
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        // Usamos el ID de categoría que viene del DTO
        categoryId: data.categoryId,
        // Relacionamos con el autor (String)
        authorId: authorId,
        image: image,
        published: String(data.published) === 'true', // Manejo robusto de FormData
        slug: safeSlug,
        readingTime: calculateReadingTime(data.content),
      },
      include: {
        category: true,
        author: { select: { name: true } },
      },
    });
  }

  // Actualizar
  // src/blog/post.service.ts

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    file?: Express.Multer.File,
  ) {
    // 1. Validar que el post existe
    const currentPost = await this.prisma.post.findUnique({ where: { id } });
    if (!currentPost) throw new NotFoundException('Post no encontrado');

    // 2. Limpiar los datos para Prisma
    const data: Prisma.PostUpdateInput = {};

    if (updatePostDto.title) data.title = updatePostDto.title;
    if (updatePostDto.excerpt) data.excerpt = updatePostDto.excerpt;
    if (updatePostDto.content) data.content = updatePostDto.content;

    // Manejo de booleanos desde String (FormData)
    if (updatePostDto.published !== undefined) {
      data.published = String(updatePostDto.published) === 'true';
    }

    if (file) {
      // Borrar imagen anterior si existe
      try {
        if (currentPost.image) {
          const publicId = this.cloudinaryService.extractPublicId(
            currentPost.image,
          );
          if (publicId) await this.cloudinaryService.deleteFile(publicId);
        }
        const upload = await this.cloudinaryService.uploadFile(file, 'blog');
        data.image = upload.secure_url;
      } catch {
        throw new InternalServerErrorException(
          'No fue posible actualizar la imagen',
        );
      }
    }

    // Solo actualizamos el slug si el título cambió
    if (updatePostDto.slug) {
      data.slug = generateSlug(updatePostDto.slug);
    }

    return await this.prisma.post.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    // 1. Buscamos el post para saber si existe y obtener la URL de la imagen
    const postId = await this.prisma.post.findUnique({ where: { id } });
    if (!postId) throw new NotFoundException('Post not found');

    // 2. Borramos de la base de datos
    const deletedPost = await this.prisma.post.delete({ where: { id } });

    // 2. Si tenía imagen, la borramos de Cloudinary
    if (deletedPost.image) {
      try {
        const publicId = this.cloudinaryService.extractPublicId(
          deletedPost.image,
        );
        if (publicId) {
          await this.cloudinaryService.deleteFile(publicId);
        }
      } catch (error) {
        // Logeamos el error pero no detenemos la respuesta,
        // ya que el post en DB ya se borró.
        this.logger.error('Error borrando imagen de Cloudinary:', error);
      }
    }

    // Retornamos el post completo por si el controlador necesita la URL de la imagen para borrarla de Cloudinary
    return postId;
  }

  async findAllAdmin(filters: PostAdminFiltersDto) {
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
      this.prisma.post.findMany({
        skip,
        take: limit,
        where,
        select: postSelect,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.post.count({ where }),
    ]);

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
    return await this.prisma.post.findMany({
      where: { published: true }, // 👈 Importante para que no se vean los borradores en el Home
      orderBy: { createdAt: 'desc' },
      include: { author: true, category: true },
    });
  }

  async findOneBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
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
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });
  }
}

// Usar ParseIntPipe para eliminar conversiones manuales y validaciones con Number() e isNaN().
// Si quieres medir rendimiento más adelante, utilizaría el
// Logger de Nest o incluso un interceptor de métricas.
// Los console.time suelen quedar como código de depuración.

// Uso de logger -->
// [PostsService] Imagen eliminada de Cloudinary
// [PostsService] Error eliminando imagen
// [PostsService] Slug generado automáticamente
