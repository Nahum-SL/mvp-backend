import { Prisma } from '@prisma/client';

export const uneteSelect = {
  id: true,
  fullName: true,
  dni: true,
  age: true,
  email: true,
  phone: true,
  experience: true,
  position: true,
  cvUrl: true,
  status: true,
} satisfies Prisma.JobApplicationSelect;
