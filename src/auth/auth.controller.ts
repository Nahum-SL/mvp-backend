import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
// Roles
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/role.decorator';
import { Role } from '@prisma/client';

import { Verify2faDto } from './dto/verify2.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // Cambiamos de 201 (Created) a 200 (OK) para el login
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // EJEMPLO 1: Ruta solo para OWNER (Configuraciones críticas)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER)
  @Get('owner-only')
  getOwnerData() {
    return { message: 'Bienvenido, Gerencia General.' };
  }

  // EJEMPLO 2: Ruta para ADMIN o OWNER (Gestión de Blog/Servicios)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.OWNER, Role.ADMIN)
  @Get('admin-dashboard')
  getAdminData() {
    return { message: 'Acceso al panel de control administrativo.' };
  }

  // --- AÑADE ESTA RUTA ---
  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  async verify2FA(@Body() body: Verify2faDto) {
    return this.authService.verify2FA(body.email, body.code);
  }
}
