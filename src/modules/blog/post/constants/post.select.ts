import { Prisma } from '@prisma/client';

export const postSelect = {
  id: true,
  title: true,
  slug: true,
  image: true,
  published: true,
  createdAt: true,
  category: {
    select: { name: true },
  },
  author: {
    select: { name: true },
  },
} satisfies Prisma.PostSelect;
