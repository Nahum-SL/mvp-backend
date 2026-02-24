import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'clave-secreta-asescon-2026',
    });
  }

  async validate(payload: { id: string; email: string }) {
    // Verificamos que el usuario aún exista en Neon
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user)
      throw new UnauthorizedException('Token no válido o usuario inexistente');

    // Lo que retornemos aquí se inyectará en el objeto 'req.user'
    return { id: user.id, email: user.email, role: user.role };
  }
}
