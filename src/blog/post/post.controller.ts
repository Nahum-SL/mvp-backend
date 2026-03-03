import {
  Controller,
  Post,
  Get,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './post.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';

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

  @Get()
  findAll() {
    return this.postsService.findAllAdmin();
  }
}
