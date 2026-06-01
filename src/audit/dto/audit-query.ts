import { IsOptional, IsString, IsEnum } from 'class-validator';

export class AuditQueryDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsEnum(['SUCCESS', 'FAILED', 'INFO', 'ERROR'])
  status?: string;

  @IsOptional()
  @IsString()
  limit?: string; // Para paginación básica
}

// Proximamente
// enum AuditStatus {
//   SUCCESS
//   FAILED
//   INFO
//   ERROR
// }
