# 📊 Backup Completo - Ticketing Platform

**Fecha:** 2025-10-04 22:22:44
**Commit:** 422feb8
**Carpeta:** backups\2025-10-04

---

## 🗄️ Archivos de Backup Creados

### PostgreSQL (Admin Service - Puerto 3003)
- `postgres_full_backup_22-22.sql` - Dump completo de PostgreSQL
- `postgres_events_22-22.json` - Eventos via API
- `postgres_venues_22-22.json` - Venues via API

### MongoDB (User Service - Puerto 3001)
- `mongodb_users_22-22.json` - Usuarios desde MongoDB
- **⚠️ Base de datos:** ticketing (NO ticketing-users)
- **Usuarios respaldados:** 3 (voro, xavi, testuser)

### Prisma Schema
- `prisma_schema_22-22.prisma` - Schema completo

---

## 📋 Estado del Sistema

- ✅ Admin-Service (Puerto 3003) - PostgreSQL
- ✅ User-Service (Puerto 3001) - MongoDB
- ✅ PostgreSQL: 8 modelos sincronizados
- ✅ MongoDB: Base de datos 'ticketing' con 3 usuarios
- ✅ Prisma Client actualizado

---

## 🔧 Para Restaurar

**PowerShell:**
```powershell
.\restore-databases.ps1 2025-10-04
```

**Bash:**
```bash
./restore-databases.sh 2025-10-04
```

---

**Backup creado exitosamente el 2025-10-04 22:22:44**
