import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UneteModule } from './unete/unete.module';
import { IntranetModule } from './intranet/intranet.module';
import { ContactoModule } from './contacto/contacto.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    UneteModule,
    IntranetModule,
    ContactoModule,
    AuthModule, // <-- Me faltaba agregar esto
  ],
})
export class AppModule {}
