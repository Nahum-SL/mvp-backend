import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Param,
  Delete,
  NotFoundException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './post.service';
// Actions
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostAdminFiltersDto } from './filters/post-filters.dto';
// Decorators
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from '@prisma/client';
// Guards
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('post')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard) // Protegemos la ruta
  @Post()
  @UseInterceptors(FileInterceptor('image')) // 'image' debe coincidir con el nombre en el FormData del frontend
  async create(
    @Body() dto: CreatePostDto,
    @UploadedFile() image: Express.Multer.File,
    @CurrentUser('id') authorId: string,
  ) {
    return this.postsService.create(dto, image, authorId);
  }

  // Actualizar
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.postsService.update(id, dto, image);
  }

  //Borrar
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.delete(id);
  }

  @Get('admin') // Podrías crear una ruta específica para el admin
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAllAdmin(@Query() filters: PostAdminFiltersDto) {
    return this.postsService.findAllAdmin(filters);
  }

  @Get('public') // La ruta pública
  findAll() {
    return this.postsService.findAllPublic();
  }

  @Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    const post = await this.postsService.findOneBySlug(slug);
    if (!post) {
      throw new NotFoundException(`Post con slug ${slug} no encontrado`);
    }
    return post;
  }

  // Endpoint de getPostById() en Next.js -->
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.findOneById(id);
    if (!post) {
      throw new NotFoundException(`Post con ID ${id} no encontrado`);
    }
    return post;
  }
}

// Usar ParseIntPipe para eliminar conversiones manuales y validaciones con Number() e isNaN().
