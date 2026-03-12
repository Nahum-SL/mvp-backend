import { Module } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { ServicioController } from './servicio.controller';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [ServicioController],
  providers: [ServicioService],
  exports: [ServicioService], // Por si lo necesitas en el dashboard de admin
})
export class ServicioModule {}
