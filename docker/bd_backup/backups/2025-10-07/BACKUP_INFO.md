# Backup Completo - Ticketing Platform

**Fecha:** 2025-10-07 20:23:18
**Commit:** 0d64ad1
**Carpeta:** C:\Users\yop\Documents\Servidor_DAW\ticketing-platform\docker\bd_backup\backups\2025-10-07

---

## Archivos de Backup Creados

### PostgreSQL (Admin Service - Puerto 3003)
- `postgres_full_backup_20-23.sql` - DUMP COMPLETO (85 venues, 419 eventos, 1,257 localidades)
- `postgres_events_20-23.json` - Eventos via API publica
- `postgres_venues_20-23.json` - Venues via API (pagina 1)
- `postgres_venues_page2_20-23.json` - Venues via API (pagina 2)

### MongoDB (User Service - Puerto 3001)
- `mongodb_users_20-23.json` - Usuarios desde MongoDB
- **Base de datos:** ticketing

### Prisma Schema
- `prisma_schema_20-23.prisma` - Schema completo

---

## Datos Respaldados

- **Venues:** 85  (36 Europa + 49 España)
- **Eventos:** 419  (enero 2025 - marzo 2026)
- **Localidades:** 1257 
- **Encoding:** UTF-8
- **Estado:** 100% disponible (sin ventas)

---

## Para Restaurar

**Restaurar PostgreSQL completo:**
```powershell
docker exec -i ticketing-postgres psql -U admin -d ticketing < postgres_full_backup_20-23.sql
```

**Restaurar MongoDB:**
```powershell
docker cp mongodb_users_20-23.json ticketing-mongodb:/tmp/users.json
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/users.json
```

**Resetear base de datos antes de restaurar (CUIDADO - Borra todos los datos):**
```powershell
# Borrar y recrear base de datos PostgreSQL
docker exec ticketing-postgres psql -U admin -c "DROP DATABASE IF EXISTS ticketing;"
docker exec ticketing-postgres psql -U admin -c "CREATE DATABASE ticketing;"

# Aplicar migraciones de Prisma
cd backend\admin
npx prisma migrate deploy

# Restaurar desde backup
docker exec -i ticketing-postgres psql -U admin -d ticketing < ..\..\scripts\database\backups\2025-10-07\postgres_full_backup_20-23.sql
```

---

**Backup creado exitosamente el 2025-10-07 20:23:18**

## Notas Importantes

- El archivo `postgres_full_backup_20-23.sql` contiene TODOS los datos (venues, eventos, localidades, categorias, relaciones)
- Los archivos JSON son solo para verificacion
- Mantener estos backups en un lugar seguro
- Recomendado: Backup diario automatico
- Los backups se organizan por fecha en carpetas separadas

