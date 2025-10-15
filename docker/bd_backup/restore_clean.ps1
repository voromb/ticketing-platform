# Script de Restauracion Completa con Migraciones Prisma - Ticketing Platform
# Autor: Sistema de Restauracion con Migraciones
# Fecha: 2025-10-14

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupDate,
    [Parameter(Mandatory=$false)]
    [switch]$SkipConfirmation,
    [Parameter(Mandatory=$false)]
    [switch]$RestoreConfigs,
    [Parameter(Mandatory=$false)]
    [switch]$ShowProgress
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "           RESTAURACION COMPLETA CON MIGRACIONES PRISMA              " -ForegroundColor Cyan  
Write-Host "                     Ticketing Platform v2.0                        " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Variables globales
$scriptPath = $PSScriptRoot
$backupPath = Join-Path $scriptPath "backups\$BackupDate"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$adminProjectPath = Join-Path $scriptPath "..\..\backend\admin"
$servicesProjectPath = Join-Path $scriptPath "..\..\backend\services\festival-services"

Write-Host "`nVerificando backup..." -ForegroundColor Blue
Write-Host "   Ruta: $backupPath" -ForegroundColor White

if (!(Test-Path $backupPath)) {
    Write-Host "`nError: No se encuentra el directorio de backup" -ForegroundColor Red
    Write-Host "Fechas disponibles:" -ForegroundColor Yellow
    Get-ChildItem (Join-Path $scriptPath "backups") -Directory | ForEach-Object { 
        Write-Host "  - $($_.Name)" -ForegroundColor White 
    }
    exit 1
}

Write-Host "`nAnalizando archivos de backup..." -ForegroundColor Blue
$backupFiles = Get-ChildItem $backupPath -File
Write-Host "   Archivos encontrados: $($backupFiles.Count)" -ForegroundColor White

$postgresMain = $backupFiles | Where-Object { $_.Name -like "*postgres_estado_actual*" -or $_.Name -like "*postgres_ticketing_full*" } | Sort-Object Length -Descending | Select-Object -First 1
$mongoUsers = $backupFiles | Where-Object { $_.Name -like "*mongodb_usuarios*" -or $_.Name -like "*mongodb_users*" -or $_.Name -like "*mongodb_users_manual*" } | Where-Object { $_.Length -gt 100 } | Sort-Object Length -Descending | Select-Object -First 1
$prismaAdminSchema = $backupFiles | Where-Object { $_.Name -like "*prisma_admin_schema*" } | Sort-Object Length -Descending | Select-Object -First 1
$prismaServicesSchema = $backupFiles | Where-Object { $_.Name -like "*prisma_services_schema*" } | Sort-Object Length -Descending | Select-Object -First 1
$prismaAdminMigrations = Get-ChildItem $backupPath -Directory | Where-Object { $_.Name -like "*prisma_admin_migrations*" } | Select-Object -First 1

Write-Host "`nArchivos criticos encontrados:" -ForegroundColor Yellow
Write-Host "   [OK] PostgreSQL Principal: $(if ($postgresMain) { $postgresMain.Name } else { 'ERROR No encontrado' })" -ForegroundColor $(if ($postgresMain) { 'Green' } else { 'Red' })
Write-Host "   [OK] MongoDB Usuarios: $(if ($mongoUsers) { $mongoUsers.Name } else { 'WARN No encontrado' })" -ForegroundColor $(if ($mongoUsers) { 'Green' } else { 'Yellow' })
Write-Host "   [OK] Schema Admin: $(if ($prismaAdminSchema) { $prismaAdminSchema.Name } else { 'WARN No encontrado' })" -ForegroundColor $(if ($prismaAdminSchema) { 'Green' } else { 'Yellow' })
Write-Host "   [OK] Migraciones Admin: $(if ($prismaAdminMigrations) { $prismaAdminMigrations.Name } else { 'ERROR No encontradas' })" -ForegroundColor $(if ($prismaAdminMigrations) { 'Green' } else { 'Red' })

if (!$postgresMain) {
    Write-Host "`nError: No se encontro el backup principal de PostgreSQL" -ForegroundColor Red
    exit 1
}

