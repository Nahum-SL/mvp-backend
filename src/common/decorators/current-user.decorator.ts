import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

// Decorador personalizado para obtener el usuario actual desde el request
export const CurrentUser = createParamDecorator(
  (property: string | undefined, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;

    return property ? user?.[property] : user;
  },
);
