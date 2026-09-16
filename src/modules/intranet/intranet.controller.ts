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
  ParseIntPipe,
} from '@nestjs/common';

// Services
import { IntranetService } from './intranet.service';
// Actions
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
// Guards
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
// Decorators
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('intranet')
export class IntranetController {
  constructor(private readonly intranetService: IntranetService) {}

  // Endpoint para crear link
  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createLinkDto: CreateLinkDto) {
    return this.intranetService.create(createLinkDto);
  }

  @Get('admin')
  async findAll() {
    return this.intranetService.getLinks();
  }

  // Obtener los links publicos
  @Get('public')
  async getPublicLinks(@CurrentUser('role') role: Role) {
    return await this.intranetService.findPublicLinks(role);
  }

  // Obtener de un link
  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.intranetService.findOne(id);
  }

  // Endpoint para actualizar link
  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLinkDto: UpdateLinkDto,
  ) {
    return this.intranetService.update(id, updateLinkDto);
  }

  // Endpoint para eliminar link
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.intranetService.delete(id);
  }
}
