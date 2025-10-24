import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando seed de Compañías y Company Admins...\n');

  try {
    // Datos de las compañías
    const companies = [
      {
        name: 'Restaurantes España',
        type: 'RESTAURANT',
        region: 'SPAIN',
        contactEmail: 'admin.spain.restaurants@festival.com',
        contactPhone: '+34 600 111 222',
        address: 'Calle Gran Vía 1, Madrid',
        description: 'Compañía de restaurantes para eventos en España',
      },
      {
        name: 'Restaurantes Europa',
        type: 'RESTAURANT',
        region: 'EUROPE',
        contactEmail: 'admin.europe.restaurants@festival.com',
        contactPhone: '+33 600 333 444',
        address: 'Avenue des Champs-Élysées 1, Paris',
        description: 'Compañía de restaurantes para eventos en Europa',
      },
      {
        name: 'Viajes España',
        type: 'TRAVEL',
        region: 'SPAIN',
        contactEmail: 'admin.spain.travel@festival.com',
        contactPhone: '+34 600 555 666',
        address: 'Paseo de la Castellana 100, Madrid',
        description: 'Compañía de transporte para eventos en España',
      },
      {
        name: 'Viajes Europa',
        type: 'TRAVEL',
        region: 'EUROPE',
        contactEmail: 'admin.europe.travel@festival.com',
        contactPhone: '+49 600 777 888',
        address: 'Unter den Linden 1, Berlin',
        description: 'Compañía de transporte para eventos en Europa',
      },
      {
        name: 'Merchandising España',
        type: 'MERCHANDISING',
        region: 'SPAIN',
        contactEmail: 'admin.spain.merch@festival.com',
        contactPhone: '+34 600 999 000',
        address: 'Calle Serrano 50, Madrid',
        description: 'Compañía de merchandising para eventos en España',
      },
      {
        name: 'Merchandising Europa',
        type: 'MERCHANDISING',
        region: 'EUROPE',
        contactEmail: 'admin.europe.merch@festival.com',
        contactPhone: '+39 600 111 333',
        address: 'Via del Corso 1, Roma',
        description: 'Compañía de merchandising para eventos en Europa',
      },
    ];

    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.companyAdmin.deleteMany({});
    await prisma.company.deleteMany({});
    console.log('✅ Datos limpiados\n');

    // Crear compañías y sus admins
    console.log('🏢 Creando compañías y administradores...\n');

    for (const companyData of companies) {
      // Crear compañía
      const company = await prisma.company.create({
        data: {
          name: companyData.name,
          type: companyData.type,
          region: companyData.region,
          contact_email: companyData.contactEmail,
          contact_phone: companyData.contactPhone,
          address: companyData.address,
          description: companyData.description,
          is_active: true,
        },
      });

      console.log(`✅ Compañía creada: ${company.name} (${company.type} - ${company.region})`);

      // Crear Company Admin
      const hashedPassword = hashSync('Admin123!', 10);
      
      const admin = await prisma.companyAdmin.create({
        data: {
          company_id: company.id,
          email: companyData.contactEmail,
          password: hashedPassword,
          first_name: companyData.type,
          last_name: companyData.region,
          is_active: true,
          can_create: true,
          can_update: true,
          can_delete: true,
          can_view_stats: true,
          can_manage_stock: true,
        },
      });

      console.log(`   👤 Admin creado: ${admin.email}`);
      console.log(`   🔑 Password: Admin123!\n`);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📊 RESUMEN:');
    console.log(`   - Compañías creadas: ${await prisma.company.count()}`);
    console.log(`   - Admins creados: ${await prisma.companyAdmin.count()}`);
    console.log('\n🔐 CREDENCIALES DE ACCESO:');
    console.log('   Email: admin.spain.restaurants@festival.com');
    console.log('   Email: admin.europe.restaurants@festival.com');
    console.log('   Email: admin.spain.travel@festival.com');
    console.log('   Email: admin.europe.travel@festival.com');
    console.log('   Email: admin.spain.merch@festival.com');
    console.log('   Email: admin.europe.merch@festival.com');
    console.log('   Password (todos): Admin123!');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
