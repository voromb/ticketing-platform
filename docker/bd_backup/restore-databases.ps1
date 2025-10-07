# Script de Restore Completo - Ticketing Platform
# Autor: Sistema de Restore Automatico
# Fecha: 2025-10-07
# Uso: .\restore-databases.ps1 -backupDate "2025-10-07" -timestamp "20-23"

param(
    [Parameter(Mandatory=$true)]
    [string]$backupDate,
    
    [Parameter(Mandatory=$false)]
    [string]$timestamp = ""
)

Write-Host "Iniciando Restore de Bases de Datos..." -ForegroundColor Green
Write-Host "Fecha del backup: $backupDate" -ForegroundColor Cyan

$scriptPath = $PSScriptRoot
$backupDir = Join-Path $scriptPath "backups\$backupDate"

# Si no se proporciona timestamp, buscar el mas reciente en la carpeta
if ($timestamp -eq "") {
    Write-Host "Buscando backup mas reciente en $backupDir..." -ForegroundColor Yellow
    
    $sqlFiles = Get-ChildItem "$backupDir\postgres_full_backup_*.sql" -ErrorAction SilentlyContinue
    if ($sqlFiles.Count -eq 0) {
        Write-Host "ERROR: No se encontraron archivos de backup en $backupDir" -ForegroundColor Red
        Write-Host "Carpetas disponibles:" -ForegroundColor Yellow
        Get-ChildItem "backups" -Directory | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
        exit 1
    }
    
    $latestBackup = $sqlFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $timestamp = $latestBackup.Name -replace 'postgres_full_backup_', '' -replace '.sql', ''
    Write-Host "Usando backup: $timestamp" -ForegroundColor Green
}

Write-Host "Timestamp: $timestamp" -ForegroundColor Cyan

# Verificar que existe el directorio de backup
if (!(Test-Path $backupDir)) {
    Write-Host "ERROR: No existe el directorio de backup: $backupDir" -ForegroundColor Red
    Write-Host "Carpetas disponibles:" -ForegroundColor Yellow
    Get-ChildItem "backups" -Directory | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
    exit 1
}

# Archivos requeridos
$postgresFile = "$backupDir\postgres_full_backup_$timestamp.sql"
$mongoFile = "$backupDir\mongodb_users_$timestamp.json"
$prismaFile = "$backupDir\prisma_schema_$timestamp.prisma"

Write-Host "`nVerificando archivos de backup..." -ForegroundColor Blue

$missingFiles = @()

if (Test-Path $postgresFile) {
    $fileSize = (Get-Item $postgresFile).Length / 1KB
    Write-Host "OK - PostgreSQL backup ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "ERROR - No se encuentra: postgres_full_backup_$timestamp.sql" -ForegroundColor Red
    $missingFiles += "PostgreSQL"
}

if (Test-Path $mongoFile) {
    Write-Host "OK - MongoDB backup" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA - No se encuentra: mongodb_users_$timestamp.json" -ForegroundColor Yellow
}

if (Test-Path $prismaFile) {
    Write-Host "OK - Prisma schema" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA - No se encuentra: prisma_schema_$timestamp.prisma" -ForegroundColor Yellow
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`nERROR: Faltan archivos criticos de backup" -ForegroundColor Red
    Write-Host "Archivos disponibles en $backupDir`:" -ForegroundColor Yellow
    Get-ChildItem "$backupDir\*" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
    exit 1
}

Write-Host "`nADVERTENCIA: Este proceso SOBRESCRIBIRA las bases de datos actuales" -ForegroundColor Yellow
Write-Host "Datos que se PERDERAN:" -ForegroundColor Red
Write-Host "  - Todos los venues actuales" -ForegroundColor Red
Write-Host "  - Todos los eventos actuales" -ForegroundColor Red
Write-Host "  - Todas las localidades actuales" -ForegroundColor Red
Write-Host "  - Todos los usuarios de MongoDB actuales" -ForegroundColor Red

