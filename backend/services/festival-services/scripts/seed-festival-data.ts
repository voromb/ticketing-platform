/**
 * Script de Seed para Festival Services
 * Genera datos de prueba para Restaurantes, Viajes y Merchandising
 * Basado en los eventos existentes en PostgreSQL
 */

import mongoose from 'mongoose';
import { Client } from 'pg';

// Configuración
const POSTGRES_URL = process.env.DATABASE_URL || 'postgresql://admin:admin123@127.0.0.1:5432/ticketing?schema=public';
const MONGODB_URL = process.env.MONGODB_URI || 'mongodb://admin:admin123@127.0.0.1:27017/festival_services?authSource=admin';

const pgClient = new Client({
  connectionString: POSTGRES_URL,
});

// Schemas de MongoDB
const restaurantSchema = new mongoose.Schema({
  festivalId: String,
  name: String,
  description: String,
  cuisine: String,
  location: String,
  capacity: Number,
  currentOccupancy: { type: Number, default: 0 },
  schedule: [{
    day: String,
    openTime: String,
    closeTime: String,
  }],
  menu: [{
    name: String,
    description: String,
    price: Number,
    category: String,
    isVegetarian: Boolean,
    isVegan: Boolean,
  }],
  acceptsReservations: Boolean,
  reservationDurationMinutes: Number,
  status: { type: String, enum: ['OPEN', 'CLOSED', 'FULL'], default: 'OPEN' },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const tripSchema = new mongoose.Schema({
  festivalId: String,
  name: String,
  description: String,
  departure: {
    location: String,
    datetime: Date,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  arrival: {
    location: String,
    datetime: Date,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  capacity: Number,
  price: Number,
  bookedSeats: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['SCHEDULED', 'BOARDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'], 
    default: 'SCHEDULED' 
  },
  requiresApproval: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  festivalId: String,
  eventId: String,
  eventName: String,
  name: String,
  description: String,
  type: { 
    type: String, 
    enum: ['TSHIRT', 'HOODIE', 'VINYL', 'CD', 'POSTER', 'ACCESSORIES', 'OTHER'] 
  },
  price: Number,
  sizes: [String],
  stock: {
    total: Number,
    available: Number,
    reserved: { type: Number, default: 0 },
  },
  images: [String],
  exclusive: { type: Boolean, default: false },
  preOrderEnabled: { type: Boolean, default: false },
  releaseDate: Date,
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'OUT_OF_STOCK', 'PRE_ORDER', 'COMING_SOON'], 
    default: 'AVAILABLE' 
  },
  isActive: { type: Boolean, default: true },
  soldUnits: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Trip = mongoose.model('Trip', tripSchema);
const Product = mongoose.model('Product', productSchema);

// Datos de ejemplo
const cuisineTypes = ['Italiana', 'Española', 'Mexicana', 'Japonesa', 'Americana', 'Mediterránea', 'Vegetariana', 'Fusion'];
const restaurantNames = ['La Trattoria', 'El Rincón', 'Taco Loco', 'Sushi Bar', 'Burger House', 'Mediterranean Grill', 'Green Garden', 'Fusion Kitchen'];

const departureLocations = [
  { name: 'Madrid Centro', lat: 40.4168, lng: -3.7038 },
  { name: 'Barcelona Plaza Catalunya', lat: 41.3851, lng: 2.1734 },
  { name: 'Valencia Estación Norte', lat: 39.4699, lng: -0.3763 },
  { name: 'Sevilla Plaza de España', lat: 37.3891, lng: -5.9845 },
  { name: 'Bilbao Guggenheim', lat: 43.2627, lng: -2.9253 },
];

const productTypes = [
  { type: 'TSHIRT', name: 'Camiseta', hasSize: true, priceRange: [15, 25] },
  { type: 'HOODIE', name: 'Sudadera', hasSize: true, priceRange: [35, 50] },
  { type: 'ACCESSORIES', name: 'Taza', hasSize: false, priceRange: [8, 12] },
  { type: 'ACCESSORIES', name: 'Mechero', hasSize: false, priceRange: [3, 6] },
  { type: 'ACCESSORIES', name: 'Gorra', hasSize: false, priceRange: [12, 18] },
  { type: 'ACCESSORIES', name: 'Llavero', hasSize: false, priceRange: [4, 8] },
  { type: 'POSTER', name: 'Póster', hasSize: false, priceRange: [10, 15] },
  { type: 'VINYL', name: 'Vinilo', hasSize: false, priceRange: [25, 35] },
  { type: 'CD', name: 'CD', hasSize: false, priceRange: [12, 18] },
  { type: 'ACCESSORIES', name: 'Pulsera', hasSize: false, priceRange: [5, 10] },
];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Funciones auxiliares
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateMenu(cuisine: string, isPremium: boolean = false): any[] {
  const priceMultiplier = isPremium ? 2 : 1;
  
  const menuItems = [
    { name: isPremium ? 'Entrante Gourmet' : 'Entrante Especial', category: 'STARTER', price: randomInt(8, 15) * priceMultiplier },
    { name: isPremium ? 'Plato Signature' : 'Plato Principal', category: 'MAIN', price: randomInt(15, 30) * priceMultiplier },
    { name: isPremium ? 'Postre Premium' : 'Postre del Día', category: 'DESSERT', price: randomInt(5, 10) * priceMultiplier },
    { name: isPremium ? 'Bebida Premium' : 'Bebida', category: 'DRINK', price: randomInt(3, 8) * priceMultiplier },
  ];

  return menuItems.map(item => ({
    ...item,
    description: `${isPremium ? 'Exquisito' : 'Delicioso'} ${item.name.toLowerCase()} de cocina ${cuisine.toLowerCase()}`,
    isVegetarian: Math.random() > 0.7,
    isVegan: Math.random() > 0.8,
  }));
}

function generateSchedule(): any[] {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return days.map(day => ({
    day,
    openTime: '12:00',
    closeTime: '23:00',
  }));
}

async function seedRestaurants(events: any[]) {
  console.log('\n🍽️  Generando Restaurantes...');
  
  const restaurants: any[] = [];
  
  for (const event of events) {
    // Restaurante Económico
    const cuisine1 = randomElement(cuisineTypes);
    const restaurantName1 = randomElement(restaurantNames);
    
    const economicRestaurant = {
      festivalId: event.id,
      name: `${restaurantName1} Económico - ${event.name}`,
      description: `Restaurante de cocina ${cuisine1} con precios accesibles en ${event.name}`,
      cuisine: cuisine1,
      location: `Zona Food Court - ${event.name}`,
      capacity: randomInt(80, 150),
      currentOccupancy: 0,
      schedule: generateSchedule(),
      menu: generateMenu(cuisine1, false), // false = económico
      acceptsReservations: true,
      reservationDurationMinutes: 60,
      status: 'OPEN',
      isActive: true,
      rating: parseFloat((Math.random() * 1 + 3.5).toFixed(1)), // 3.5 - 4.5
      totalReviews: randomInt(50, 150),
    };
    
    // Restaurante Premium
    const cuisine2 = randomElement(cuisineTypes);
    const restaurantName2 = randomElement(restaurantNames);
    
    const premiumRestaurant = {
      festivalId: event.id,
      name: `${restaurantName2} Premium - ${event.name}`,
      description: `Restaurante gourmet de cocina ${cuisine2} en ${event.name}`,
      cuisine: cuisine2,
      location: `Zona VIP - ${event.name}`,
      capacity: randomInt(40, 80),
      currentOccupancy: 0,
      schedule: generateSchedule(),
      menu: generateMenu(cuisine2, true), // true = premium
      acceptsReservations: true,
      reservationDurationMinutes: 120,
      status: 'OPEN',
      isActive: true,
      rating: parseFloat((Math.random() * 0.5 + 4.5).toFixed(1)), // 4.5 - 5.0
      totalReviews: randomInt(20, 80),
    };
    
    restaurants.push(economicRestaurant, premiumRestaurant);
  }
  
  const result = await Restaurant.insertMany(restaurants);
  console.log(`✅ ${result.length} restaurantes creados`);
  return result;
}

async function seedTrips(events: any[], venues: any[]) {
  console.log('\n🚌 Generando Viajes...');
  
  const trips: any[] = [];
  
  for (const event of events) {
    const venue = venues.find(v => v.id === event.venueId);
    const departure = randomElement(departureLocations);
    
    const eventDate = new Date(event.eventDate);
    
    // Viaje Económico (Autobús)
    const economicDepartureTime = new Date(eventDate);
    economicDepartureTime.setHours(economicDepartureTime.getHours() - 4); // 4 horas antes
    
    const economicArrivalTime = new Date(economicDepartureTime);
    economicArrivalTime.setHours(economicArrivalTime.getHours() + 3); // 3 horas de viaje
    
    const economicTrip = {
      festivalId: event.id,
      name: `Autobús Económico a ${event.name}`,
      description: `Viaje en autobús desde ${departure.name} hasta ${venue?.name || 'el evento'}. Opción económica y cómoda.`,
      departure: {
        location: departure.name,
        datetime: economicDepartureTime,
        coordinates: {
          lat: departure.lat,
          lng: departure.lng,
        },
      },
      arrival: {
        location: venue?.name || event.name,
        datetime: economicArrivalTime,
        coordinates: {
          lat: venue?.latitude || 40.4168,
          lng: venue?.longitude || -3.7038,
        },
      },
      capacity: randomInt(50, 60),
      price: randomInt(15, 25),
      bookedSeats: 0,
      status: 'SCHEDULED',
      requiresApproval: false,
      isActive: true,
    };
    
    // Viaje Premium (Minibús VIP)
    const premiumDepartureTime = new Date(eventDate);
    premiumDepartureTime.setHours(premiumDepartureTime.getHours() - 2.5); // 2.5 horas antes
    
    const premiumArrivalTime = new Date(premiumDepartureTime);
    premiumArrivalTime.setHours(premiumArrivalTime.getHours() + 1.5); // 1.5 horas de viaje (más rápido)
    
    const premiumTrip = {
      festivalId: event.id,
      name: `Minibús VIP Premium a ${event.name}`,
      description: `Viaje premium en minibús VIP desde ${departure.name} hasta ${venue?.name || 'el evento'}. Incluye WiFi, bebidas y asientos reclinables.`,
      departure: {
        location: departure.name,
        datetime: premiumDepartureTime,
        coordinates: {
          lat: departure.lat,
          lng: departure.lng,
        },
      },
      arrival: {
        location: venue?.name || event.name,
        datetime: premiumArrivalTime,
        coordinates: {
          lat: venue?.latitude || 40.4168,
          lng: venue?.longitude || -3.7038,
        },
      },
      capacity: randomInt(15, 25),
      price: randomInt(45, 80),
      bookedSeats: 0,
      status: 'SCHEDULED',
      requiresApproval: false,
      isActive: true,
    };
    
    trips.push(economicTrip, premiumTrip);
  }
  
  const result = await Trip.insertMany(trips);
  console.log(`✅ ${result.length} viajes creados`);
  return result;
}

async function seedMerchandising(events: any[]) {
  console.log('\n👕 Generando Merchandising...');
  
  const products: any[] = [];
  
  for (const event of events) {
    // Generar 5-7 productos variados por evento
    const numProducts = randomInt(5, 7);
    const selectedProducts: any[] = [];
    
    // Seleccionar productos aleatorios sin repetir
    while (selectedProducts.length < numProducts) {
      const prod = randomElement(productTypes);
      if (!selectedProducts.find(p => p.name === prod.name)) {
        selectedProducts.push(prod);
      }
    }
    
    for (const productDef of selectedProducts) {
      const product = {
        festivalId: event.id,
        eventId: event.id,
        eventName: event.name,
        name: `${productDef.name} - ${event.name}`,
        description: `${productDef.name} oficial del evento ${event.name}. Edición limitada.`,
        type: productDef.type,
        price: randomInt(productDef.priceRange[0], productDef.priceRange[1]),
        sizes: productDef.hasSize ? sizes : [],
        stock: {
          total: randomInt(50, 200),
          available: randomInt(30, 150),
          reserved: 0,
        },
        images: [`/images/merch/${productDef.name.toLowerCase()}-${event.id}.jpg`],
        exclusive: Math.random() > 0.7,
        preOrderEnabled: Math.random() > 0.85,
        releaseDate: new Date(event.eventDate),
        status: 'AVAILABLE',
        isActive: true,
        soldUnits: randomInt(0, 50),
      };
      
      products.push(product);
    }
  }
  
  const result = await Product.insertMany(products);
  console.log(`✅ ${result.length} productos creados`);
  return result;
}

async function main() {
  console.log('🚀 Iniciando seed de Festival Services...\n');
  
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Conectado a MongoDB');
    
    // Conectar a PostgreSQL
    console.log('📡 Conectando a PostgreSQL...');
    await pgClient.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Obtener eventos de PostgreSQL
    console.log('\n📊 Obteniendo eventos de PostgreSQL...');
    const eventsResult = await pgClient.query(
      'SELECT * FROM "Event" WHERE status = $1 ORDER BY "eventDate" ASC',
      ['ACTIVE']
    );
    const events = eventsResult.rows;
    console.log(`✅ ${events.length} eventos encontrados`);
    
    // Obtener venues
    const venuesResult = await pgClient.query('SELECT * FROM "Venue"');
    const venues = venuesResult.rows;
    console.log(`✅ ${venues.length} venues encontrados`);
    
    // Limpiar datos existentes
    console.log('\n🧹 Limpiando datos existentes...');
    await Restaurant.deleteMany({});
    await Trip.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Datos limpiados');
    
    // Generar datos
    await seedRestaurants(events);
    await seedTrips(events, venues);
    await seedMerchandising(events);
    
    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📊 RESUMEN:');
    console.log(`   - Restaurantes: ${await Restaurant.countDocuments()}`);
    console.log(`   - Viajes: ${await Trip.countDocuments()}`);
    console.log(`   - Productos: ${await Product.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await pgClient.end();
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de las bases de datos');
  }
}

// Ejecutar
main();
