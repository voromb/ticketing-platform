const { PrismaClient } = require('@prisma/client');

async function testAdminPrisma() {
    const prisma = new PrismaClient();

    try {
        console.log('🔍 Probando Prisma Admin...');

        // Contar eventos
        const eventCount = await prisma.event.count();
        console.log(`📊 Total eventos: ${eventCount}`);

        // Contar venues
        const venueCount = await prisma.venue.count();
        console.log(`🏢 Total venues: ${venueCount}`);

        // Contar categorías
        const categoryCount = await prisma.eventCategory.count();
        console.log(`📂 Total categorías: ${categoryCount}`);

        console.log('✅ Prisma Admin funciona correctamente');
    } catch (error) {
        console.error('❌ Error en Prisma Admin:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminPrisma();
