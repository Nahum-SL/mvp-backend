import 'dotenv/config';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const adapter = new PrismaNeon(
  { connectionString: process.env.DATABASE_URL! },
  { schema: 'myPostgresSchema' },
);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const prisma = new PrismaClient({ adapter });
