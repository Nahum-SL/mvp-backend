import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UneteService } from './unete.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { UpdateApplicationStatusDto } from './dto/update-aplication-status.dto';

@Controller('unete')
export class UneteController {
  constructor(
    private readonly uneteService: UneteService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('cv')) // 'cv' es el nombre del campo en el formulario
  async create(
    @Body() createDto: CreateApplicationDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // Max 5MB
          new FileTypeValidator({ fileType: 'pdf' }), // Solo PDFs
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // 1. Subir a Cloudinary
    const upload = await this.cloudinaryService.uploadFile(file, 'cvs');

    // 2. Guardar en Neon con la URL de Cloudinary
    return this.uneteService.create({
      ...createDto,
      cvUrl: upload.secure_url,
    });
  }
  @UseGuards(AuthGuard('jwt')) // Solo el admin logueado
  @Get()
  findAll() {
    return this.uneteService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
  ) {
    return this.uneteService.update(id, updateDto.status);
  }
}
