# 📊 Backup Completo - Ticketing Platform

**Fecha:** 2025-10-05 11:36:56
**Commit:** 74f45f5
**Carpeta:** backups\2025-10-05

---

## 🗄️ Archivos de Backup Creados

### PostgreSQL (Admin Service - Puerto 3003)
- `postgres_full_backup_11-36.sql` - Dump completo de PostgreSQL
- `postgres_events_11-36.json` - Eventos via API
- `postgres_venues_11-36.json` - Venues via API
- `postgres_categories_11-36.json` - Categorías via API
- `postgres_localities_11-36.json` - Localidades via API

### MongoDB (User Service - Puerto 3001)
- `mongodb_users_11-36.json` - Usuarios desde MongoDB
- **⚠️ Base de datos:** ticketing (NO ticketing-users)
- **Usuarios respaldados:** 3 (voro, xavi, testuser)

### Prisma Schema
- `prisma_schema_11-36.prisma` - Schema completo

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

**Backup creado exitosamente el 2025-10-05 11:36:56**
