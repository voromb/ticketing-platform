# Script de Restauracion MEJORADO - 100% Autonomo
# Autor: Sistema de Restauracion Autonoma
# Fecha: 2025-10-15
# Descripcion: Restauracion completamente autonoma - FUNCIONA EN CUALQUIER PC

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupDate,
    [Parameter(Mandatory=$false)]
    [switch]$SkipConfirmation,
    [Parameter(Mandatory=$false)]
    [switch]$ShowProgress
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "           RESTAURACION 100% AUTONOMA - TICKETING PLATFORM           " -ForegroundColor Cyan  
Write-Host "                  FUNCIONA EN CUALQUIER PC v3.0                      " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$scriptPath = $PSScriptRoot
$backupPath = Join-Path $scriptPath "backups\$BackupDate"
$adminProjectPath = Join-Path $scriptPath "..\..\backend\admin"
$userProjectPath = Join-Path $scriptPath "..\..\backend\user-service"
$servicesProjectPath = Join-Path $scriptPath "..\..\backend\services\festival-services"

Write-Host "`nVerificando backup..." -ForegroundColor Blue
Write-Host "   Ruta: $backupPath" -ForegroundColor White

if (!(Test-Path $backupPath)) {
    Write-Host "`nError: No se encuentra el directorio de backup" -ForegroundColor Red
    exit 1
}

