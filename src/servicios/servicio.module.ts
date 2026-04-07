import { Module } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { ServicioController } from './servicio.controller';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { RecommendationModule } from './recommendation/recommendation.module';

@Module({
  imports: [CloudinaryModule, RecommendationModule],
  controllers: [ServicioController],
  providers: [ServicioService],
  exports: [ServicioService], // Por si lo necesitas en el dashboard de admin
})
export class ServicioModule {}
