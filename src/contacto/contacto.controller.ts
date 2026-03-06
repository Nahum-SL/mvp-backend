import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './dto/create-contact.dto';
import { UpdateContactStatusDto } from './dto/update-contact.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('contacto')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  // -----------------------------------------------------------
  // RUTA PÚBLICA: Para clientes en el Home/Landing
  // -----------------------------------------------------------
  @Post('enviar')
  create(@Body() createContactoDto: CreateContactoDto) {
    return this.contactoService.create(createContactoDto);
  }

  // -----------------------------------------------------------
  // RUTAS ADMINISTRATIVAS: Protegidas por JWT
  // -----------------------------------------------------------
  @UseGuards(AuthGuard('jwt'))
  @Get('admin/all')
  findAll() {
    return this.contactoService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.contactoService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('admin/status/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateContactStatusDto,
  ) {
    return this.contactoService.updateStatus(id, updateDto.status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('admin/delete/:id')
  remove(@Param('id') id: string) {
    return this.contactoService.remove(id);
  }
}
