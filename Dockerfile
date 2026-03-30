# 1. Etapa de Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Instalamos dependencias
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copiamos el resto del código
COPY . .

# Generamos Prisma para poder compilar y luego hacemos el build
# Usamos URLs dummy solo para que no falle el paso de compilación
RUN DATABASE_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" DIRECT_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma generate
RUN pnpm run build

# 2. Etapa de Ejecución (Runner)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm

# Copiamos archivos de configuración necesarios para el Runner
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/dist ./dist

# Instalamos solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Generamos el cliente de Prisma final en el entorno de producción
# Usamos variables dummy de nuevo (Railway inyectará las reales en el CMD)
RUN DATABASE_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" DIRECT_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma generate

EXPOSE 3001

# Comando final para ejecutar migraciones y arrancar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]