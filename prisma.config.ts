import { defineConfig } from 'prisma/config';

export default defineConfig({
  // En Prisma 7, la configuración de conexión se define aquí
  earlyAccess: true, // A veces requerido para ciertas funciones de configuración en versiones 7.x
  utils: {
    // Si necesitas cargar variables de entorno manualmente
    schemaPath: 'prisma/schema.prisma',
  },
  // La propiedad correcta para definir las URLs es dentro de 'datasources' (en plural)
  // o directamente en 'datasource' dependiendo de la versión exacta de la interfaz.
  // Pero lo más seguro para evitar el error de TS es:
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
