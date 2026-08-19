import { Module } from '@nestjs/common';
import { IntranetService } from './intranet.service';
import { IntranetController } from './intranet.controller';

@Module({
  providers: [IntranetService],
  controllers: [IntranetController],
})
export class IntranetModule {}
