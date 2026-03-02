import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// IMPORTANTE: Importa desde tu carpeta generada
import { PrismaClient } from 'generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import * as ws from 'ws';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // 1. Corregimos el error de WebSocket asignando como 'any'
    // Esto es necesario porque el tipado de 'ws' y 'neonConfig' no coinciden exactamente
    if (!global.WebSocket) {
      neonConfig.webSocketConstructor = ws as any;
    }

    // 2. Usamos la configuración que te funcionó en db.ts
    // Pasamos el objeto de configuración directamente a PrismaNeon
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL!,
    });

    // 3. Pasamos el adapter al super constructor
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
