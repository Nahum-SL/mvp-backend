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

import { FileInterceptor } from '@nestjs/platform-express';
// Actions
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-aplication-status.dto';
// Services
import { UneteService } from './unete.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
// Guards
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
// Decorators
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from '@prisma/client';

@Controller('unete')
export class UneteController {
  constructor(
    private readonly uneteService: UneteService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('submit')
  @UseInterceptors(FileInterceptor('cv')) // 'cv' es el nombre del campo en el formulario
  async create(
    @Body() dto: CreateApplicationDto,
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
      ...dto,
      cvUrl: upload.secure_url,
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard) // Solo el admin logueado
  @Get('admin')
  findAllAdmin() {
    return this.uneteService.findAdminAll();
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationStatusDto,
  ) {
    return this.uneteService.update(id, updateDto.status);
  }
}
