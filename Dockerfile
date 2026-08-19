FROM node:22-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Habilitar corepack
RUN corepack enable
RUN corepack prepare pnpm@10.17.1 --activate

WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Instalar dependencias (incluyendo devDependencies para build)
RUN pnpm --version
RUN pnpm config list
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM base AS builder

# Copiar node_modules del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copiar código fuente
COPY . .

# Construir aplicación
RUN pnpm build

# Stage 3: Production
FROM base AS production

# Copiar solo lo necesario para producción
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Crear usuario no-root
ENV NODE_ENV=production
USER node

# Exponer puerto
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "try { require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}) } catch(e) { process.exit(1) }"

# Script de entrada con manejo de errores
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]