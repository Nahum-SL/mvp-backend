import { prismaAdp } from 'src/db';
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('🚀 Iniciando el proceso de seeding...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Dev Admin';

  // 1. Configuración de Passwords (Usa variables de entorno en prod si es posible)
  if (!adminEmail || !adminPass) {
    throw new Error('Faltan variables de entorno en el .env');
  }

  // 2. Crear TU CUENTA como Desarrollador / Admin
  const myHashedPassword = await bcrypt.hash(adminPass, 10);

  const devAccount = await prismaAdp.user.upsert({
    where: { email: adminEmail }, // Cambia esto por tu correo real
    update: { role: 'ADMIN' }, // Por si ya existía, aseguras el rol
    create: {
      email: adminEmail,
      name: adminName,
      password: myHashedPassword,
      role: 'ADMIN',
      avatar:
        'https://ui-avatars.com/api/?name=Dev+Admin&background=1e293b&color=fff',
    },
  });
  console.log(`✅ Cuenta de Desarrollador activa: ${devAccount.email}`);

  // 3. Crear Cuenta de la Empresa (ADMIN por ahora, será OWNER después)
  // const clientHashedPassword = await bcrypt.hash('BienvenidoAsescon2026!', 10);

  // const companyAccount = await prismaAdp.user.upsert({
  //   where: { email: 'admin@asescon.pe' },
  //   update: {},
  //   create: {
  //     email: 'admin@asescon.pe',
  //     name: 'Gerencia ASESCON',
  //     password: clientHashedPassword,
  //     role: 'ADMIN', // Cambiarás a 'OWNER' el día de la entrega
  //     avatar:
  //       'https://ui-avatars.com/api/?name=Asescon+Gerencia&background=0D8ABC&color=fff',
  //   },
  // });
  // console.log(
  //   `✅ Cuenta de Empresa (Pre-Entrega) creada: ${companyAccount.email}`,
  // );
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaAdp.$disconnect();
  });
