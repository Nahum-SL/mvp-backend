import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { prismaAdp } from 'src/db';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // --- REGISTRO DE USUARIOS ---
  async register(registerDto: RegisterDto) {
    const { email, password, name, role, avatar } = registerDto;

    // 1. Encriptar contraseña con Bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          avatar,
        },
      });

      // No devolvemos el password en la respuesta
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'El correo electrónico ya está registrado.',
        );
      }
      throw new InternalServerErrorException('Error al crear el usuario.');
    }
  }

  // --- LOGIN Y GENERACIÓN DE TOKEN ---
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Buscar el usupario en Neon por email
    const user = await prismaAdp.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (Email)');
    }

    // 2. Comparar el password enviado con el hash almacenado
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas (Password)');
    }

    // 3. Generar el JWT (Contiene el ID y el ROL del usuario)
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      // Este es el token que Next.js guardará en una Cookie o LocalStorage
      backendToken: this.jwtService.sign(payload),
    };
  }
}