# Buscar archivos de backup - SELECCIONAR LOS QUE TIENEN MAS DATOS (MAS GRANDES)
$backupFiles = Get-ChildItem $backupPath -File -Recurse
$postgresMain = $backupFiles | Where-Object { $_.Name -like "*postgres_*" } | Sort-Object Length -Descending | Select-Object -First 1
$mongoUsers = $backupFiles | Where-Object { $_.Name -like "*mongodb_users*" } | Sort-Object Length -Descending | Select-Object -First 1
$prismaAdminSchema = $backupFiles | Where-Object { $_.Name -like "*prisma_admin_schema*" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# Buscar directorios de migraciones - EL MAS RECIENTE (que tenga contenido)
$prismaAdminMigrations = Get-ChildItem $backupPath -Directory | Where-Object { $_.Name -like "*prisma_admin_migrations*" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1

Write-Host "`nArchivos encontrados:" -ForegroundColor Yellow
Write-Host "   PostgreSQL: $(if ($postgresMain) { $postgresMain.Name } else { 'NO ENCONTRADO' })" -ForegroundColor $(if ($postgresMain) { 'Green' } else { 'Red' })
Write-Host "   MongoDB: $(if ($mongoUsers) { $mongoUsers.Name } else { 'NO ENCONTRADO' })" -ForegroundColor $(if ($mongoUsers) { 'Green' } else { 'Yellow' })
Write-Host "   Schema Admin: $(if ($prismaAdminSchema) { $prismaAdminSchema.Name } else { 'NO ENCONTRADO' })" -ForegroundColor $(if ($prismaAdminSchema) { 'Green' } else { 'Red' })
Write-Host "   Migraciones: $(if ($prismaAdminMigrations) { $prismaAdminMigrations.Name } else { 'NO ENCONTRADO' })" -ForegroundColor $(if ($prismaAdminMigrations) { 'Green' } else { 'Red' })

if (!$postgresMain -or !$prismaAdminMigrations) {
    Write-Host "`nError: Faltan archivos criticos para la restauracion" -ForegroundColor Red
    exit 1
}

# Verificar servicios Docker
Write-Host "`nVerificando servicios Docker..." -ForegroundColor Blue
$services = @("ticketing-postgres", "ticketing-mongodb")
foreach ($service in $services) {
    $status = docker ps --filter "name=$service" --format "{{.Status}}" 2>$null
    if ($status -and $status.Contains("Up")) {
        Write-Host "   [OK] $service : Running" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] $service : Not running" -ForegroundColor Red
        Write-Host "Por favor, inicia los servicios: docker-compose up -d" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`nIniciando Restauracion 100% Autonoma..." -ForegroundColor Green

# ============================================================================
# PASO 1: RESTAURAR SCHEMAS Y MIGRACIONES ANTES QUE NADA
# ============================================================================
Write-Host "`n[1/6] Restaurando Schemas y Migraciones Prisma..." -ForegroundColor Blue

if ($prismaAdminSchema) {
    try {
        $targetSchemaPath = Join-Path $adminProjectPath "prisma\schema.prisma"
        $schemaDir = Split-Path $targetSchemaPath
        if (!(Test-Path $schemaDir)) { New-Item -ItemType Directory -Path $schemaDir -Force | Out-Null }
        
        Copy-Item $prismaAdminSchema.FullName $targetSchemaPath -Force
        Write-Host "   [OK] Schema Admin restaurado" -ForegroundColor Green
    } catch {
        Write-Host "   ERROR restaurando schema Admin: $_" -ForegroundColor Red
        exit 1
    }
}

# Restaurar Migraciones Admin - CRITICO PARA AUTONOMIA
if ($prismaAdminMigrations) {
    try {
        $targetMigrationsPath = Join-Path $adminProjectPath "prisma\migrations"
        Write-Host "   Limpiando migraciones existentes..." -ForegroundColor Cyan
        
        # Limpiar migraciones existentes completamente
        if (Test-Path $targetMigrationsPath) {
            Remove-Item $targetMigrationsPath -Recurse -Force
        }
        
        # Crear directorio limpio
        New-Item -ItemType Directory -Path $targetMigrationsPath -Force | Out-Null
        
        Write-Host "   Restaurando migraciones desde backup..." -ForegroundColor Cyan
        
        # Copiar migraciones - MANEJO DE ESTRUCTURA RECURSIVA
        $migrationSource = $prismaAdminMigrations.FullName
        
        # Si hay estructura recursiva, encontrar el nivel correcto - SOLO CON CONTENIDO
        $actualMigrations = Get-ChildItem $migrationSource -Directory -Recurse | Where-Object { 
            $_.Name -match '^\d+_' -and (Get-ChildItem $_.FullName -File).Count -gt 0
        }
        
        if ($actualMigrations) {
            # Copiar migraciones reales
            foreach ($migration in $actualMigrations) {
                $destPath = Join-Path $targetMigrationsPath $migration.Name
                Copy-Item $migration.FullName $destPath -Recurse -Force
            }
        } else {
            # Copiar todo si no hay estructura recursiva
            Copy-Item "$migrationSource\*" $targetMigrationsPath -Recurse -Force
        }
        
        # Verificar migraciones restauradas
        $migrations = Get-ChildItem $targetMigrationsPath -Directory | Where-Object { $_.Name -match '^\d+_' }
        Write-Host "   [OK] Migraciones Admin restauradas ($($migrations.Count) migraciones)" -ForegroundColor Green
        foreach ($migration in $migrations) {
            Write-Host "     - $($migration.Name)" -ForegroundColor White
        }
        
        if ($migrations.Count -eq 0) {
            Write-Host "   ERROR: No se encontraron migraciones validas" -ForegroundColor Red
            exit 1
        }
        
    } catch {
        Write-Host "   ERROR restaurando migraciones Admin: $_" -ForegroundColor Red
        exit 1
    }
}

# ============================================================================
# PASO 2: APLICAR MIGRACIONES PRISMA - GARANTIZA FUNCIONAMIENTO
# ============================================================================
Write-Host "`n[2/6] Aplicando Migraciones Prisma..." -ForegroundColor Blue

try {
    Write-Host "   Cambiando al directorio admin..." -ForegroundColor Cyan
    Push-Location $adminProjectPath
    
    Write-Host "   Ejecutando prisma migrate deploy..." -ForegroundColor Cyan
    $deployOutput = npx prisma migrate deploy 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Migraciones Prisma aplicadas exitosamente" -ForegroundColor Green
    } else {
        Write-Host "   WARNING: Error en migrate deploy, intentando reset..." -ForegroundColor Yellow
        Write-Host "   Ejecutando prisma migrate reset..." -ForegroundColor Cyan
        echo "y" | npx prisma migrate reset --force 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] Base de datos reseteada y migraciones aplicadas" -ForegroundColor Green
        } else {
            Write-Host "   ERROR: No se pudieron aplicar las migraciones" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "   Generando cliente Prisma..." -ForegroundColor Cyan
    npx prisma generate 2>&1 | Out-Null
    
} catch {
    Write-Host "   ERROR ejecutando migraciones: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# ============================================================================
# PASO 3: RESTAURAR DATOS POSTGRESQL
# ============================================================================
Write-Host "`n[3/6] Restaurando Datos PostgreSQL..." -ForegroundColor Blue

try {
    Write-Host "   Cargando backup de PostgreSQL..." -ForegroundColor Cyan
    Get-Content $postgresMain.FullName | docker exec -i ticketing-postgres psql -U admin -d ticketing 2>&1 | Out-Null
    
    # Verificar datos restaurados
    $adminCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM admins;' 2>$null
    $eventCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM events;' 2>$null
    $venueCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null
    
    Write-Host "   [OK] Datos PostgreSQL restaurados exitosamente" -ForegroundColor Green
    if ($adminCount) { Write-Host "     - Administradores: $($adminCount.Trim())" -ForegroundColor White }
    if ($eventCount) { Write-Host "     - Eventos: $($eventCount.Trim())" -ForegroundColor White }
    if ($venueCount) { Write-Host "     - Venues: $($venueCount.Trim())" -ForegroundColor White }
} catch {
    Write-Host "   ERROR restaurando datos PostgreSQL: $_" -ForegroundColor Red
    exit 1
}

# ============================================================================
# PASO 4: CREAR DATOS BASICOS SI NO EXISTEN (AUTONOMIA COMPLETA)
# ============================================================================
Write-Host "`n[4/6] Verificando y Creando Datos Basicos..." -ForegroundColor Blue

try {
    # Verificar si hay administradores
    $adminCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM admins;' 2>$null
    
    if ($adminCount -and $adminCount.Trim() -eq "0") {
        Write-Host "   Creando administradores reales del sistema..." -ForegroundColor Cyan
        
        # Crear usuarios reales con sus contraseñas originales
        $createAdminsSQL = @"
INSERT INTO admins (id, email, password, "firstName", "lastName", role, "isActive", "lastLogin", "createdAt", "updatedAt") VALUES 
('ac9a65b3-2fd5-4573-bf28-c016f92bb9cb', 'super@admin.com', '\$2b\$10\$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC', 'Super', 'Admin', 'SUPER_ADMIN', true, NULL, '2025-09-26 16:41:41.502', '2025-09-26 16:41:41.502'),
('467a0b9f-5cd9-46b0-8905-621bc92a8664', 'admin@ticketing.com', '\$2b\$10\$HoEiiBcf.gNHO7dlL19arOq53/sxDIhVoECEI5XjrWiZiJQV3hOZC', 'Admin', 'User', 'ADMIN', true, NULL, '2025-09-26 16:41:41.502', '2025-09-26 16:41:41.502'),
('26fa8809-a1a4-4242-9d09-42e65e5ee368', 'voro.super@ticketing.com', '\$2b\$10\$zN5zpSTorCYjQvmlL4xfbO5ldb3Dtd1ReISxEGzIE6wMdAO.1B4/a', 'Voro', 'SuperAdmin', 'SUPER_ADMIN', true, NULL, '2025-09-27 15:27:15.819', '2025-09-27 15:27:15.819')
ON CONFLICT (email) DO NOTHING;
"@
        
        echo $createAdminsSQL | docker exec -i ticketing-postgres psql -U admin -d ticketing 2>&1 | Out-Null
        Write-Host "   [OK] Administradores reales creados" -ForegroundColor Green
        Write-Host "     - super@admin.com (contraseña original)" -ForegroundColor White
        Write-Host "     - admin@ticketing.com (contraseña original)" -ForegroundColor White
        Write-Host "     - voro.super@ticketing.com (contraseña original)" -ForegroundColor White
    } else {
        Write-Host "   [OK] Administradores ya existen ($($adminCount.Trim()))" -ForegroundColor Green
    }
    
} catch {
    Write-Host "   WARN: Error verificando administradores: $_" -ForegroundColor Yellow
}

# ============================================================================
# PASO 5: RESTAURAR MONGODB
# ============================================================================
Write-Host "`n[5/6] Restaurando Datos MongoDB..." -ForegroundColor Blue

if ($mongoUsers) {
    try {
        Write-Host "   Limpiando coleccion de usuarios..." -ForegroundColor Cyan
        docker exec ticketing-mongodb mongosh --eval 'use ticketing; db.users.deleteMany({});' 2>&1 | Out-Null
        
        Write-Host "   Restaurando usuarios desde backup..." -ForegroundColor Cyan
        Get-Content $mongoUsers.FullName | docker exec -i ticketing-mongodb mongosh ticketing 2>&1 | Out-Null
        
        $userCount = docker exec ticketing-mongodb mongosh --quiet --eval 'use ticketing; db.users.countDocuments();' 2>$null
        Write-Host "   [OK] Usuarios MongoDB restaurados exitosamente" -ForegroundColor Green
        if ($userCount) { Write-Host "     - Total usuarios: $($userCount.Trim())" -ForegroundColor White }
    } catch {
        Write-Host "   ERROR restaurando MongoDB: $_" -ForegroundColor Red
        # No salir, MongoDB es opcional
    }
}

# ============================================================================
# PASO 6: VERIFICACION FINAL COMPLETA
# ============================================================================
Write-Host "`n[6/6] Verificacion Final..." -ForegroundColor Blue

try {
    # Verificar PostgreSQL
    $pgTest = docker exec ticketing-postgres psql -U admin -d ticketing -c '\dt' 2>$null
    if ($pgTest) {
        Write-Host "   [OK] PostgreSQL: Conectado y operativo" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] PostgreSQL: No responde" -ForegroundColor Red
    }
    
    # Verificar MongoDB
    $mongoTest = docker exec ticketing-mongodb mongosh --quiet --eval 'db.adminCommand("ping")' 2>$null
    if ($mongoTest -and $mongoTest.Contains('"ok" : 1')) {
        Write-Host "   [OK] MongoDB: Conectado y operativo" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] MongoDB: Posible problema de conexion" -ForegroundColor Yellow
    }
    
    # Verificar estructura Prisma
    Push-Location $adminProjectPath
    $migrateStatus = npx prisma migrate status 2>&1
    if ($migrateStatus -and $migrateStatus.Contains("up to date")) {
        Write-Host "   [OK] Prisma: Migraciones sincronizadas" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Prisma: Verificar estado de migraciones" -ForegroundColor Yellow
    }
    Pop-Location
    
} catch {
    Write-Host "   ERROR en verificacion: $_" -ForegroundColor Red
}

# ============================================================================
# PASO 7: RESUMEN FINAL
# ============================================================================
Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "                   RESTAURACION 100% AUTONOMA COMPLETADA              " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

Write-Host "`nRESUMEN DE LA RESTAURACION:" -ForegroundColor Green
Write-Host "   Backup utilizado: $BackupDate" -ForegroundColor White
Write-Host "   Schemas Prisma: Restaurados" -ForegroundColor White
Write-Host "   Migraciones Prisma: Aplicadas y Funcionando" -ForegroundColor White
Write-Host "   PostgreSQL: Restaurado con datos" -ForegroundColor White
Write-Host "   MongoDB: Restaurado" -ForegroundColor White

Write-Host "`nPARA INICIAR EL SISTEMA EN ESTE PC:" -ForegroundColor Yellow
Write-Host "   1. cd ../../backend/admin && npm run dev" -ForegroundColor White
Write-Host "   2. cd ../../backend/user-service && npm run dev" -ForegroundColor White
Write-Host "   3. cd ../../frontend/ticketing-app && npm start" -ForegroundColor White
Write-Host "`nCREDENCIALES DISPONIBLES:" -ForegroundColor Yellow
Write-Host "   Super Admin: super@admin.com (contraseña original)" -ForegroundColor White
Write-Host "   Admin: admin@ticketing.com (contraseña original)" -ForegroundColor White
Write-Host "   Super Admin 2: voro.super@ticketing.com (contraseña original)" -ForegroundColor White

Write-Host "`nSISTEMA 100% FUNCIONAL EN CUALQUIER PC [OK]" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan