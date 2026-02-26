import { Injectable } from '@nestjs/common';
import { prismaAdp } from 'src/db';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  async create(data: CreatePostDto, imageUrl: string, authorId: string) {
    // Generamos un slug simple: "Hola Mundo" -> "hola-mundo"
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return await prismaAdp.post.create({
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        slug: `${slug}-${Date.now().toString().slice(-4)}`, // Evitamos colisiones
        image: imageUrl,
        published: data.published,
        categoryId: data.categoryId,
        authorId: authorId, // Viene del token JWT
        readingTime: Math.ceil(data.content.split(' ').length / 200), // Estimado
      },
    });
  }
}
