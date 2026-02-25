import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(data: CreatePostDto, imageUrl: string) {
    const slug = this.generateSlug(data.title);

    // Verificar si el slug ya existe
    const existing = await this.prisma.post.findUnique({ where: { slug } });
    if (existing)
      throw new ConflictException('Ya existe un post con un título similar');

    return this.prisma.post.create({
      data: {
        ...data,
        slug,
        image: imageUrl,
      },
    });
  }

  // Para la web pública (Next.js)
  async findAllPublished() {
    return this.prisma.post.findMany({
      where: { published: true },
      include: {
        author: { select: { name: true, avatar: true } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Busqueda en la pagina /[slug]
  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
            role: true,
          },
        },
        category: true,
      },
    });

    // Si post no se encuentra
    if (!post) {
      throw new NotFoundException(`El artículo con slug "${slug}" no existe`);
    }

    return post;
  }
}
