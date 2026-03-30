FROM node:22-alpine
WORKDIR /app

# Instalamos pnpm
RUN npm install -g pnpm

# Copiamos archivos de configuración (INCLUYENDO el nuevo .npmrc)
COPY package.json pnpm-lock.yaml* .npmrc ./

# Instalamos todas las dependencias
RUN pnpm install --frozen-lockfile

# Copiamos el resto del código de ASESCON
COPY . .

# Generamos el cliente de Prisma
# Usamos URLs dummy; Railway usará las reales al arrancar
RUN DATABASE_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
    DIRECT_URL="postgresql://neondb_owner:npg_a2xuPpvod1YW@ep-crimson-heart-adx2a0il.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
    pnpm exec prisma generate

# Compilamos el proyecto de NestJS
RUN pnpm run build

EXPOSE 3001

# Comando final: Migraciones + Iniciar App
# Aquí es donde Railway mete las variables reales de Neon
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]