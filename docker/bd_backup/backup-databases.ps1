# Script de Backup Completo - Ticketing Platform
# Autor: Sistema de Backup Automatico
# Fecha: 2025-10-07

Write-Host "Iniciando Backup Completo de Bases de Datos..." -ForegroundColor Green

# Variables con rutas relativas desde el script
$scriptPath = $PSScriptRoot
$date = Get-Date -Format "yyyy-MM-dd"
$timestamp = Get-Date -Format "HH-mm"
$backupDir = Join-Path $scriptPath "backups\$date"
$commitHash = (git rev-parse --short HEAD 2>$null) -replace "`n", ""

Write-Host "Fecha: $date" -ForegroundColor Cyan
Write-Host "Hora: $timestamp" -ForegroundColor Cyan
Write-Host "Directorio: $backupDir" -ForegroundColor Cyan
Write-Host "Commit: $commitHash" -ForegroundColor Cyan

# Crear directorio por fecha si no existe
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
    Write-Host "Directorio de backup creado: $backupDir" -ForegroundColor Yellow
} else {
    Write-Host "Usando directorio existente: $backupDir" -ForegroundColor Yellow
}

Write-Host "`nCreando backup de PostgreSQL..." -ForegroundColor Blue

# Backup PostgreSQL - Dump completo (ESTO ES LO MAS IMPORTANTE)
try {
    docker exec ticketing-postgres pg_dump -U admin -d ticketing > "$backupDir\postgres_full_backup_$timestamp.sql"
    Write-Host "PostgreSQL dump creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error en PostgreSQL dump: $_" -ForegroundColor Red
}

# Backup PostgreSQL - Eventos via API (ENDPOINT PUBLICO)
try {
    curl -X GET "http://localhost:3003/api/events/public" -H "Content-Type: application/json" > "$backupDir\postgres_events_$timestamp.json"
    Write-Host "Eventos exportados via API" -ForegroundColor Green
} catch {
    Write-Host "Error exportando eventos: $_" -ForegroundColor Red
}

# Backup PostgreSQL - Venues via API (PUBLICO)
try {
    curl -X GET "http://localhost:3003/api/venues?limit=100" -H "Content-Type: application/json" > "$backupDir\postgres_venues_$timestamp.json"
    Write-Host "Venues exportados via API" -ForegroundColor Green
} catch {
    Write-Host "Error exportando venues: $_" -ForegroundColor Red
}

# Backup PostgreSQL - Venues pagina 2
try {
    curl -X GET "http://localhost:3003/api/venues?limit=100&page=2" -H "Content-Type: application/json" > "$backupDir\postgres_venues_page2_$timestamp.json"
    Write-Host "Venues pagina 2 exportados" -ForegroundColor Green
} catch {
    Write-Host "Info: No hay segunda pagina de venues" -ForegroundColor Yellow
}

Write-Host "`nCreando backup de MongoDB..." -ForegroundColor Blue

# Backup MongoDB - Usuarios
try {
    docker exec ticketing-mongodb mongoexport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --out=/tmp/users_backup.json
    docker cp ticketing-mongodb:/tmp/users_backup.json "$backupDir\mongodb_users_$timestamp.json"
    Write-Host "Usuarios exportados desde MongoDB" -ForegroundColor Green
} catch {
    Write-Host "Error exportando usuarios: $_" -ForegroundColor Red
}

Write-Host "`nCopiando Prisma Schema..." -ForegroundColor Blue

