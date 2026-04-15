import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    /**
     * Para el CLI (Migraciones), usamos la DIRECT_URL (puerto 5432).
     * Esto evita que las migraciones fallen por el Transaction Mode de Neon.
     * UNPOOLED CONNECTION
     */
    url: env('DIRECT_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'prisma/seed.ts',
  },
});
