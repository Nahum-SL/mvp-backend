import { Prisma } from '@prisma/client';

export const intranetSelect = {
  id: true,
  title: true,
  description: true,
  url: true,
  icon: true,
  isVisible: true,
} satisfies Prisma.IntranetLinkSelect;
