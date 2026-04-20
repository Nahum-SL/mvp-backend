// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { prismaAdp } from 'src/db';
import { EmailService } from 'src/email/email.service';

import { AuditService } from 'src/audit/audit.service';
import { AuditActions } from 'src/audit/constants/audit-action';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}
  // ---------------
  // --- IGNORAR ---
  // ---------------
  // No esta en uso
  // --- REGISTRO DE USUARIOS ---
  // async register(registerDto: RegisterDto) {
  //   const { email, password, name, role, avatar } = registerDto;

  //   // 1. Encriptar contraseña con Bcrypt
  //   const salt = await bcrypt.genSalt(10);
  //   const hashedPassword = await bcrypt.hash(password, salt);

  //   try {
  //     const user = await prismaAdp.user.create({
  //       data: {
  //         email,
  //         password: hashedPassword,
  //         name,
  //         role,
  //         avatar,
  //       },
  //     });

  //     // No devolvemos el password en la respuesta
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     const { password: _, ...userWithoutPassword } = user;
  //     return userWithoutPassword;
  //   } catch (error) {
  //     const message =
  //       error instanceof Error ? error.message : 'Error desconocido';
  //     throw new InternalServerErrorException(
  //       `Error al crear el usuario.: ${message}`,
  //     );
  //   }
  // }
  // --------------
  // --- EN USO ---
  // --------------
  // --- LOGIN Y GENERACIÓN DE TOKEN ---
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await prismaAdp.user.findUnique({ where: { email } });

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
      await prismaAdp.user.update({
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
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Error desconocido';
        throw new InternalServerErrorException(
          `Error al enviar el código de seguridad: ${message}`,
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
    const user = await prismaAdp.user.findUnique({ where: { email } });

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
    await prismaAdp.user.update({
      where: { id: user.id },
      data: { twoFactorCode: null, twoFactorExpires: null },
    });

    // Entregar el Token Final
    const payload = { id: user.id, email: user.email, role: user.role };
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
