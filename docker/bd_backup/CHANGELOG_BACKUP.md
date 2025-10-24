# 📋 Changelog - Scripts de Backup y Restore

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
- ✅ **Viajes (trips)** - 838 registros
- ✅ **Productos (products)** - 2,532 registros

### **MongoDB (ticketing)**
- ✅ Usuarios (users)

## 🔍 Verificación de Backup

Al ejecutar `backup.ps1`, ahora verás:

```
PostgreSQL ticketing: XXX KB
  - Eventos: XXX
  - Venues: XXX
  - Categorias: XXX
  - Subcategorias: XXX
  - Ordenes: XXX
  - Tickets: XXX
  - Admins: XXX
  - Compañías: 6         ← NUEVO
  - Company Admins: 6    ← NUEVO
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
