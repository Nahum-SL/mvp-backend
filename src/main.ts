import 'dotenv/config';
import { ValidationPipe, Logger } from '@nestjs/common'; // Añadimos Logger
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefijo para todas las rutas: http://tu-url.com/api/...
  app.setGlobalPrefix('api');

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configuración de CORS Dinámica y Flexible
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
      ];

      // Lógica: Permitir si no hay origen (Postman/Server),
      // si está en la lista oficial, o si termina en .vercel.app
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado por política CORS de ASESCON'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(cookieParser);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 ASESCON API corriendo en: http://localhost:${port}/api`);
}
void bootstrap();