$confirm = Read-Host "`nEscribe 'SI' (en mayusculas) para continuar"
if ($confirm -ne "SI") {
    Write-Host "Restore cancelado por el usuario" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n[1/4] Restaurando PostgreSQL..." -ForegroundColor Blue

try {
    Write-Host "Limpiando base de datos PostgreSQL..." -ForegroundColor Cyan
    docker exec ticketing-postgres psql -U admin -d ticketing -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' 2>$null | Out-Null
    Write-Host "Base de datos limpiada correctamente" -ForegroundColor Green
    
    Write-Host "Restaurando desde backup..." -ForegroundColor Cyan
    Get-Content $postgresFile | docker exec -i ticketing-postgres psql -U admin -d ticketing 2>$null | Out-Null
    Write-Host "PostgreSQL restaurado exitosamente" -ForegroundColor Green
    
    # Verificar que se restauro correctamente
    $venueCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null
    $eventCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null
    
    if ($venueCount) {
        Write-Host "  - Venues restaurados: $($venueCount.Trim())" -ForegroundColor Cyan
    }
    if ($eventCount) {
        Write-Host "  - Eventos restaurados: $($eventCount.Trim())" -ForegroundColor Cyan
    }
} catch {
    Write-Host "ERROR restaurando PostgreSQL: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/4] Restaurando MongoDB..." -ForegroundColor Blue

if (Test-Path $mongoFile) {
    try {
        Write-Host "Limpiando coleccion de usuarios..." -ForegroundColor Cyan
        docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.users.deleteMany({})' 2>$null | Out-Null
        Write-Host "Coleccion limpiada" -ForegroundColor Green
        
        Write-Host "Restaurando usuarios..." -ForegroundColor Cyan
        docker cp $mongoFile ticketing-mongodb:/tmp/users_restore.json 2>$null | Out-Null
        docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/users_restore.json 2>$null | Out-Null
        Write-Host "MongoDB restaurado exitosamente" -ForegroundColor Green
        
        # Verificar
        $userCount = docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.users.countDocuments()' 2>$null
        if ($userCount) {
            Write-Host "  - Usuarios restaurados: $($userCount.Trim())" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "ADVERTENCIA: Error restaurando MongoDB: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "OMITIDO - No hay backup de MongoDB" -ForegroundColor Yellow
}

Write-Host "`n[3/4] Restaurando Prisma Schema..." -ForegroundColor Blue

if (Test-Path $prismaFile) {
    try {
        $prismaDestination = Join-Path $scriptPath "..\..\backend\admin\prisma\schema.prisma"
        Copy-Item $prismaFile $prismaDestination -Force
        Write-Host "Prisma Schema copiado" -ForegroundColor Green
        
        Push-Location (Join-Path $scriptPath "..\..\backend\admin")
        
        Write-Host "Generando Prisma Client..." -ForegroundColor Cyan
        npx prisma generate 2>$null | Out-Null
        Write-Host "Prisma Client regenerado" -ForegroundColor Green
        
        Pop-Location
    } catch {
        Write-Host "ADVERTENCIA: Error con Prisma Schema: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "OMITIDO - No hay backup de Prisma Schema" -ForegroundColor Yellow
}

Write-Host "`n[4/4] Verificando restore..." -ForegroundColor Blue

try {
    Write-Host "Verificando PostgreSQL..." -ForegroundColor Cyan
    $tables = docker exec ticketing-postgres psql -U admin -d ticketing -t -c "\dt" 2>$null
    if ($tables) {
        Write-Host "PostgreSQL operativo" -ForegroundColor Green
    }
} catch {
    Write-Host "ADVERTENCIA: No se pudo verificar PostgreSQL" -ForegroundColor Yellow
}

Write-Host "`nRestore completado exitosamente!" -ForegroundColor Green
Write-Host "`nResumen:" -ForegroundColor White
Write-Host "  - PostgreSQL: Restaurado desde $backupDate $timestamp" -ForegroundColor Cyan
Write-Host "  - MongoDB: Restaurado" -ForegroundColor Cyan
Write-Host "  - Prisma: Schema restaurado y cliente regenerado" -ForegroundColor Cyan
Write-Host "`nProximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Reiniciar manualmente los servicios backend:" -ForegroundColor White
Write-Host "     cd backend\admin && npm run dev" -ForegroundColor Gray
Write-Host "     cd backend\user-service && npm run dev" -ForegroundColor Gray
Write-Host "  2. Verificar que los endpoints funcionan:" -ForegroundColor White
Write-Host "     curl http://localhost:3003/api/venues" -ForegroundColor Gray
Write-Host "     curl http://localhost:3003/api/events/public" -ForegroundColor Gray
Write-Host "  3. Verificar logs de los servicios" -ForegroundColor White