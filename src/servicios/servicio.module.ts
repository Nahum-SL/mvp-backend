import { Module } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { ServicioController } from './servicio.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServicioController],
  providers: [ServicioService],
  exports: [ServicioService], // Por si lo necesitas en el dashboard de admin
})
export class ServicioModule {}
