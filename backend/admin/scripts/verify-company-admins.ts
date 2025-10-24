import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando Company Admins...\n');

  const companyAdmins = await prisma.companyAdmin.findMany({
    include: {
      companies: true,
    },
  });

  console.log(`📊 Total de Company Admins: ${companyAdmins.length}\n`);

  for (const admin of companyAdmins) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🏢 Compañía: ${admin.companies.name}`);
    console.log(`📍 Tipo: ${admin.companies.type}`);
    console.log(`🌍 Región: ${admin.companies.region}`);
    console.log(`✅ Activo: ${admin.is_active}`);
    console.log(`\n🔐 PERMISOS:`);
    console.log(`   - Crear: ${admin.can_create}`);
    console.log(`   - Actualizar: ${admin.can_update}`);
    console.log(`   - Eliminar: ${admin.can_delete}`);
    console.log(`   - Ver Stats: ${admin.can_view_stats}`);
    console.log(`   - Gestionar Stock: ${admin.can_manage_stock}`);
    console.log('');
  }

  console.log('✅ Verificación completada!');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
