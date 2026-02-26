import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './post.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt')) // Protegemos la ruta
  @UseInterceptors(FileInterceptor('image')) // 'image' debe coincidir con el nombre en el FormData del frontend
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any, // Para obtener el ID del admin desde el JWT
  ) {
    // 1. Subir imagen a Cloudinary (carpeta 'blog')
    const upload = await this.cloudinaryService.uploadFile(file, 'blog');

    // 2. Guardar en base de datos
    return this.postsService.create(
      createPostDto,
      upload.secure_url,
      req.user.userId, // Asumiendo que tu JWT Strategy guarda el id en 'userId'
    );
  }
}
