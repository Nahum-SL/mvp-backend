// src/intranet/intranet.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IntranetService } from './intranet.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { Role } from '@prisma/client';

@Controller('intranet')
export class IntranetController {
  constructor(private readonly intranetService: IntranetService) {}

  // RUTA PÚBLICA (Para el dashboard del usuario logueado)
  @UseGuards(AuthGuard('jwt'))
  @Get('links')
  async getMyLinks(@Req() req: any) {
    const user = req.user;
    const links = await this.intranetService.getLinksByRole(user.role);
    return {
      userName: user.name,
      role: user.role,
      links,
    };
  }

  // RUTA TOTALMENTE PÚBLICA
  @Get('public-links')
  async getPublicLinks() {
    // Al no pasarle argumentos, el service aplicará { isVisible: true }
    return await this.intranetService.findPublicLinks();
  }

  // ------- RUTAS DE ADMINISTRACIÓN --------
  @UseGuards(AuthGuard('jwt')) // Aquí podrías añadir un RolesGuard(Role.ADMIN)
  @Get('admin/all')
  async findAll() {
    return this.intranetService.getLinksByRole(Role.OWNER || Role.ADMIN);
  }

  // Endpoint para crear link
  @UseGuards(AuthGuard('jwt'))
  @Post('admin/create')
  async create(@Body() createLinkDto: CreateLinkDto) {
    return this.intranetService.create(createLinkDto);
  }

  // Endpoint para actualizar link
  @Patch('admin/update/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLinkDto: UpdateLinkDto,
  ) {
    return this.intranetService.update(id, updateLinkDto);
  }

  // Endpoint para eliminar link
  @UseGuards(AuthGuard('jwt'))
  @Delete('admin/delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.intranetService.remove(id);
  }

  @Get('admin/link/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.intranetService.findOne(id);
  }
}
