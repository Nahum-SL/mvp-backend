// src/contacto/dto/update-contact-status.dto.ts
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ContactStatus } from '@prisma/client';

export class UpdateContactStatusDto {
  @IsEnum(ContactStatus, {
    message: 'El estado debe ser PENDING, CONFIRMED, CANCELLED o COMPLETED',
  })
  @IsNotEmpty()
  status: ContactStatus;
}
