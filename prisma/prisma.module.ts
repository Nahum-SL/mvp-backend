import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Hace el servicio disponible globalmente
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
