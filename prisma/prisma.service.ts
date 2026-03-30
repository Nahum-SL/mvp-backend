import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
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
    const connectionString = process.env.DATABASE_URL!;

    // 1. Caso: Producción con Neon (Usa el adaptador de WebSockets)
    if (connectionString.includes('neon.tech')) {
      if (!global.WebSocket) {
        neonConfig.webSocketConstructor = ws as any;
      }
      const adapter = new PrismaNeon({ connectionString });

      // Pasamos el adaptador dentro del objeto de configuración
      super({ adapter });
    }
    // 2. Caso: Local con Docker (Usa el driver TCP estándar)
    else {
      super({
        datasources: {
          db: {
            url: connectionString,
          },
        },
      } as any);
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
