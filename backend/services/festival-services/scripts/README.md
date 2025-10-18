# 🌟 Script de Seed - Festival Services

Este script genera datos de prueba para los servicios de festivales basándose en los eventos existentes en PostgreSQL.

## 📦 Qué Genera

### 🍽️ Restaurantes
- **1 restaurante por evento**
- Cocinas variadas: Italiana, Española, Mexicana, Japonesa, etc.
- Menú completo con entrantes, platos principales, postres y bebidas
- Horarios de apertura
- Capacidad y sistema de reservas

### 🚌 Viajes
- **1 viaje por evento**
- Salidas desde ciudades principales (Madrid, Barcelona, Valencia, etc.)
- Llegada al venue del evento
- Horarios calculados automáticamente (3h antes del evento)
- Capacidad de 40-60 personas
- Precios entre 15€ y 50€

### 👕 Merchandising
- **3-5 productos por evento**
- Tipos: Camisetas, Hoodies, Vinilos, CDs, Pósters, Accesorios
- Stock y precios variables
- Algunos productos exclusivos o en pre-orden
- Vinculados al evento (no a grupos/bandas)

## 🚀 Cómo Usar

### 1. Asegúrate de que las bases de datos estén corriendo

```bash
# Verificar Docker
docker ps

# Deberías ver:
# - ticketing-postgres
# - ticketing-mongodb
```

### 2. Ejecutar el script

```bash
cd backend/services/festival-services
npm run seed
```

### 3. Resultado Esperado

```
🚀 Iniciando seed de Festival Services...

📡 Conectando a MongoDB...
✅ Conectado a MongoDB

📊 Obteniendo eventos de PostgreSQL...
✅ 50 eventos encontrados
✅ 85 venues encontrados

🧹 Limpiando datos existentes...
✅ Datos limpiados

🍽️  Generando Restaurantes...
✅ 50 restaurantes creados

🚌 Generando Viajes...
✅ 50 viajes creados

👕 Generando Merchandising...
✅ 200 productos creados

🎉 Seed completado exitosamente!

📊 RESUMEN:
   - Restaurantes: 50
   - Viajes: 50
   - Productos: 200

👋 Desconectado de las bases de datos
```

## ⚙️ Configuración

El script usa las siguientes variables de entorno (con valores por defecto):

```env
DATABASE_URL=postgresql://admin:admin123@127.0.0.1:5432/ticketing?schema=public
MONGODB_URI=mongodb://admin:admin123@127.0.0.1:27017/festival_services?authSource=admin
```

## 📝 Notas Importantes

- ⚠️ **El script ELIMINA todos los datos existentes** de restaurantes, viajes y productos antes de generar nuevos
- ✅ Solo procesa eventos con estado `ACTIVE`
- ✅ Limita a 50 eventos para no generar demasiados datos
- ✅ Los datos son aleatorios pero realistas
- ✅ Los horarios de viajes se calculan automáticamente basándose en la fecha del evento

## 🔧 Personalización

Si quieres modificar los datos generados, edita el archivo `seed-festival-data.ts`:

- **Línea 148**: Cambiar tipos de cocina
- **Línea 149**: Cambiar nombres de restaurantes
- **Línea 151**: Cambiar ubicaciones de salida
- **Línea 159**: Cambiar tipos de productos
- **Línea 160**: Cambiar tallas disponibles

## 🐛 Solución de Problemas

### Error: Cannot connect to MongoDB
```bash
# Verificar que MongoDB esté corriendo
docker ps | grep mongodb

# Reiniciar si es necesario
docker restart ticketing-mongodb
```

### Error: Cannot connect to PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Reiniciar si es necesario
docker restart ticketing-postgres
```

### Error: No events found
```bash
# Verificar que hay eventos en la base de datos
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM \"Event\" WHERE status = 'ACTIVE';"
```

## 📊 Verificar Datos Generados

### MongoDB
```bash
# Conectar a MongoDB
docker exec -it ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Usar la base de datos
use festival_services

# Contar documentos
db.restaurants.countDocuments()
db.trips.countDocuments()
db.products.countDocuments()

# Ver un ejemplo
db.restaurants.findOne()
```

### PostgreSQL (eventos base)
```bash
# Ver eventos activos
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT id, name, \"eventDate\" FROM \"Event\" WHERE status = 'ACTIVE' LIMIT 10;"
```

## 🎯 Próximos Pasos

Después de ejecutar el seed:

1. ✅ Inicia el servidor de Festival Services: `npm run dev`
2. ✅ Accede a Swagger: `http://localhost:3003/api/docs`
3. ✅ Prueba los endpoints:
   - `GET /api/restaurant` - Ver restaurantes
   - `GET /api/travel` - Ver viajes
   - `GET /api/merchandising` - Ver productos

---

**¡Disfruta de tus datos de prueba!** 🎉
