// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos para la ruta
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene el decorador @Roles, se permite el acceso (es pública para logueados)
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario desde el request (inyectado por JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // 3. Verificar si el rol del usuario coincide con los permitidos
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Tu rol (${user.role}) no tiene permisos para acceder a este recurso.`,
      );
    }

    return true;
  }
}

// @Roles(Role.ADMIN)
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Post()

// o incluso
// @Roles(Role.ADMIN)
