FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Copiamos archivos de configuración
COPY package.json pnpm-lock.yaml* .npmrc ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Inyectamos variables dummy para el build
ENV DATABASE_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
ENV DIRECT_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Al instalar, el script 'postinstall' generará el cliente automáticamente
RUN pnpm install --frozen-lockfile

# Copiamos el código y construimos
COPY . .
RUN pnpm run build

EXPOSE 3001

# Comando final (Railway pondrá las URLs reales aquí)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]