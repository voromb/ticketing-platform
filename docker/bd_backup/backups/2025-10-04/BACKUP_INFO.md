# 📊 Backups del 2025-10-04

**Fecha:** 2025-10-04  
**Último backup:** 14:48
**Backups consolidados:** Múltiples backups del día:** backups\2025-10-04

---

## 🗄️ Archivos de Backup Creados
- `postgres_full_backup_14-48.sql` - Dump completo de PostgreSQL
- `postgres_events_14-48.json` - Eventos via API
- `postgres_venues_14-48.json` - Venues via API

### MongoDB (User Service - Puerto 3001)
- `mongodb_users_14-48.json` - Usuarios desde MongoDB
- **⚠️ Base de datos:** ticketing (NO ticketing-users)
- **Usuarios respaldados:** 3 (voro, xavi, testuser)

### Prisma Schema
- `prisma_schema_14-48.prisma` - Schema completo

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

**Backup creado exitosamente el 2025-10-04 14:48:45**
