import { ConflictException } from '@nestjs/common';

export const PrismaErrorMessage = {
  P2002: {
    status: ConflictException,
    message: 'A record with these values already exists',
  },
  p2025: {
    status: ConflictException,
    message: 'The requested record was not found',
  },
} as const;

// De esta manera, para que cuando prisma saque un nuevo filtro
// Los cambios se agregan de manera limpia y mantenible
