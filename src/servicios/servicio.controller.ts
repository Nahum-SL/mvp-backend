import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicioService } from './servicio.service';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
// Acciones
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Controller('/servicio')
export class ServicioController {
  constructor(
    private readonly servicioService: ServicioService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // PRIVADO: Solo admin puede crear
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createServicioDto: CreateServicioDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let imageUrl = '';

    if (file) {
      const upload = await this.cloudinaryService.uploadFile(file, 'servicio');
      imageUrl = upload.secure_url;
    }

    // Si no hay archivo, usamos el icono que venga en el DTO (Lucide ID)
    return this.servicioService.create(createServicioDto, imageUrl);
  }

  // PRIVADO: Actualizar servicio

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string, // Los params siempre llegan como string
    @Body() updateServicioDto: UpdateServicioDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const serviceId = Number(id);

    if (isNaN(serviceId)) {
      throw new BadRequestException('El ID del post debe ser un número válido');
    }

    const currentServicio = await this.servicioService.findOneById(serviceId);

    let imageUrl: string | undefined;

    if (file) {
      // 1. Limpieza: Si el servicio YA TENÍA una imagen en Cloudinary, la borramos
      if (currentServicio.image) {
        const publicId = this.cloudinaryService.extractPublicId(
          currentServicio.image,
        );
        if (publicId) await this.cloudinaryService.deleteFile(publicId);
      }

      // 2. Subir la nueva
      const upload = await this.cloudinaryService.uploadFile(file, 'servicio');
      imageUrl = upload.secure_url;
    }

    return this.servicioService.update(serviceId, updateServicioDto, imageUrl);
  }

  // Eliminar Servicio
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const serviceId = Number(id);
    const currentServicio = await this.servicioService.findOneById(serviceId);

    // 1. Si tiene imagen en la nube, borrarla primero
    if (currentServicio.image) {
      const publicId = this.cloudinaryService.extractPublicId(
        currentServicio.image,
      );
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }

    // 2. Borrar de la DB
    return this.servicioService.remove(serviceId);
  }

  @Get('admin') // Podrías crear una ruta específica para el admin
  @UseGuards(AuthGuard('jwt'))
  findAllAdmin() {
    return this.servicioService.findAllAdmin();
  }

  // Obtener por id
  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const servicio = await this.servicioService.findOneById(Number(id));
    if (!servicio) {
      throw new NotFoundException(`Servicio con ${id} no encontrado`);
    }
    return servicio;
  }

  @Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return await this.servicioService.findOneBySlug(slug);
  }

  // RUTA PÚBLICA (Única)
  // Maneja tanto el "ver todos" como el "selector inteligente" con Query Params
  @Get()
  findAll(@Query('type') type?: string, @Query('pain') pain?: string) {
    // Si no hay queries, el service debería devolver todos los visibles por defecto
    return this.servicioService.findAll(type, pain);
  }
}
