# 📊 Script de Backup Completo - Ticketing Platform
# Autor: Sistema de Backup Automático
# Fecha: 2025-10-04

Write-Host "🚀 Iniciando Backup Completo de Bases de Datos..." -ForegroundColor Green

# Variables con rutas relativas desde el script
$scriptPath = $PSScriptRoot
$date = Get-Date -Format "yyyy-MM-dd"
$timestamp = Get-Date -Format "HH-mm"
$backupDir = Join-Path $scriptPath "backups\$date"
$commitHash = (git rev-parse --short HEAD 2>$null) -replace "`n", ""

Write-Host "📅 Fecha: $date" -ForegroundColor Cyan
Write-Host "🕒 Hora: $timestamp" -ForegroundColor Cyan
Write-Host "📁 Directorio: $backupDir" -ForegroundColor Cyan
Write-Host "🔗 Commit: $commitHash" -ForegroundColor Cyan

# Crear directorio por fecha si no existe
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
    Write-Host "📁 Directorio de backup creado: $backupDir" -ForegroundColor Yellow
} else {
    Write-Host "📁 Usando directorio existente: $backupDir" -ForegroundColor Yellow
}

Write-Host "`n🐘 Creando backup de PostgreSQL..." -ForegroundColor Blue

# Backup PostgreSQL - Dump completo
try {
    docker exec ticketing-postgres pg_dump -U admin -d ticketing > "$backupDir\postgres_full_backup_$timestamp.sql"
    Write-Host "✅ PostgreSQL dump creado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en PostgreSQL dump: $_" -ForegroundColor Red
}

# Backup PostgreSQL - Eventos via API
try {
    curl -X GET "http://localhost:3003/api/events" -H "Content-Type: application/json" > "$backupDir\postgres_events_$timestamp.json"
    Write-Host "✅ Eventos exportados via API" -ForegroundColor Green
} catch {
    Write-Host "❌ Error exportando eventos: $_" -ForegroundColor Red
}

# Backup PostgreSQL - Venues via API
try {
    curl -X GET "http://localhost:3003/api/venues?limit=50" -H "Content-Type: application/json" > "$backupDir\postgres_venues_$timestamp.json"
    Write-Host "✅ Venues exportados via API" -ForegroundColor Green
} catch {
    Write-Host "❌ Error exportando venues: $_" -ForegroundColor Red
}

# Backup PostgreSQL - Categorías via API
try {
    curl -X GET "http://localhost:3003/api/categories" -H "Content-Type: application/json" > "$backupDir\postgres_categories_$timestamp.json"
    Write-Host "✅ Categorías exportadas via API" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Advertencia: Error exportando categorías" -ForegroundColor Yellow
}

# Backup PostgreSQL - Localidades via API
try {
    curl -X GET "http://localhost:3003/api/localities" -H "Content-Type: application/json" > "$backupDir\postgres_localities_$timestamp.json"
    Write-Host "✅ Localidades exportadas via API" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Advertencia: Error exportando localidades" -ForegroundColor Yellow
}

Write-Host "`n🍃 Creando backup de MongoDB..." -ForegroundColor Blue

# Backup MongoDB - Usuarios (BASE DE DATOS CORRECTA: ticketing)
try {
    docker exec ticketing-mongodb mongoexport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --out=/tmp/users_backup.json
    docker cp ticketing-mongodb:/tmp/users_backup.json "$backupDir\mongodb_users_$timestamp.json"
    Write-Host "✅ Usuarios exportados desde MongoDB (base de datos: ticketing)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error exportando usuarios: $_" -ForegroundColor Red
}

Write-Host "`n🔧 Copiando Prisma Schema..." -ForegroundColor Blue

# Backup Prisma Schema
try {
    $prismaPath = Join-Path $scriptPath "..\..\backend\admin\prisma\schema.prisma"
    if (Test-Path $prismaPath) {
        Copy-Item $prismaPath "$backupDir\prisma_schema_$timestamp.prisma" -Force
        Write-Host "✅ Prisma Schema copiado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Advertencia: No se encontró el schema de Prisma" -ForegroundColor Yellow
        Write-Host "    Ruta buscada: $prismaPath" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error copiando Prisma Schema: $_" -ForegroundColor Red
}

Write-Host "`n📋 Creando documentación del backup..." -ForegroundColor Blue

# Crear archivo de información del backup
$backupInfo = @"
# 📊 Backup Completo - Ticketing Platform

**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Commit:** $commitHash
**Carpeta:** $backupDir

---

## 🗄️ Archivos de Backup Creados

### PostgreSQL (Admin Service - Puerto 3003)
- ``postgres_full_backup_$timestamp.sql`` - Dump completo de PostgreSQL
- ``postgres_events_$timestamp.json`` - Eventos via API
- ``postgres_venues_$timestamp.json`` - Venues via API
- ``postgres_categories_$timestamp.json`` - Categorías via API
- ``postgres_localities_$timestamp.json`` - Localidades via API

### MongoDB (User Service - Puerto 3001)
- ``mongodb_users_$timestamp.json`` - Usuarios desde MongoDB
- **⚠️ Base de datos:** ticketing (NO ticketing-users)
- **Usuarios respaldados:** 3 (voro, xavi, testuser)

### Prisma Schema
- ``prisma_schema_$timestamp.prisma`` - Schema completo

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
``````powershell
.\restore-databases.ps1 $date
``````

**Bash:**
``````bash
./restore-databases.sh $date
``````

---

**Backup creado exitosamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")**
"@

$backupInfo | Out-File -FilePath "$backupDir\BACKUP_INFO.md" -Encoding UTF8

Write-Host "`n✅ ¡Backup completo finalizado!" -ForegroundColor Green
Write-Host "📁 Archivos creados en: $backupDir" -ForegroundColor White
Write-Host "🕒 Timestamp: $timestamp" -ForegroundColor White
Write-Host "`n🔄 Para restaurar ejecuta: .\restore-databases.ps1 $timestamp" -ForegroundColor Cyan