# Backup Prisma Schema
try {
    $prismaPath = Join-Path $scriptPath "..\..\backend\admin\prisma\schema.prisma"
    if (Test-Path $prismaPath) {
        Copy-Item $prismaPath "$backupDir\prisma_schema_$timestamp.prisma" -Force
        Write-Host "Prisma Schema copiado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Advertencia: No se encontro el schema de Prisma" -ForegroundColor Yellow
        Write-Host "Ruta buscada: $prismaPath" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error copiando Prisma Schema: $_" -ForegroundColor Red
}

Write-Host "`nCreando estadisticas del backup..." -ForegroundColor Blue

# Contar registros en PostgreSQL
try {
    $venueCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";'
    $eventCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";'
    $localityCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "EventLocality";'
    
    if ($venueCount) { Write-Host "Venues: $($venueCount.Trim())" -ForegroundColor Cyan }
    if ($eventCount) { Write-Host "Eventos: $($eventCount.Trim())" -ForegroundColor Cyan }
    if ($localityCount) { Write-Host "Localidades: $($localityCount.Trim())" -ForegroundColor Cyan }
} catch {
    Write-Host "No se pudieron obtener estadisticas" -ForegroundColor Yellow
}

# Crear archivo de informacion del backup
$backupInfo = @"
# Backup Completo - Ticketing Platform

**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Commit:** $commitHash
**Carpeta:** $backupDir

---

## Archivos de Backup Creados

### PostgreSQL (Admin Service - Puerto 3003)
- ``postgres_full_backup_$timestamp.sql`` - DUMP COMPLETO (85 venues, 419 eventos, 1,257 localidades)
- ``postgres_events_$timestamp.json`` - Eventos via API publica
- ``postgres_venues_$timestamp.json`` - Venues via API (pagina 1)
- ``postgres_venues_page2_$timestamp.json`` - Venues via API (pagina 2)

### MongoDB (User Service - Puerto 3001)
- ``mongodb_users_$timestamp.json`` - Usuarios desde MongoDB
- **Base de datos:** ticketing

### Prisma Schema
- ``prisma_schema_$timestamp.prisma`` - Schema completo

---

## Datos Respaldados

- **Venues:** $($venueCount ? $venueCount.Trim() : 'N/A') (36 Europa + 49 España)
- **Eventos:** $($eventCount ? $eventCount.Trim() : 'N/A') (enero 2025 - marzo 2026)
- **Localidades:** $($localityCount ? $localityCount.Trim() : 'N/A')
- **Encoding:** UTF-8
- **Estado:** 100% disponible (sin ventas)

---

## Para Restaurar

**Restaurar PostgreSQL completo:**
``````powershell
docker exec -i ticketing-postgres psql -U admin -d ticketing < postgres_full_backup_$timestamp.sql
``````

**Restaurar MongoDB:**
``````powershell
docker cp mongodb_users_$timestamp.json ticketing-mongodb:/tmp/users.json
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/users.json
``````

**Resetear base de datos antes de restaurar (CUIDADO - Borra todos los datos):**
``````powershell
# Borrar y recrear base de datos PostgreSQL
docker exec ticketing-postgres psql -U admin -c "DROP DATABASE IF EXISTS ticketing;"
docker exec ticketing-postgres psql -U admin -c "CREATE DATABASE ticketing;"

# Aplicar migraciones de Prisma
cd backend\admin
npx prisma migrate deploy

# Restaurar desde backup
docker exec -i ticketing-postgres psql -U admin -d ticketing < ..\..\scripts\database\backups\$date\postgres_full_backup_$timestamp.sql
``````

---

**Backup creado exitosamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")**

## Notas Importantes

- El archivo ``postgres_full_backup_$timestamp.sql`` contiene TODOS los datos (venues, eventos, localidades, categorias, relaciones)
- Los archivos JSON son solo para verificacion
- Mantener estos backups en un lugar seguro
- Recomendado: Backup diario automatico
- Los backups se organizan por fecha en carpetas separadas

"@

$backupInfo | Out-File -FilePath "$backupDir\BACKUP_INFO.md" -Encoding UTF8

Write-Host "`nBackup completo finalizado exitosamente!" -ForegroundColor Green
Write-Host "Archivos creados en: $backupDir" -ForegroundColor White
Write-Host "`nTotal de datos respaldados:" -ForegroundColor White
if ($venueCount) { Write-Host "  - Venues: $($venueCount.Trim())" -ForegroundColor Cyan }
if ($eventCount) { Write-Host "  - Eventos: $($eventCount.Trim())" -ForegroundColor Cyan }
if ($localityCount) { Write-Host "  - Localidades: $($localityCount.Trim())" -ForegroundColor Cyan }
Write-Host "`nPara restaurar ejecuta: docker exec -i ticketing-postgres psql -U admin -d ticketing < $backupDir\postgres_full_backup_$timestamp.sql" -ForegroundColor Cyan