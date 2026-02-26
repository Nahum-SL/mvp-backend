import { Module } from '@nestjs/common';
import { UneteController } from './unete.controller';
import { UneteService } from './unete.service';
import { CloudinaryModule } from 'src/common/cloudinary/clodinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [UneteController],
  providers: [UneteService],
})
export class UneteModule {}
