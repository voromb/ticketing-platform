# SISTEMA DE BACKUP - TICKETING PLATFORM

**Version:** 4.0 FINAL  
**Fecha:** 12 de octubre de 2025  
**Estado:** PROBADO Y FUNCIONAL - PUERTO CORREGIDO

---

## RESUMEN

Sistema de backup integral para el proyecto Ticketing Platform que incluye:
- Backend Admin (PostgreSQL + Prisma)
- Backend Festival Services (MongoDB + PostgreSQL + Prisma)
- Documentacion automatica de restauracion

**PROBADO EXITOSAMENTE:**
- Backup completo: FUNCIONA
- Restore completo: FUNCIONA
- Verificacion de datos: FUNCIONA
- Puerto corregido: 3004 para Festival Services

---

## USO RAPIDO

### Crear Backup Completo
```powershell
cd docker\bd_backup
.\backup-databases.ps1
```

### Restaurar Solo Festival Services
```powershell
cd docker\bd_backup
.\restore-festival-services.ps1 -BackupFolder "backups\2025-10-12"
```

---

## ARQUITECTURA DE DATOS

### Backend Admin (Puerto 3003)
- **PostgreSQL**: `ticketing` database
- **Prisma**: ORM para PostgreSQL
- **Contenido**: Venues, eventos, localidades, usuarios admin

### Backend Festival Services (Puerto 3004)

- **MongoDB**: `festival_services` database
  - Collections: travels, restaurants, products, bookings, orders, carts, reservations
- **PostgreSQL**: `approvals_db` database
  - Tables: Approval (sistema de aprobaciones)
- **Prisma**: ORM para PostgreSQL approvals
- **Redis**: Cache y sesiones

---

## ARCHIVOS GENERADOS POR BACKUP

```
backups/2025-10-12/
├── PostgreSQL Dumps
│   ├── postgres_full_backup_22-18.sql (Base principal)
│   └── postgres_approvals_db_22-18.sql (Festival Services)
├── MongoDB Exports
│   ├── mongodb_users_22-18.json (Usuarios principales)
│   ├── mongodb_travels_22-18.json (Viajes)
│   ├── mongodb_restaurants_22-18.json (Restaurantes)
│   ├── mongodb_products_22-18.json (Productos)
│   └── festival_services_dump_22-18.tar.gz (Dump completo)
├── Prisma Schemas
│   ├── prisma_admin_schema_22-18.prisma
│   └── prisma_services_schema_22-18.prisma
└── Documentacion
    └── BACKUP_INFO.md (Instrucciones de restauracion)
```

---

## RESULTADOS DE LA PRUEBA

### BACKUP

- PostgreSQL principal: OK (12 venues, 19 eventos, 57 localidades)
- PostgreSQL approvals: OK (2 aprobaciones)
- MongoDB usuarios: OK (2 usuarios)
- MongoDB festival_services: OK (1 restaurant, 1 product, 1 trip, 2 bookings)
- Prisma schemas: OK (ambos copiados)

### RESTORE

- PostgreSQL approvals_db: RESTAURADO (2 records)
- MongoDB festival_services: RESTAURADO (5 documents, 7 collections, 23 indexes)
- Prisma configuration: GENERADO
- Verificacion: EXITOSA

---

## COMANDOS DE VERIFICACION

### PostgreSQL

```bash
# Base principal
docker exec ticketing-postgres psql -U admin -d ticketing -c 'SELECT COUNT(*) FROM "Venue";'

# Festival Services approvals
docker exec ticketing-postgres psql -U admin -d approvals_db -c 'SELECT COUNT(*) FROM "Approval";'
```

### MongoDB

```bash
# Usuarios principales
docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 ticketing --eval "db.users.countDocuments()"

# Festival Services
docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 festival_services --eval "db.stats()"
```

---

## VARIABLES DE ENTORNO

### backend/admin/.env

```
DATABASE_URL="postgresql://admin:admin123@localhost:5432/ticketing?schema=public"
```

### backend/services/festival-services/.env

```
PORT=3004
MONGODB_URI=mongodb://admin:admin123@localhost:27017/festival_services?authSource=admin
DATABASE_URL="postgresql://admin:admin123@localhost:5432/approvals_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
```

---

## INSTRUCCIONES PARA OTRO EQUIPO

### 1. Prerequisitos

- Docker y Docker Compose
- Node.js (para Prisma)
- Git

### 2. Clonar proyecto

```bash
git clone [repo]
cd ticketing-platform
```

### 3. Levantar infraestructura

```bash
cd docker
docker-compose up -d
```

### 4. Restaurar datos

```bash
cd bd_backup
# Opcion A: Solo Festival Services
.\restore-festival-services.ps1 -BackupFolder "backups\[FECHA]"

# Opcion B: Todo manual
docker cp backups\[FECHA]\postgres_full_backup_[TIME].sql ticketing-postgres:/tmp/
docker exec ticketing-postgres psql -U admin -d ticketing -f /tmp/postgres_full_backup_[TIME].sql
.\restore-festival-services.ps1 -BackupFolder "backups\[FECHA]"
```

### 5. Configurar aplicaciones

```bash
# Backend admin
cd backend/admin
npm install
npx prisma generate

# Backend services
cd backend/services/festival-services
npm install
npx prisma generate

# Frontend
cd frontend/ticketing-app
npm install
```

### 6. Iniciar servicios

```bash
# Admin backend (puerto 3003)
cd backend/admin
npm run dev

# Festival services (puerto 3004)
cd backend/services/festival-services
npm run dev

# Frontend (puerto 4200)
cd frontend/ticketing-app
ng serve
```

---

## NOTAS IMPORTANTES

- Los scripts NO contienen emoticonos (problema resuelto)
- **Puerto corregido**: Festival Services usa puerto 3004 (no 3000)
- El backup es incremental por fecha (no sobrescribe)
- El restore es seguro (hace backup del schema actual)
- La verificacion es automatica
- Compatible con Windows y Linux
- Documentacion auto-generada en cada backup

## CORRECCION DE PUERTO APLICADA

**Se corrigió el puerto del Festival Services de 3000 a 3004:**
- ✅ `backend/services/festival-services/.env` → PORT=3004
- ✅ `backup-databases.ps1` → URLs cambiadas a localhost:3004
- ✅ Documentación actualizada

**Para aplicar completamente, reiniciar el servicio:**
```bash
cd backend/services/festival-services
npm run dev  # Ahora corre en puerto 3004
```

---

**SISTEMA COMPLETO Y FUNCIONAL**  
**LISTO PARA PRODUCCION Y MIGRACION**  
**PUERTO CORREGIDO: 3004**
