import { Module } from '@nestjs/common';
import { IntranetService } from './intranet.service';
import { IntranetController } from './intranet.controller';

@Module({
  controllers: [IntranetService],
  providers: [IntranetController],
})
export class IntranetModule {}
