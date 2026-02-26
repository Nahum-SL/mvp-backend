import { prismaAdp } from 'src/db';
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('Iniciando el proceso de seeding...');

  // 1. Limpiar datos previos (Opcional, ten cuidado en producción)
  // await prismaAdp.user.deleteMany();
  // await prismaAdp.category.deleteMany();

  // 2. Crear Usuario Admin
  const adminPassword = 'A*-DM-*pssw**_137_*902'; // Contraseña del Admin
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prismaAdp.user.upsert({
    where: { email: 'admin@asescon.pe' },
    update: {},
    create: {
      email: 'admin@asescon.pe',
      name: 'Administrador General',
      password: hashedPassword,
      role: 'ADMIN',
      avatar:
        'https://ui-avatars.com/api/?name=Admin+Asescon&background=0D8ABC&color=fff',
    },
  });

  console.log(`:) Usuario Admin creado: ${admin.email}`);

  // 3. Crear Categorías para el Blog
  const categories = [
    { name: 'Tributario' },
    { name: 'Laboral' },
    { name: 'Contabilidad' },
    { name: 'Actualidad' },
  ];

  for (const cat of categories) {
    await prismaAdp.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categorías de blog inicializadas.');

  // 4. Crear Links base para la Intranet
  const links = [
    {
      title: 'Portal SUNAT',
      description: 'Acceso directo para trámites y declaraciones.',
      url: 'https://www.sunat.gob.pe/',
      icon: 'sunat-icon',
      order: 1,
    },
    {
      title: 'Consulta RUC',
      description: 'Verificación de estado de contribuyentes.',
      url: 'https://e-consultaruc.sunat.gob.pe/',
      icon: 'search-icon',
      order: 2,
    },
  ];

  for (const link of links) {
    await prismaAdp.intranetLink.create({
      data: link,
    });
  }
  console.log(':) Links de intranet configurados.');

  console.log(':) Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error(':( Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaAdp.$disconnect();
  });
