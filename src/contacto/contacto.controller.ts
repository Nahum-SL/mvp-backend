import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './dto/create-contact.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('contacto')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  // Endpoint PÚBLICO para el formulario del Home
  @Post()
  create(@Body() createContactoDto: CreateContactoDto) {
    return this.contactoService.create(createContactoDto);
  }

  // Endpoint PRIVADO para que el equipo de ASESCON vea los contactos recibidos
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.contactoService.findAll();
  }
}
