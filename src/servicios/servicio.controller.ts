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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicioService } from './servicio.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Controller('servicio')
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
      const upload = await this.cloudinaryService.uploadFile(file, 'servicios');
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
      const upload = await this.cloudinaryService.uploadFile(file, 'servicios');
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

  @Get()
  findAllPublic() {
    return this.servicioService.findAllPublic();
  }

  // PÚBLICO: Para el "Selector de Soluciones" en el frontend
  @Get()
  findAll(@Query('type') type?: string, @Query('pain') pain?: string) {
    return this.servicioService.findAll(type, pain);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.servicioService.findOneBySlug(slug);
  }
}
