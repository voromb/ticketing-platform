# 📋 Changelog - Scripts de Backup y Restore

## ✅ Actualizaciones Realizadas (25/10/2025) - VERSIÓN 3.0 ULTRA SEGURA

### **NUEVO: restore_safe.ps1 y restore_safe.sh**
- ✅ Modo DRY RUN para simular sin hacer cambios
- ✅ Análisis previo del backup (cuenta registros esperados)
- ✅ Captura estado ANTES de restaurar
- ✅ Comparación detallada DESPUÉS de restaurar
- ✅ Verificación que TODO coincida
- ✅ Confirmación explícita (escribir "SI")
- ✅ Colores informativos para fácil lectura
- ✅ Compatible Windows (PowerShell) y Linux/Mac (Bash)

### **SCRIPTS LINUX/MAC ACTUALIZADOS**
- ✅ backup_linux.sh con verificación completa de MongoDB
- ✅ restore_safe.sh equivalente a restore_safe.ps1
- ✅ Mismas funcionalidades que versión Windows

## ✅ Actualizaciones Realizadas (25/10/2025) - SISTEMA COMPLETO DE ÓRDENES

### **NUEVA FUNCIONALIDAD: Sistema de Órdenes MongoDB**
- ✅ Añadida colección `orders` en MongoDB (festival_services)
- ✅ Sistema completo de compra de paquetes (tickets + viajes + restaurantes + merchandising)
- ✅ Actualización automática de stock, reservas y asientos
- ✅ Verificación de conteo de órdenes en backup

### **backup.ps1 - ACTUALIZADO**
- ✅ Añadida verificación de colección `orders` en MongoDB
- ✅ Muestra conteo de todas las colecciones MongoDB:
  - Usuarios (ticketing)
  - Restaurantes (festival_services)
  - Viajes (festival_services)
  - Productos (festival_services)
  - **Órdenes (festival_services)** ← NUEVO
- ✅ Colores distintivos: Magenta para órdenes

## ✅ Actualizaciones Realizadas (24/10/2025)

### **backup.ps1**
- ✅ Añadido conteo de tabla `companies` en verificación
- ✅ Añadido conteo de tabla `company_admins` en verificación
- ✅ Muestra en color Cyan las nuevas tablas de compañías
- ✅ El backup de PostgreSQL **YA incluye** estas tablas automáticamente

### **restore.ps1**
- ✅ Añadida verificación de `companies` en verificación final
- ✅ Añadida verificación de `company_admins` en verificación final
- ✅ Añadida verificación de `restaurants` en MongoDB
- ✅ Añadida verificación de `trips` en MongoDB
- ✅ Añadida verificación de `products` en MongoDB
- ✅ Muestra en color Cyan los servicios de festival

## 📊 Datos que se Respaldan

### **PostgreSQL (ticketing)**
- ✅ Eventos (Event)
- ✅ Venues (Venue)
- ✅ Categorías (EventCategory)
- ✅ Subcategorías (EventSubcategory)
- ✅ Órdenes (Order)
- ✅ Tickets (Ticket)
- ✅ Admins (admins)
- ✅ **Compañías (companies)** ← NUEVO
- ✅ **Company Admins (company_admins)** ← NUEVO

### **MongoDB (festival_services)**
- ✅ **Restaurantes (restaurants)** - 838 registros
- ✅ **Reservas de Restaurantes (reservations)** - Sistema de reservas
- ✅ **Viajes (trips)** - 838 registros
- ✅ **Bookings de Viajes (bookings)** - Reservas de viajes
- ✅ **Productos (products)** - 2,532 registros
- ✅ **Carritos (carts)** - Carritos de compra
- ✅ **Órdenes Merchandising (orderitems)** - Órdenes de productos
- ✅ **Órdenes Paquetes (orders)** - Sistema de paquetes completo ← NUEVO

### **MongoDB (ticketing)**
- ✅ Usuarios (users)

## 🎯 Funcionalidades del Sistema de Órdenes

### **Colección `orders` incluye:**
- Información del usuario (userId, userEmail, userName)
- Datos del evento (festivalId, eventId, eventName)
- Tickets (cantidad, precio, total)
- Viaje opcional (tripId, tripName, tripPrice)
- Restaurante opcional (restaurantId, restaurantName, restaurantPrice, reserva)
- Merchandising opcional (array de productos con cantidad y precio)
- Totales (subtotal, taxes, total)
- Estados (status: PENDING/CONFIRMED/CANCELLED/COMPLETED)
- Estado de pago (paymentStatus: PENDING/PAID/FAILED/REFUNDED)

### **Actualizaciones automáticas al crear orden:**
- ✅ **Trip.bookedSeats** += cantidad de tickets
- ✅ **Restaurant.currentOccupancy** += número de personas
- ✅ **Product.stock.available** -= cantidad comprada
- ✅ **Product.soldUnits** += cantidad vendida

## 🔍 Verificación de Backup

Al ejecutar `backup.ps1`, ahora verás:

```
PostgreSQL ticketing: XXX KB
  - Eventos: XXX
  - Venues: XXX
  - Categorias: XXX
  - Subcategorias: XXX
  - Ordenes PostgreSQL: XXX
  - Tickets: XXX
  - Admins: XXX
  - Compañías: 6
  - Company Admins: 6

MongoDB Collections:
  - Usuarios: XXX
  - Restaurantes: 838
  - Viajes: 838
  - Productos: 2532
  - Ordenes MongoDB: XXX    ← NUEVO
```

## 🔄 Verificación de Restore

Al ejecutar `restore.ps1`, ahora verás:

```
Verificando datos restaurados...
Eventos principales: XXX
Venues principales: XXX
Compañías: 6              ← NUEVO
Company Admins: 6         ← NUEVO
Usuarios MongoDB: XXX
Restaurantes: 838         ← NUEVO
Viajes: 838               ← NUEVO
Productos: 2532           ← NUEVO
```

## ✅ Estado Actual

- ✅ **Backup completo** incluye todas las tablas de compañías
- ✅ **Restore completo** restaura todas las tablas de compañías
- ✅ **Verificación mejorada** muestra conteo de compañías y servicios
- ✅ **Sin cambios breaking** - Compatible con backups anteriores

## 🚀 Uso

### Crear Backup:
```powershell
cd docker/bd_backup
.\backup.ps1
```

### Restaurar Backup:
```powershell
cd docker/bd_backup
.\restore.ps1 -BackupDate "2025-10-24"
```

## 📝 Notas Importantes

1. **Los backups antiguos** (antes de esta actualización) **SÍ funcionarán** con el nuevo restore
2. **Los nuevos backups** incluyen automáticamente las tablas de compañías
3. **No se requiere migración** de backups existentes
4. Las verificaciones adicionales son **no-críticas** - si fallan, el restore continúa
