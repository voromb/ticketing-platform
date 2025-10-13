# Scripts de Backup y Restauración - Ticketing Platform

**Versión:** 6.0 SIMPLIFICADO  
**Fecha:** 13 de octubre de 2025  
**Estado:** PROBADO Y FUNCIONAL - NOMBRES SIMPLIFICADOS

---

## ARCHIVOS DISPONIBLES

### Scripts Principales

-   `backup.ps1` - Backup completo Windows (PowerShell)
-   `backup.sh` - Backup completo Linux/macOS (Bash)
-   `restore.ps1` - Restauración completa Windows (PowerShell)
-   `restore.sh` - Restauración completa Linux/macOS (Bash)

---

## USO RÁPIDO

### Windows

```powershell
# Backup
.\backup.ps1 -BackupName "mi-backup"

# Restauración
.\restore.ps1 -BackupFolder "2025-10-13" -SkipConfirmation
```

### Linux/macOS

```bash
# Backup
./backup.sh --backup-name "mi-backup"

# Restauración
./restore.sh --backup-folder "2025-10-13" --skip-confirmation
```

---

## ESTRUCTURA DE DIRECTORIOS

```
backups/
└── 2025-10-13/  (solo fecha)
    ├── postgres_ticketing_full_2025-10-13_19-09-20.sql (con hora)
    ├── mongodb_users_2025-10-13_19-09-20.json
    ├── prisma_admin_schema_2025-10-13_19-09-20.prisma
    ├── prisma_services_schema_2025-10-13_19-09-20.prisma
    ├── BACKUP_INFO.json (metadatos)
    └── SYSTEM_INFO_2025-10-13_19-09-20.txt
```

---

## COMPONENTES RESPALDADOS

-   ✅ **PostgreSQL**: ticketing (419 eventos) + approvals_db
-   ✅ **MongoDB**: users + festival_services (7 colecciones)
-   ✅ **Prisma Schemas**: Admin + Services con `prisma generate` automático
-   ✅ **Configuraciones**: .env y docker configs (opcional)
-   ✅ **Metadatos**: Git commit, estadísticas, información del sistema

---

## CARACTERÍSTICAS

### ✅ Implementado

-   Sin emoticonos (compatible UTF-8)
-   Verificación automática de servicios Docker
-   Backup de seguridad automático antes de restaurar
-   Generación automática de clientes Prisma
-   Un directorio por fecha, múltiples backups por día
-   Backups de seguridad centralizados en directorio unificado
-   Compatible Windows (PowerShell) y Linux (Bash)

### ❌ NO incluye

-   `prisma pull` (correcto, no debe sobreescribir esquemas)
-   Backups incrementales (solo completos)
-   Compresión automática (excepto MongoDB dumps)

---

## ESTADO ACTUAL DEL SISTEMA

**Verificado:** 2025-10-13 19:09

-   ✅ Eventos: 419 registros
-   ✅ Venues: 85 registros
-   ✅ Docker: postgres, mongodb, redis, rabbitmq operativos
-   ✅ Prisma: Esquemas sincronizados y clientes generados
-   ✅ Scripts: Probados en Windows

---

## COMANDOS COMPLETOS

### Windows PowerShell

```powershell
# Backup completo con configuraciones
.\backup.ps1 -BackupName "backup-$(Get-Date -Format 'yyyy-MM-dd')" -IncludeConfigs

# Restauración completa sin confirmación
.\restore.ps1 -BackupFolder "2025-10-13" -SkipConfirmation -RestoreConfigs
```

### Linux Bash

```bash
# Backup completo con configuraciones
./backup.sh --backup-name "backup-$(date +%Y-%m-%d)" --include-configs

# Restauración completa sin confirmación
./restore.sh --backup-folder "2025-10-13" --skip-confirmation --restore-configs
```

---

## NOTAS IMPORTANTES

1. **Antes de restaurar**: `taskkill /f /im node.exe` (Windows) o `pkill node` (Linux)
2. **Docker requerido**: Todos los servicios deben estar corriendo
3. **Prisma automático**: Se ejecuta `npx prisma generate` automáticamente
4. **Backups seguros**: Los esquemas actuales se respaldan antes de restaurar
5. **UTF-8 compatible**: Sin emoticonos, funciona en todos los sistemas
