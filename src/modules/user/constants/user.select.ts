import { Prisma } from '@prisma/client';

export const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;
