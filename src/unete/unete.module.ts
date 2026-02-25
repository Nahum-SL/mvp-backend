import { Module } from '@nestjs/common';
import { UneteController } from './unete.controller';
import { UneteService } from './unete.service';

@Module({
  controllers: [UneteController],
  providers: [UneteService],
})
export class UneteModule {}
