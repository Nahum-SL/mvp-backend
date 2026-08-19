import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

import WebSocket from 'ws';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL!;
    const useNeon = process.env.USE_NEON_ADAPTER === 'true';

    // 1. Caso: Producción con Neon (Usa el adaptador de WebSockets)
    if (useNeon) {
      if (!neonConfig.webSocketConstructor) {
        neonConfig.webSocketConstructor = WebSocket;
      }
      const adapter = new PrismaNeon({ connectionString });

      // Pasamos el adaptador dentro del objeto de configuración
      super({ adapter });
    }
    // 2. Caso: Local con Docker (Usa el driver TCP estándar)
    else {
      super();
    }
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}

// Mas adelante -->
// super({
//     adapter,
// }).$extends(...)
