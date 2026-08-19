import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from 'prisma/prisma.module';

import { HealthModule } from './modules/health/health.module';

import { UneteModule } from './modules/unete/unete.module';
import { IntranetModule } from './modules/intranet/intranet.module';
import { ContactoModule } from './modules/contacto/contacto.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/blog/post/post.module';
import { CategoryModule } from './modules/blog/category/category.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { AdminModule } from './modules/admin/admin.module';
import { ServicioModule } from './modules/servicios/servicio.module';
import { AuditModule } from './modules/audit/audit.module';
import { RecommendationModule } from './modules/servicios/recommendation/recommendation.module';
import { UserModule } from './modules/user/user.module';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import cloudinaryConfig from './config/cloudinary.config';
import analyticsConfig from './config/analytics.config';
import emailConfig from './config/email.config';
import adminConfig from './config/admin.config';

import { validationSchema } from './config/validation';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    // Prisma
    PrismaModule,
    // Health
    HealthModule,
    // Admin
    AdminModule,
    // Auth
    AuthModule,
    // User
    UserModule,
    //Blog
    PostsModule,
    CategoryModule,
    // Cloudinary
    CloudinaryModule,
    // Contacto
    ContactoModule,
    // Intranet
    IntranetModule,
    // Unete
    UneteModule,
    // Servicio
    ServicioModule,
    RecommendationModule,
    // Auditoría
    AuditModule,
    // Configuracion de la aplicación
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        cloudinaryConfig,
        analyticsConfig,
        emailConfig,
        adminConfig,
      ],
      validationSchema,
    }),
  ],
})
export class AppModule {}
