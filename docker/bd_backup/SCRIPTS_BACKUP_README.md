# 📊 Scripts de Backup y Restore - Ticketing Platform

## 🚀 Scripts Disponibles

### PowerShell (.ps1)
- `backup-databases.ps1` - Crear backup completo
- `restore-databases.ps1` - Restaurar desde backup

### Bash (.sh) 
- `backup-databases.sh` - Crear backup completo
- `restore-databases.sh` - Restaurar desde backup

## 📋 Uso de Scripts

### 🔄 Crear Backup

**PowerShell:**
```powershell
.\backup-databases.ps1
```

**Bash:**
```bash
./backup-databases.sh
```

### 🔄 Restaurar Backup

**PowerShell:**
```powershell
.\restore-databases.ps1 2025-10-04_00-46
```

**Bash:**
```bash
./restore-databases.sh 2025-10-04_00-46
```

## 📁 Archivos Generados

Cada backup crea los siguientes archivos en `docker/bd_backup/backup/`:

### PostgreSQL
- `postgres_full_backup_TIMESTAMP.sql` - Dump completo
- `postgres_events_TIMESTAMP.json` - Eventos via API
- `postgres_venues_TIMESTAMP.json` - Venues via API

### MongoDB
- `mongodb_users_TIMESTAMP.json` - Usuarios via API

### Prisma
- `prisma_schema_TIMESTAMP.prisma` - Schema completo

### Documentación
- `BACKUP_INFO_TIMESTAMP.md` - Información del backup

## ⚙️ Configuración Previa

### Servicios Requeridos
- ✅ Admin-Service (Puerto 3003)
- ✅ User-Service (Puerto 3001)
- ✅ Docker con PostgreSQL y MongoDB

### Permisos (Linux/Mac)
```bash
chmod +x backup-databases.sh
chmod +x restore-databases.sh
```

## 🔧 Funcionalidades

### Backup Script
- ✅ Dump completo de PostgreSQL
- ✅ Export de datos via APIs
- ✅ Copia de Prisma Schema
- ✅ Documentación automática
- ✅ Timestamp único
- ✅ Verificación de servicios

### Restore Script
- ✅ Verificación de archivos
- ✅ Confirmación del usuario
- ✅ Limpieza de bases de datos
- ✅ Restauración completa
- ✅ Regeneración de Prisma Client
- ✅ Reinicio automático de servicios

## 🚨 Advertencias

### Restore
- ⚠️ **SOBRESCRIBE** las bases de datos actuales
- ⚠️ **DETIENE** los servicios temporalmente
- ⚠️ MongoDB requiere restore manual

### Backup
- 📊 Requiere servicios activos
- 📊 Crea archivos con timestamp único
- 📊 No elimina backups anteriores

## 💡 Ejemplos de Uso

### Backup Diario
```powershell
# Crear backup antes de cambios importantes
.\backup-databases.ps1
```

### Restore de Emergencia
```powershell
# Restaurar a estado anterior
.\restore-databases.ps1 2025-10-04_00-46
```

### Verificar Backups Disponibles
```powershell
Get-ChildItem docker\bd_backup\*backup*
```

## 🔍 Troubleshooting

### Error: Servicios no disponibles
- Verificar que Admin-Service y User-Service estén corriendo
- Comprobar puertos 3003 y 3001

### Error: Docker no disponible
- Verificar que Docker esté corriendo
- Comprobar contenedores: `docker ps`

### Error: Archivos no encontrados
- Verificar timestamp correcto
- Listar backups disponibles en `docker/bd_backup/`
