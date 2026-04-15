// dto/update-application-status.dto.ts
import { IsEnum } from 'class-validator';
import { JobAppStatus } from '@prisma/client';

export class UpdateApplicationStatusDto {
  @IsEnum(JobAppStatus)
  status!: JobAppStatus;
}
