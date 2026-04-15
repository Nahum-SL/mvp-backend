import { prismaAdp } from '../src/db';

async function main() {
  console.log('🌱 Iniciando seeding de servicios...');

  const servicios = [
    {
      title: 'Outsourcing Contable',
      slug: 'outsourcing-contable',
      description:
        'Gestión integral de tu contabilidad mensual para asegurar el cumplimiento tributario ante SUNAT.',
      icon: 'FileText',
      businessTypes: ['mype', 'startup'],
      painPoints: ['impuestos'],
      order: 1,
      features: [
        'Declaración de PDT',
        'Libros electrónicos',
        'Asesoría tributaria',
      ],
    },
    {
      title: 'Auditoría Financiera',
      slug: 'auditoria-financiera',
      description:
        'Examen detallado de tus estados financieros para garantizar transparencia y detectar riesgos.',
      icon: 'Search',
      businessTypes: ['corporativo'],
      painPoints: ['legal', 'estrategia'],
      order: 2,
      features: [
        'Dictamen de auditoría',
        'Control interno',
        'Evaluación de riesgos',
      ],
    },
    {
      title: 'Gestión de Planillas',
      slug: 'gestion-de-planillas',
      description:
        'Cálculo preciso de beneficios sociales, gratificaciones y CTS para tus colaboradores.',
      icon: 'Users',
      businessTypes: ['mype', 'startup', 'corporativo'],
      painPoints: ['planillas'],
      order: 3,
      features: ['Boletas de pago', 'Liquidaciones', 'Plame y T-Registro'],
    },
  ];

  for (const s of servicios) {
    const { features, ...data } = s;
    await prismaAdp.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        ...data,
        features: {
          create: features.map((f) => ({ name: f })),
        },
      },
    });
  }

  console.log('✅ Seeding completado con éxito.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