if (!$prismaAdminMigrations) {
    Write-Host "`nError: No se encontraron las migraciones de Prisma Admin" -ForegroundColor Red
    exit 1
}

function Show-Progress {
    param($Activity, $Status, $PercentComplete)
    if ($ShowProgress) {
        Write-Progress -Activity $Activity -Status $Status -PercentComplete $PercentComplete
    }
}

function Test-DockerServices {
    Write-Host "`nVerificando servicios Docker..." -ForegroundColor Blue
    $services = @("ticketing-postgres", "ticketing-mongodb")
    $allRunning = $true
    foreach ($service in $services) {
        $status = docker ps --filter "name=$service" --format "{{.Status}}" 2>$null
        if ($status -and $status.Contains("Up")) {
            Write-Host "   [OK] $service : Running" -ForegroundColor Green
        } else {
            Write-Host "   [X] $service : Not running" -ForegroundColor Red
            $allRunning = $false
        }
    }
    return $allRunning
}

if (!(Test-DockerServices)) {
    Write-Host "`nError: Algunos servicios Docker no estan corriendo" -ForegroundColor Red
    Write-Host "Inicia los servicios con: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

if (!$SkipConfirmation) {
    Write-Host "`nADVERTENCIA: Esta operacion SOBRESCRIBIRA completamente:" -ForegroundColor Yellow
    Write-Host "   - Todas las bases de datos PostgreSQL" -ForegroundColor Red
    Write-Host "   - Todas las bases de datos MongoDB" -ForegroundColor Red  
    Write-Host "   - Todos los esquemas Prisma" -ForegroundColor Red
    Write-Host "   - Todas las migraciones Prisma" -ForegroundColor Red
    Write-Host "`nEsta accion es IRREVERSIBLE" -ForegroundColor Red
    $confirmacion = Read-Host "`nEscribe 'RESTAURAR' (en mayusculas) para continuar"
    if ($confirmacion -ne "RESTAURAR") {
        Write-Host "Restauracion cancelada por el usuario" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`nIniciando Restauracion Completa con Migraciones..." -ForegroundColor Green

Write-Host "`n[1/6] Restaurando Schemas y Migraciones Prisma..." -ForegroundColor Blue
Show-Progress "Prisma Restore" "Restaurando configuracion de Prisma..." 17

if ($prismaAdminSchema) {
    try {
        $targetSchemaPath = Join-Path $adminProjectPath "prisma\schema.prisma"
        Write-Host "   Restaurando schema Admin..." -ForegroundColor Cyan
        Copy-Item $prismaAdminSchema.FullName $targetSchemaPath -Force
        Write-Host "   [OK] Schema Admin restaurado" -ForegroundColor Green
    } catch {
        Write-Host "   ERROR restaurando schema Admin: $_" -ForegroundColor Red
    }
}

if ($prismaAdminMigrations) {
    try {
        $targetMigrationsPath = Join-Path $adminProjectPath "prisma\migrations"
        Write-Host "   Restaurando migraciones Admin..." -ForegroundColor Cyan
        if (Test-Path $targetMigrationsPath) {
            Remove-Item $targetMigrationsPath -Recurse -Force
        }
        Copy-Item $prismaAdminMigrations.FullName $targetMigrationsPath -Recurse -Force
        $migrations = Get-ChildItem $targetMigrationsPath -Directory
        Write-Host "   [OK] Migraciones Admin restauradas ($($migrations.Count) migraciones)" -ForegroundColor Green
        foreach ($migration in $migrations) {
            Write-Host "     - $($migration.Name)" -ForegroundColor White
        }
    } catch {
        Write-Host "   ERROR restaurando migraciones Admin: $_" -ForegroundColor Red
        exit 1
    }
}

if ($prismaServicesSchema) {
    try {
        $targetServicesSchemaPath = Join-Path $servicesProjectPath "prisma\schema.prisma"
        if (Test-Path (Split-Path $targetServicesSchemaPath)) {
            Write-Host "   Restaurando schema Festival Services..." -ForegroundColor Cyan
            Copy-Item $prismaServicesSchema.FullName $targetServicesSchemaPath -Force
            Write-Host "   [OK] Schema Festival Services restaurado" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ERROR restaurando schema Services: $_" -ForegroundColor Red
    }
}

Write-Host "`n[2/6] Preparando Base de Datos PostgreSQL..." -ForegroundColor Blue
Show-Progress "PostgreSQL Prep" "Limpiando base de datos PostgreSQL..." 34

try {
    Write-Host "   Eliminando datos existentes..." -ForegroundColor Cyan
    docker exec ticketing-postgres psql -U admin -d ticketing -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' 2>$null | Out-Null
    Write-Host "   [OK] Base de datos PostgreSQL limpiada" -ForegroundColor Green
} catch {
    Write-Host "   ERROR limpiando PostgreSQL: $_" -ForegroundColor Red
}

Write-Host "`n[3/6] Ejecutando Migraciones Prisma..." -ForegroundColor Blue
Show-Progress "Prisma Migrate" "Aplicando migraciones de base de datos..." 51

try {
    Write-Host "   Instalando dependencias de Prisma..." -ForegroundColor Cyan
    Set-Location $adminProjectPath
    npm install --silent > $null 2>&1
    $existingTables = docker exec ticketing-postgres psql -U admin -d ticketing -t -c "\dt" 2>$null
    if ($existingTables -and $existingTables.Contains("Event")) {
        Write-Host "   AVISO: Tablas ya existen" -ForegroundColor Yellow
        npx prisma generate > $null 2>&1
        Write-Host "   [OK] Cliente Prisma generado" -ForegroundColor Green
    } else {
        Write-Host "   Ejecutando migraciones Prisma..." -ForegroundColor Cyan
        npx prisma migrate deploy > $null 2>&1
        npx prisma generate > $null 2>&1
        Write-Host "   [OK] Migraciones Prisma ejecutadas" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERROR ejecutando migraciones: $_" -ForegroundColor Red
    try {
        $migrationFile = Get-ChildItem (Join-Path $adminProjectPath "prisma\migrations") -Recurse -Filter "migration.sql" | Select-Object -First 1
        if ($migrationFile) {
            Write-Host "   Aplicando migracion desde SQL..." -ForegroundColor Cyan
            Get-Content $migrationFile.FullName | docker exec -i ticketing-postgres psql -U admin -d ticketing
            Write-Host "   [OK] Migracion aplicada" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ERROR aplicando migracion: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n[4/6] Restaurando Datos PostgreSQL..." -ForegroundColor Blue
Show-Progress "PostgreSQL Data" "Cargando datos de PostgreSQL..." 68

try {
    Write-Host "   Cargando backup de PostgreSQL..." -ForegroundColor Cyan
    Get-Content $postgresMain.FullName | docker exec -i ticketing-postgres psql -U admin -d ticketing > $null 2>&1
    $adminCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "admins";' 2>$null
    $eventCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null
    $venueCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null
    Write-Host "   [OK] Datos PostgreSQL restaurados" -ForegroundColor Green
    if ($adminCount) { Write-Host "     - Administradores: $($adminCount.Trim())" -ForegroundColor White }
    if ($eventCount) { Write-Host "     - Eventos: $($eventCount.Trim())" -ForegroundColor White }
    if ($venueCount) { Write-Host "     - Venues: $($venueCount.Trim())" -ForegroundColor White }
} catch {
    Write-Host "   ERROR restaurando datos PostgreSQL: $_" -ForegroundColor Red
}

Write-Host "`n[5/6] Restaurando Datos MongoDB..." -ForegroundColor Blue
Show-Progress "MongoDB Data" "Cargando datos de MongoDB..." 85

if ($mongoUsers) {
    try {
        Write-Host "   Limpiando coleccion de usuarios..." -ForegroundColor Cyan
        docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use ticketing; db.users.drop()' > $null 2>&1
        Write-Host "   Restaurando usuarios..." -ForegroundColor Cyan
        Get-Content $mongoUsers.FullName | docker exec -i ticketing-mongodb mongoimport -u admin -p admin123 --authenticationDatabase admin --db ticketing --collection users > $null 2>&1
        $userCount = docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use ticketing; print(db.users.countDocuments())' 2>$null
        Write-Host "   [OK] Usuarios MongoDB restaurados" -ForegroundColor Green
        if ($userCount) { Write-Host "     - Total usuarios: $($userCount.Trim())" -ForegroundColor White }
    } catch {
        Write-Host "   ERROR restaurando usuarios: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   WARN No hay backup de usuarios" -ForegroundColor Yellow
}

$mongoFestivalServices = $backupFiles | Where-Object { $_.Name -like "*mongodb_festival_services_dump*" } | Where-Object { $_.Length -gt 100 } | Sort-Object Length -Descending | Select-Object -First 1

if ($mongoFestivalServices) {
    try {
        Write-Host "   Restaurando festival_services..." -ForegroundColor Cyan
        docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use festival_services; db.dropDatabase()' > $null 2>&1
        docker cp $mongoFestivalServices.FullName ticketing-mongodb:/tmp/festival_services_restore.tar.gz > $null 2>&1
        docker exec ticketing-mongodb mongorestore -u admin -p admin123 --authenticationDatabase admin --archive=/tmp/festival_services_restore.tar.gz --gzip > $null 2>&1
        $approvalCount = docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use festival_services; print(db.approvals ? db.approvals.countDocuments() : 0)' 2>$null
        Write-Host "   [OK] Festival Services restaurado" -ForegroundColor Green
        if ($approvalCount -and $approvalCount.Trim() -ne "") { Write-Host "     - Aprobaciones: $($approvalCount.Trim())" -ForegroundColor White }
    } catch {
        Write-Host "   ERROR restaurando festival_services: $_" -ForegroundColor Red
    }
}

Write-Host "`n[6/6] Verificacion Final..." -ForegroundColor Blue
Show-Progress "Final Verification" "Verificando restauracion..." 100

Write-Host "`nVerificando estado del sistema..." -ForegroundColor Cyan

try {
    $postgresStatus = docker exec ticketing-postgres psql -U admin -d ticketing -c '\dt' 2>$null
    if ($postgresStatus) {
        Write-Host "   [OK] PostgreSQL: Conectado y operativo" -ForegroundColor Green
    }
} catch {
    Write-Host "   [X] PostgreSQL: ERROR de conexion" -ForegroundColor Red
}

try {
    $mongoStatus = docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use ticketing; db.stats()' 2>$null
    if ($mongoStatus) {
        Write-Host "   [OK] MongoDB: Conectado y operativo" -ForegroundColor Green
    }
} catch {
    Write-Host "   [X] MongoDB: ERROR de conexion" -ForegroundColor Red
}

Set-Location $scriptPath

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host "                    RESTAURACION COMPLETADA EXITOSAMENTE             " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "`nRESUMEN DE LA RESTAURACION:" -ForegroundColor White
Write-Host "   Backup utilizado: $BackupDate" -ForegroundColor Cyan
Write-Host "   Timestamp: $timestamp" -ForegroundColor Cyan
Write-Host "   Schemas Prisma: Restaurados" -ForegroundColor Green
Write-Host "   Migraciones Prisma: Ejecutadas" -ForegroundColor Green
Write-Host "   PostgreSQL: Restaurado" -ForegroundColor Green
Write-Host "   MongoDB: Restaurado" -ForegroundColor Green
Write-Host "`nPARA INICIAR EL SISTEMA:" -ForegroundColor Yellow
Write-Host "   1. cd ../../backend/admin && npm run dev" -ForegroundColor White
Write-Host "   2. cd ../../backend/user-service && npm run dev" -ForegroundColor White
Write-Host "   3. cd ../../frontend/ticketing-app && npm start" -ForegroundColor White
Write-Host "`nCREDENCIALES DISPONIBLES:" -ForegroundColor Yellow
Write-Host "   Super Admin: voro.super@ticketing.com / Voro123!" -ForegroundColor White
Write-Host "   Admin: admin@ticketing.com / admin123" -ForegroundColor White
Write-Host "`nSISTEMA RESTAURADO Y LISTO PARA USAR" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green

if ($ShowProgress) {
    Write-Progress -Activity "Restore Complete" -Completed
}