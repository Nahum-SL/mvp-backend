// dto/update-application-status.dto.ts
import { IsEnum } from 'class-validator';
import { JobAppStatus } from 'generated/prisma/enums';

export class UpdateApplicationStatusDto {
  @IsEnum(JobAppStatus)
  status: JobAppStatus;
}
