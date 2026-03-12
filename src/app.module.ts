import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UneteModule } from './unete/unete.module';
import { IntranetModule } from './intranet/intranet.module';
import { ContactoModule } from './contacto/contacto.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './blog/post/post.module';
import { CategoryModule } from './blog/category/category.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { AdminModule } from './admin/admin.module';
import { ServicioModule } from './servicios/servicio.module';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    UneteModule,
    IntranetModule,
    ContactoModule,
    AuthModule,
    PostsModule,
    CategoryModule,
    AdminModule,
    ServicioModule,
  ],
})
export class AppModule {}
