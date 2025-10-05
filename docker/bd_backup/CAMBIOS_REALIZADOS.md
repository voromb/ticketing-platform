# ✅ CORRECCIONES APLICADAS A LOS SCRIPTS DE BACKUP/RESTORE

## 🔧 Problemas Corregidos

### 1. **Comillas Dobles → Comillas Simples**
**Problema:** Las comillas dobles en comandos Docker causaban errores de interpretación.

**Solución:**
```bash
# ANTES (❌)
docker exec ticketing-postgres psql -c "DROP SCHEMA public CASCADE;"
docker exec ticketing-mongodb --eval "use ticketing; db.users.deleteMany({})"

# DESPUÉS (✅)
docker exec ticketing-postgres psql -c 'DROP SCHEMA public CASCADE;'
docker exec ticketing-mongodb --eval 'use ticketing; db.users.deleteMany({})'
```

### 2. **Rutas Relativas en lugar de Absolutas**
**Problema:** Las rutas absolutas no funcionaban en otros PCs.

**Solución PowerShell:**
```powershell
# ANTES (❌)
Start-Process powershell -Command "cd 'backend\admin'; npm run dev"

# DESPUÉS (✅)
$adminPath = Join-Path $PSScriptRoot "..\..\backend\admin"
Start-Process powershell -Command "cd '$adminPath'; npm run dev"
```

**Solución Bash:**
```bash
# ANTES (❌)
cd backend/admin && npm run dev

# DESPUÉS (✅)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ADMIN_PATH="$SCRIPT_DIR/../../backend/admin"
(cd "$ADMIN_PATH" && npm run dev &)
```

### 3. **MongoDB se Limpia y Restaura Automáticamente**
**Problema:** MongoDB no se restauraba, solo mostraba un mensaje.

**Solución:**
```bash
# Limpiar colección
docker exec ticketing-mongodb mongosh --eval 'use ticketing; db.users.deleteMany({})'

# Copiar archivo
docker cp "$backupDir/mongodb_users_$timestamp.json" ticketing-mongodb:/tmp/users_restore.json

# Importar
docker exec ticketing-mongodb mongoimport --db=ticketing --collection=users --file=/tmp/users_restore.json --jsonArray
```

### 4. **Prisma se Sincroniza Correctamente**
**Problema:** Usaba `prisma db pull` que no aplicaba cambios.

**Solución:**
```bash
# ANTES (❌)
npx prisma db pull

# DESPUÉS (✅)
npx prisma db push --accept-data-loss
npx prisma generate
```

### 5. **Variables Consistentes**
**Problema:** Mezcla de `backup_dir` y `backupDir` en Bash.

**Solución:**
```bash
# Unificado a camelCase
backupDir="backups/$timestamp"
```

---

## 📁 Archivos Modificados

### Scripts de Backup:
- ✅ `backup-databases.ps1` - PowerShell (Windows)
- ✅ `backup-databases.sh` - Bash (Linux/Mac)

### Scripts de Restore:
- ✅ `restore-databases.ps1` - PowerShell (Windows)
- ✅ `restore-databases.sh` - Bash (Linux/Mac)

### Documentación:
- ✅ `INSTRUCCIONES_RESTORE.md` - Guía completa para tu compañero
- ✅ `CAMBIOS_REALIZADOS.md` - Este archivo

---

## 🎯 Qué Hace Ahora el Restore Correctamente

1. ✅ **Detiene servicios** Node.js activos
2. ✅ **Limpia PostgreSQL** completamente (DROP SCHEMA CASCADE)
3. ✅ **Restaura PostgreSQL** desde dump SQL
4. ✅ **Limpia MongoDB** (deleteMany en colección users)
5. ✅ **Restaura MongoDB** automáticamente desde JSON
6. ✅ **Copia Prisma Schema** con rutas relativas
7. ✅ **Sincroniza Prisma** con `db push --accept-data-loss`
8. ✅ **Regenera Prisma Client** con `generate`
9. ✅ **Reinicia servicios** con rutas relativas correctas

---

## 📦 Para Entregar a tu Compañero

### Carpeta completa a copiar:
```
docker/bd_backup/
├── backups/
│   └── 2025-10-05/
│       ├── postgres_full_backup_11-36.sql (61 KB)
│       ├── mongodb_users_11-36.json (1 KB)
│       ├── prisma_schema_11-36.prisma (8.5 KB)
│       ├── postgres_categories_11-36.json
│       ├── postgres_localities_11-36.json
│       ├── postgres_venues_11-36.json
│       └── BACKUP_INFO.md
├── backup-databases.ps1
├── backup-databases.sh
├── restore-databases.ps1
├── restore-databases.sh
├── INSTRUCCIONES_RESTORE.md
└── CAMBIOS_REALIZADOS.md
```

### Comando para restaurar:
```powershell
# Windows
cd docker\bd_backup
.\restore-databases.ps1 11-36

# Linux/Mac
cd docker/bd_backup
./restore-databases.sh 11-36
```

---

## ⚠️ Puntos Críticos Resueltos

### Error Original:
```
[API Error] 500 - /api/events/public Request failed with status code 500
```

### Causas Identificadas:
1. ❌ MongoDB no se restauraba (usuarios faltantes)
2. ❌ Prisma no se sincronizaba (schema desactualizado)
3. ❌ PostgreSQL tenía datos corruptos mezclados
4. ❌ Comillas dobles causaban errores en comandos

### Solución Aplicada:
1. ✅ MongoDB se limpia y restaura completamente
2. ✅ Prisma se sincroniza con `db push`
3. ✅ PostgreSQL se limpia con DROP SCHEMA CASCADE
4. ✅ Comillas simples en todos los comandos Docker

---

## 🧪 Verificación Post-Restore

### Verificar PostgreSQL:
```powershell
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) FROM \"Event\";"
```

### Verificar MongoDB:
```powershell
docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --eval "use ticketing; db.users.countDocuments()"
```

### Verificar Prisma:
```powershell
cd backend\admin
npx prisma studio
```

---

## 📝 Notas Finales

- **Todas las rutas son relativas** - Funciona en cualquier PC
- **Comillas simples** - Sin problemas de interpretación
- **Limpieza automática** - Sin datos mezclados
- **Sincronización completa** - Prisma alineado con PostgreSQL
- **Documentación incluida** - Tu compañero tiene todo lo necesario

---

**Fecha de corrección:** 2025-10-05
**Versión del backup:** 11-36
**Estado:** ✅ Completamente funcional y probado
