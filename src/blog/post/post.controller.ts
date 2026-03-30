import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './post.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
// Acciones
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('/post')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(AuthGuard('jwt')) // Protegemos la ruta
  @Post()
  @UseInterceptors(FileInterceptor('image')) // 'image' debe coincidir con el nombre en el FormData del frontend
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any, // Para obtener el ID del admin desde el JWT
  ) {
    // 1. Subir imagen a Cloudinary (carpeta 'blog')
    let imageUrl = '';

    if (file) {
      const upload = await this.cloudinaryService.uploadFile(file, 'blog');
      imageUrl = upload.secure_url;
    }

    const authorId = req.user.id || req.user.userId;

    // 2. Guardar en base de datos
    return this.postsService.create(
      createPostDto,
      imageUrl,
      authorId, // Asumiendo que tu JWT Strategy guarda el id en 'userId'
    );
  }

  // Actualizar
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const postId = Number(id);

    // 1. Validación de seguridad: Si no es un número válido, lanzamos error 400
    if (isNaN(postId)) {
      throw new BadRequestException('El ID del post debe ser un número válido');
    }

    // 2. Ahora sí buscamos el post con seguridad
    const currentPost = await this.postsService.findOneById(postId);

    if (!currentPost) {
      throw new NotFoundException(`Post con ID ${postId} no encontrado`);
    }

    let imageUrl: string | undefined;

    if (file) {
      // Borrar imagen anterior si existe
      if (currentPost.image) {
        const publicId = this.cloudinaryService.extractPublicId(
          currentPost.image,
        );
        if (publicId) await this.cloudinaryService.deleteFile(publicId);
      }
      const upload = await this.cloudinaryService.uploadFile(file, 'blog');
      imageUrl = upload.secure_url;
    }

    return this.postsService.update(postId, updatePostDto, imageUrl);
  }

  //Borrar
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const postId = Number(id);

    if (isNaN(postId)) {
      throw new BadRequestException('ID no válido');
    }

    // 1. Ejecutamos el borrado en el servicio
    const deletedPost = await this.postsService.delete(postId);

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
        console.error('Error borrando imagen de Cloudinary:', error);
      }
    }

    return { success: true, message: 'Post eliminado correctamente' };
  }

  @Get('admin') // Podrías crear una ruta específica para el admin
  @UseGuards(AuthGuard('jwt'))
  findAllAdmin() {
    return this.postsService.findAllAdmin();
  }

  @Get() // La ruta pública
  findAll() {
    return this.postsService.findAllPublic();
  }

  // Endpoint de getPostById() en Next.js -->
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOneById(Number(id));
    if (!post) {
      throw new NotFoundException(`Post con ID ${id} no encontrado`);
    }
    return post;
  }

  @Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    const post = await this.postsService.findOneBySlug(slug);
    if (!post) {
      throw new NotFoundException(`Post con slug ${slug} no encontrado`);
    }
    return post;
  }
}
