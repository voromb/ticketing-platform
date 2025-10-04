# 📊 Backups del 2025-10-04

**Fecha:** 2025-10-04  
**Backups consolidados:** Múltiples backups del día

---

## 🗄️ Archivos de Backup Disponibles

### PostgreSQL (Admin Service - Puerto 3003)

1. **postgres_admin_backup.sql** (65 KB)
   - Backup completo más reciente
   - ✅ Recomendado para restauración

2. **postgres_backup_2025-10-04_13-59.sql** (32 KB)
   - Backup de las 13:59

3. **postgres_admin_backup_2025-10-04_00-43.sql** (32 KB)
   - Backup de las 00:43

4. **postgres_events_backup_2025-10-04_00-46.json** (44 bytes)
   - Eventos via API

5. **postgres_venues_backup_2025-10-04_00-46.json** (73 bytes)
   - Venues via API

### MongoDB (User Service - Puerto 3001)

1. **mongodb_users_backup_CORRECTO_2025-10-04_14-04.json** (1.1 KB)
   - ✅ **RECOMENDADO** - Base de datos correcta: `ticketing`
   - **3 usuarios** respaldados correctamente
   - Usuarios: voro (VIP), xavi (VIP), testuser (USER)

2. **mongodb_users_backup_2025-10-04_00-45.json** (830 bytes)
   - ⚠️ Base de datos incorrecta: `ticketing-users`

3. **mongodb_users_backup_2025-10-04_14-00.json** (0 bytes)
   - ❌ Vacío - No usar

### Prisma Schema

1. **prisma_schema_backup_2025-10-04_00-46.prisma** (5.2 KB)
   - Schema completo de Prisma
   - 8 modelos sincronizados

---

## 🔧 Para Restaurar

### Opción A: Usar Script (Recomendado)

**PowerShell:**
```powershell
cd docker\bd_backup
.\restore-databases.ps1 2025-10-04
```

**Bash:**
```bash
cd docker/bd_backup
./restore-databases.sh 2025-10-04
```

### Opción B: Restauración Manual

#### PostgreSQL:
```bash
# Restaurar backup completo
docker exec -i ticketing-postgres psql -U admin -d ticketing < backups/2025-10-04/postgres_admin_backup.sql

# Verificar
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM \"Event\";"
```

#### MongoDB:
```bash
# Copiar backup CORRECTO al contenedor
docker cp backups/2025-10-04/mongodb_users_backup_CORRECTO_2025-10-04_14-04.json ticketing-mongodb:/tmp/

# Restaurar (BASE DE DATOS CORRECTA: ticketing)
docker exec ticketing-mongodb mongoimport \
  --authenticationDatabase=admin \
  --username=admin \
  --password=admin123 \
  --db=ticketing \
  --collection=users \
  --file=/tmp/mongodb_users_backup_CORRECTO_2025-10-04_14-04.json

# Verificar
docker exec ticketing-mongodb mongosh \
  --username admin \
  --password admin123 \
  --authenticationDatabase admin \
  ticketing \
  --eval "db.users.countDocuments()"
```

---

## ⚠️ Notas Importantes

1. **MongoDB:** Usar SIEMPRE el archivo `mongodb_users_backup_CORRECTO_2025-10-04_14-04.json`
2. **Base de datos correcta:** `ticketing` (NO `ticketing-users`)
3. **PostgreSQL:** El archivo `postgres_admin_backup.sql` es el más completo
4. **Usuarios respaldados:** 3 usuarios (voro, xavi, testuser)

---

## 📋 Estado del Sistema

- ✅ Admin-Service (Puerto 3003) - PostgreSQL
- ✅ User-Service (Puerto 3001) - MongoDB  
- ✅ PostgreSQL: 8 modelos sincronizados
- ✅ MongoDB: Base de datos 'ticketing' con 3 usuarios
- ✅ Prisma Client actualizado

---

**Backups consolidados el 2025-10-04**
