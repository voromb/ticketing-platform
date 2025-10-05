# 📊 Backup Completo - Ticketing Platform

**Fecha:** 2025-10-05 17:01:42
**Commit:** 98eaa59
**Carpeta:** C:\Users\yop\Documents\Servidor_DAW\ticketing-platform\docker\bd_backup\backups\2025-10-05

---

## 🗄️ Archivos de Backup Creados

### PostgreSQL (Admin Service - Puerto 3003)
- `postgres_full_backup_17-01.sql` - Dump completo de PostgreSQL
- `postgres_events_17-01.json` - Eventos via API
- `postgres_venues_17-01.json` - Venues via API
- `postgres_categories_17-01.json` - Categorías via API
- `postgres_localities_17-01.json` - Localidades via API

### MongoDB (User Service - Puerto 3001)
- `mongodb_users_17-01.json` - Usuarios desde MongoDB
- **⚠️ Base de datos:** ticketing (NO ticketing-users)
- **Usuarios respaldados:** 3 (voro, xavi, testuser)

### Prisma Schema
- `prisma_schema_17-01.prisma` - Schema completo

---

## 📋 Estado del Sistema

- ✅ Admin-Service (Puerto 3003) - PostgreSQL
- ✅ User-Service (Puerto 3001) - MongoDB
- ✅ PostgreSQL: Eventos, Venues, Categorías, Localidades
- ✅ MongoDB: Base de datos 'ticketing' con usuarios
- ✅ Prisma Client actualizado

---

## 🔧 Para Restaurar

**PowerShell:**
```powershell
.\restore-databases.ps1 2025-10-05
```

**Bash:**
```bash
./restore-databases.sh 2025-10-05
```

---

**Backup creado exitosamente el 2025-10-05 17:01:42**
