# 1. Dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Dependencias y Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalamos pnpm de forma estable
RUN npm install -g pnpm

# Copiamos archivos de configuración
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Instalamos todas las dependencias (incluyendo devDeps para el build)
RUN pnpm install --frozen-lockfile

# Copiamos el código fuente
COPY . .

# Generar el cliente de Prisma (Indispensable para NestJS)
RUN DATABASE_URL='postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' DIRECT_URL='postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' npx prisma generate
RUN pnpm run build

# 3. Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN npm install -g pnpm

# Copiamos solo lo necesario para ejecutar
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Al tener 'prisma' en dependencies, se instalará aquí también
RUN pnpm install --prod --frozen-lockfile && pnpm exec prisma generate

# Exponemos el puerto del backend
EXPOSE 3001

# Comando para desplegar migraciones e iniciar la app
# Usamos la ruta que confirmó el log: dist/src/main.js
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]