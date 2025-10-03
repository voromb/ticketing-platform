# 📊 Script de Backup Completo - Ticketing Platform
# Autor: Sistema de Backup Automático
# Fecha: 2025-10-04

Write-Host "🚀 Iniciando Backup Completo de Bases de Datos..." -ForegroundColor Green

# Variables
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupDir = "backup"
$commitHash = (git rev-parse --short HEAD 2>$null) -replace "`n", ""

Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Cyan
Write-Host "📁 Directorio: $backupDir" -ForegroundColor Cyan
Write-Host "🔗 Commit: $commitHash" -ForegroundColor Cyan

# Crear directorio si no existe
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
    Write-Host "📁 Directorio de backup creado" -ForegroundColor Yellow
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

Write-Host "`n🍃 Creando backup de MongoDB..." -ForegroundColor Blue

# Backup MongoDB - Usuarios via API
try {
    curl -X GET "http://localhost:3001/api/users" -H "Content-Type: application/json" > "$backupDir\mongodb_users_$timestamp.json"
    Write-Host "✅ Usuarios exportados via API" -ForegroundColor Green
} catch {
    Write-Host "❌ Error exportando usuarios: $_" -ForegroundColor Red
}

Write-Host "`n🔧 Copiando Prisma Schema..." -ForegroundColor Blue

# Backup Prisma Schema
try {
    Copy-Item "backend\admin\prisma\schema.prisma" "$backupDir\prisma_schema_$timestamp.prisma"
    Write-Host "✅ Prisma Schema copiado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error copiando Prisma Schema: $_" -ForegroundColor Red
}

Write-Host "`n📋 Creando documentación del backup..." -ForegroundColor Blue

# Crear archivo de información del backup
$backupInfo = @"
# 📊 Backup Completo - Ticketing Platform
**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Commit:** $commitHash
**Timestamp:** $timestamp

## 🗄️ Archivos de Backup Creados

### PostgreSQL (Admin Service)
- ``postgres_full_backup_$timestamp.sql`` - Dump completo de PostgreSQL
- ``postgres_events_$timestamp.json`` - Eventos via API
- ``postgres_venues_$timestamp.json`` - Venues via API

### MongoDB (User Service)  
- ``mongodb_users_$timestamp.json`` - Usuarios via API

### Prisma Schema
- ``prisma_schema_$timestamp.prisma`` - Schema completo

## 📋 Estado del Sistema al momento del backup
- Admin-Service (Puerto 3003)
- User-Service (Puerto 3001) 
- PostgreSQL con 8 modelos sincronizados
- MongoDB con rol 'admin' soportado
- Prisma Client actualizado

## 🔧 Para Restaurar
Ejecutar: ``.\restore-databases.ps1 $timestamp``
"@

$backupInfo | Out-File -FilePath "$backupDir\BACKUP_INFO_$timestamp.md" -Encoding UTF8

Write-Host "`n✅ ¡Backup completo finalizado!" -ForegroundColor Green
Write-Host "📁 Archivos creados en: $backupDir" -ForegroundColor White
Write-Host "🕒 Timestamp: $timestamp" -ForegroundColor White
Write-Host "`n🔄 Para restaurar ejecuta: .\restore-databases.ps1 $timestamp" -ForegroundColor Cyan
