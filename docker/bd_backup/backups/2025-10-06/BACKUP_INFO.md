#  Backup Completo - Ticketing Platform

**Fecha:** 2025-10-06 20:31:02
**Commit:** 2b4730a
**Carpeta:** C:\Users\xavip\Projectes_2DAW\ticketing-platform\docker\bd_backup\backups\2025-10-06

---

##  Archivos de Backup Creados

### PostgreSQL (Admin Service - Puerto 3003)
- `postgres_full_backup_20-31.sql` - Dump completo de PostgreSQL
- `postgres_events_20-31.json` - Eventos via API
- `postgres_venues_20-31.json` - Venues via API
- `postgres_categories_20-31.json` - Categoras via API
- `postgres_localities_20-31.json` - Localidades via API

### MongoDB (User Service - Puerto 3001)
- `mongodb_users_20-31.json` - Usuarios desde MongoDB
- ** Base de datos:** ticketing (NO ticketing-users)
- **Usuarios respaldados:** 3 (voro, xavi, testuser)

### Prisma Schema
- `prisma_schema_20-31.prisma` - Schema completo

---

##  Estado del Sistema

-  Admin-Service (Puerto 3003) - PostgreSQL
-  User-Service (Puerto 3001) - MongoDB
-  PostgreSQL: Eventos, Venues, Categoras, Localidades
-  MongoDB: Base de datos 'ticketing' con usuarios
-  Prisma Client actualizado

---

##  Para Restaurar

**PowerShell:**
```powershell
.\restore-databases.ps1 2025-10-06
```

**Bash:**
```bash
./restore-databases.sh 2025-10-06
```

---

**Backup creado exitosamente el 2025-10-06 20:31:02**
