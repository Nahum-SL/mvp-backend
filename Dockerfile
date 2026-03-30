# 1. Etapa de Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .


#Copiamos el build final
COPY --from=builder /app/dist ./dist

# 2. Etapa de Ejecución (Runner)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm

# Copiamos los archivos de configuración primero
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# INSTALACIÓN DE PRODUCCIÓN
# Esto instalará 'prisma' (porque ya lo moviste a dependencies)
RUN pnpm install --prod --frozen-lockfile

# Generamos solo para poder compilar el código TS
RUN DATABASE_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" DIRECT_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npx prisma generate

# Copiamos el código compilado
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Comando final
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]