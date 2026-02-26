import 'dotenv/config';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// DATABASE_URL es la URL de conexión que usa la app (puerto 5432 con Transaction Mode). // POOLER
const adapter = new PrismaNeon(
  { connectionString: process.env.DATABASE_URL! },
  { schema: 'myPostgresSchema' },
);

export const prismaAdp = new PrismaClient({ adapter });
