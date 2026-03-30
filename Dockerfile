# 1. Dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm i --frozen-lockfile

# 2. Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar el cliente de Prisma (Indispensable para NestJS)
RUN DATABASE_URL='postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' DIRECT_URL='postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' npx prisma generate

# Construir la aplicación
RUN corepack enable && pnpm run build

# 3. Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copiamos solo lo necesario para ejecutar
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# VOLVEMOS A INSTALAR solo PROD y GENERAR PRISMA
# Esto arregla el error de "Cannot find module .prisma/client"
RUN corepack enable && pnpm i --prod --frozen-lockfile

# Forzamos la generación del cliente usando el paquete directamente
# Si npx falla, usamos pnpm exec que es más confiable con pnpm
RUN pnpm exec prisma generate

# Exponemos el puerto del backend
EXPOSE 3001

# Comando para desplegar migraciones e iniciar la app
# Usamos la ruta que confirmó el log: dist/src/main.js
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]