# 1. Dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiamos archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalamos pnpm y dependencias
RUN corepack enable && pnpm i --frozen-lockfile

# 2. Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar el cliente de Prisma (Indispensable para NestJS)
RUN npx prisma generate

# Construir la aplicación
RUN corepack enable && pnpm run build

# 3. Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copiamos solo lo necesario para ejecutar
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Exponemos el puerto del backend
EXPOSE 3001

# Comando para desplegar migraciones e iniciar la app
# Esto asegura que Railway actualice la base de datos antes de arrancar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]