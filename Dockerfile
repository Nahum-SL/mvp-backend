# 1. Etapa de Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .

# Generamos con variables dummy para que NestJS pueda compilar (Build)
RUN DATABASE_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
    DIRECT_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
    pnpm exec prisma generate

RUN pnpm run build

# 2. Etapa de Ejecución (Runner)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm

# Copiamos archivos necesarios
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/dist ./dist

# Instalamos solo prod (pnpm limpia node_modules aquí)
RUN pnpm install --prod --frozen-lockfile

# 👇 LA CLAVE: Generar el cliente JUSTO después de instalar prod
# Usamos 'pnpm exec' en lugar de 'npx' para asegurar que use el binario local
RUN DATABASE_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
    DIRECT_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
    pnpm exec prisma generate

EXPOSE 3001

# Comando final: Railway inyectará las variables REALES aquí
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]