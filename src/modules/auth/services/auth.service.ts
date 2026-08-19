import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../dto/register.dto';
import { LogindDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { EmailService } from 'src/modules/email/email.service';

import { AuditService } from 'src/modules/audit/audit.service';
import { AuditActions } from 'src/modules/audit/constants/audit-action';

import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
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
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(
        `Error al crear el usuario.: ${message}`,
      );
    }
  }

  // --- LOGIN Y GENERACIÓN DE TOKEN ---
  async login(loginDto: LogindDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    // CASO: Usuario no existe o contraseña incorrecta
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await this.auditService.log(
        AuditActions.LOGIN_FAILED,
        'FAILED',
        `Credenciales inválidas para: ${email}`,
        { ip: '...', userAgent: '...' }, // Opcional: capturar datos del request
      );
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // --- LÓGICA DE SEGURIDAD PARA ROLES DE PODER ---
    if (user.role === 'OWNER' || user.role === 'ADMIN') {
      const generatedCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      // Guardar en DB con expiración
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorCode: await bcrypt.hash(generatedCode, 10),
          twoFactorExpires: new Date(Date.now() + 5 * 60000),
        },
      });

      // --- IMPLEMENTACIÓN DEL ENVÍO DE EMAIL ---
      try {
        // Llamamos al servicio de email que configuramos con Resend
        await this.emailService.send2FACode(user.email, generatedCode);
      } catch {
        throw new InternalServerErrorException(
          'No fue posible enviar el codigo de verificación.',
        );
      }

      await this.auditService.log(
        AuditActions.TWO_FACTOR_SENT,
        'INFO',
        `Código 2FA generado y enviado a ${email}`,
      );

      return {
        requires2FA: true,
        email: user.email,
        message: 'Se ha enviado un código de verificación a tu correo.',
      };
    }
  }

  // Verificador de 2 pasos
  async verify2FA(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.twoFactorCode || !user.twoFactorExpires) {
      throw new UnauthorizedException(
        'No hay un proceso de verificación activo.',
      );
    }

    if (new Date() > user.twoFactorExpires) {
      throw new UnauthorizedException(
        'El código ha expirado. Solicite uno nuevo.',
      );
    }

    const isCodeValid = await bcrypt.compare(code, user.twoFactorCode);
    if (!isCodeValid) {
      // LOG: Intento de 2FA fallido
      await this.auditService.log(
        AuditActions.LOGIN_FAILED,
        'FAILED',
        `Código 2FA incorrecto para ${email}`,
      );
      throw new UnauthorizedException('Código de verificación incorrecto.');
    }

    // LOG: Verificación exitosa
    await this.auditService.log(
      AuditActions.TWO_FACTOR_VERIFIED,
      'SUCCESS',
      `Login administrativo completado: ${email}`,
    );

    // Limpiar el código de la DB después de usarlo
    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: null, twoFactorExpires: null },
    });

    // Entregar el Token Final
    const payload: JwtPayload = {
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
      },
      backendToken: this.jwtService.sign(payload),
    };
  }
}
