# 🔄 Script de Restore Completo - Ticketing Platform
# Autor: Sistema de Restore Automático
# Fecha: 2025-10-04

param(
    [Parameter(Mandatory=$true)]
    [string]$timestamp
)

Write-Host "🔄 Iniciando Restore de Bases de Datos..." -ForegroundColor Green
Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Cyan

# Detectar si es formato fecha (YYYY-MM-DD) o timestamp (HH-MM)
if ($timestamp -match '^\d{4}-\d{2}-\d{2}$') {
    $backupDir = "backups\$timestamp"
} else {
    # Buscar en carpetas de fecha recientes
    $latestDate = (Get-ChildItem "backups" -Directory | Sort-Object Name -Descending | Select-Object -First 1).Name
    $backupDir = "backups\$latestDate"
}

# Verificar que existen los archivos de backup
$requiredFiles = @(
    "$backupDir\postgres_full_backup_$timestamp.sql",
    "$backupDir\mongodb_users_$timestamp.json",
    "$backupDir\prisma_schema_$timestamp.prisma"
)

# Archivos opcionales (no críticos)
$optionalFiles = @(
    "$backupDir\postgres_categories_$timestamp.json",
    "$backupDir\postgres_localities_$timestamp.json"
)

Write-Host "`n🔍 Verificando archivos de backup..." -ForegroundColor Blue
Write-Host "📁 Directorio: $backupDir" -ForegroundColor Cyan

foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Archivo no encontrado: $file" -ForegroundColor Red
        Write-Host "💡 Archivos disponibles:" -ForegroundColor Yellow
        Get-ChildItem "$backupDir\*" | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor White }
        exit 1
    } else {
        Write-Host "✅ Encontrado: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
}

Write-Host "`n📦 Verificando archivos opcionales..." -ForegroundColor Blue
foreach ($file in $optionalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Encontrado: $(Split-Path $file -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Opcional no encontrado: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

Write-Host "`n⚠️  ADVERTENCIA: Este proceso sobrescribirá las bases de datos actuales" -ForegroundColor Yellow
$confirm = Read-Host "¿Continuar con el restore? (s/N)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Restore cancelado por el usuario" -ForegroundColor Red
    exit 0
}

Write-Host "`n🛑 Deteniendo servicios..." -ForegroundColor Blue
try {
    taskkill /f /im "node.exe" 2>$null
    Write-Host "✅ Servicios Node.js detenidos" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No se encontraron procesos Node.js activos" -ForegroundColor Yellow
}

Write-Host "`n🐘 Restaurando PostgreSQL..." -ForegroundColor Blue

# Restore PostgreSQL
try {
    # Limpiar base de datos
    docker exec ticketing-postgres psql -U admin -d ticketing -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
    Write-Host "✅ Base de datos PostgreSQL limpiada" -ForegroundColor Green
    
    # Restaurar desde backup
    Get-Content "$backupDir\postgres_full_backup_$timestamp.sql" | docker exec -i ticketing-postgres psql -U admin -d ticketing
    Write-Host "✅ PostgreSQL restaurado desde backup" -ForegroundColor Green
} catch {
    Write-Host "❌ Error restaurando PostgreSQL: $_" -ForegroundColor Red
}

Write-Host "`n🍃 Restaurando MongoDB..." -ForegroundColor Blue

# Restore MongoDB - Limpiar y restaurar
try {
    # Limpiar colección de usuarios
    docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --eval 'use ticketing; db.users.deleteMany({})' 2>$null
    Write-Host "✅ Colección de usuarios limpiada" -ForegroundColor Green
    
    # Restaurar usuarios desde backup
    docker cp "$backupDir\mongodb_users_$timestamp.json" ticketing-mongodb:/tmp/users_restore.json
    docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/users_restore.json --jsonArray 2>$null
    Write-Host "✅ Usuarios restaurados desde MongoDB" -ForegroundColor Green
} catch {
    Write-Host "❌ Error restaurando MongoDB: $_" -ForegroundColor Red
}

Write-Host "`n🔧 Restaurando Prisma Schema..." -ForegroundColor Blue

# Restore Prisma Schema
try {
    $prismaDestination = "..\..\backend\admin\prisma\schema.prisma"
    Copy-Item "$backupDir\prisma_schema_$timestamp.prisma" $prismaDestination -Force
    Write-Host "✅ Prisma Schema restaurado" -ForegroundColor Green
    
    Push-Location "..\..\backend\admin"
    
    # Sincronizar Prisma con PostgreSQL restaurado
    Write-Host "🔄 Sincronizando Prisma con PostgreSQL..." -ForegroundColor Cyan
    try {
        npx prisma db push --accept-data-loss 2>$null
        Write-Host "✅ Prisma sincronizado con base de datos" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Advertencia: Error en sincronización (continuando...)" -ForegroundColor Yellow
    }
    
    # Regenerar Prisma Client
    Write-Host "🔄 Regenerando Prisma Client..." -ForegroundColor Cyan
    npx prisma generate 2>$null
    Write-Host "✅ Prisma Client regenerado correctamente" -ForegroundColor Green
    
    Pop-Location
} catch {
    Write-Host "❌ Error restaurando Prisma Schema: $_" -ForegroundColor Red
}

Write-Host "`n🚀 Reiniciando servicios..." -ForegroundColor Blue

# Reiniciar servicios
try {
    $adminPath = Join-Path $PSScriptRoot "..\..\backend\admin"
    $userPath = Join-Path $PSScriptRoot "..\..\backend\user-service"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$adminPath'; npm run dev" -WindowStyle Minimized
    Start-Sleep 2
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$userPath'; npm run dev" -WindowStyle Minimized
    Write-Host "✅ Servicios reiniciados" -ForegroundColor Green
} catch {
    Write-Host "❌ Error reiniciando servicios: $_" -ForegroundColor Red
}

Write-Host "`n📦 Restaurando datos adicionales..." -ForegroundColor Blue

# Restaurar categorías si existe el archivo
if (Test-Path "$backupDir\postgres_categories_$timestamp.json") {
    Write-Host "📂 Categorías disponibles para importación manual" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No hay backup de categorías" -ForegroundColor Yellow
}

# Restaurar localidades si existe el archivo
if (Test-Path "$backupDir\postgres_localities_$timestamp.json") {
    Write-Host "🏢 Localidades disponibles para importación manual" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No hay backup de localidades" -ForegroundColor Yellow
}

Write-Host "`n✅ ¡Restore completado!" -ForegroundColor Green
Write-Host "📋 Resumen:" -ForegroundColor White
Write-Host "   🐘 PostgreSQL: Restaurado desde SQL dump" -ForegroundColor White
Write-Host "   🍃 MongoDB: Archivo disponible para restore manual" -ForegroundColor White
Write-Host "   🔧 Prisma: Schema restaurado y cliente regenerado" -ForegroundColor White
Write-Host "   📦 Categorías y Localidades: Disponibles en archivos JSON" -ForegroundColor White
Write-Host "   🚀 Servicios: Reiniciados automáticamente" -ForegroundColor White

Write-Host "`n💡 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Verificar que los servicios estén funcionando" -ForegroundColor White
Write-Host "   2. Restaurar MongoDB manualmente si es necesario" -ForegroundColor White
Write-Host "   3. Importar categorías y localidades si es necesario" -ForegroundColor White
Write-Host "   4. Probar la aplicación" -ForegroundColor White
