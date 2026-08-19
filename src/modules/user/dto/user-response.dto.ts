import { Role } from '@prisma/client';

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  avatar!: string | null;
  role!: Role;
}

// Jamas se expone accidentalmente ->
// password
// TwoFactorCode
// TwoFactorExpires
