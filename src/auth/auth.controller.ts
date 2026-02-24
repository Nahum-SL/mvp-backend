import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // Cambiamos de 201 (Created) a 200 (OK) para el login
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Ruta de prueba para verificar que el Token funciona
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req) {
    // Gracias a la JwtStrategy, los datos del usuario están en req.user
    return {
      message: 'Acceso concedido a la Intranet',
      user: req.user,
    };
  }
}
