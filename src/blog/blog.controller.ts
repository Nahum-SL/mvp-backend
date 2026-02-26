import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-blog.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get() // Endpoint público para Next.js
  findAll() {
    return this.blogService.findAllPublished();
  }

  @UseGuards(AuthGuard('jwt')) // Solo personal de ASESCON logueado
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // Max 2MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: any,
  ) {
    // 1. Subir imagen a Cloudinary en carpeta 'blog'
    const upload = await this.cloudinaryService.uploadFile(file, 'blog');

    // 2. Guardar post
    return this.blogService.create(createPostDto, upload.secure_url);
  }

  @Get(':slug') // GET /api/v1/blog/consejos-tributarios
  findOne(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }
}
