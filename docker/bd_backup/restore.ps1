# Script de Restauracion Completa Unificada - Ticketing Platform
# Autor: Sistema de Restauracion Automatico Unificado
# Fecha: 2025-10-13
# Descripcion: Restauracion completa de todo el sistema desde un backup unificado

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFolder,
    [Parameter(Mandatory=$false)]
    [switch]$SkipConfirmation,
    [Parameter(Mandatory=$false)]
    [switch]$RestoreConfigs,
    [Parameter(Mandatory=$false)]
    [switch]$ShowProgress
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                 RESTAURACION COMPLETA UNIFICADA                     " -ForegroundColor Cyan  
Write-Host "                 Ticketing Platform v2.0                            " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Variables globales
$scriptPath = $PSScriptRoot
$backupPath = Join-Path $scriptPath "backups\$BackupFolder"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

Write-Host "`nVerificando backup..." -ForegroundColor Blue
Write-Host "   Ruta: $backupPath" -ForegroundColor White

# Verificar que existe el directorio de backup
if (!(Test-Path $backupPath)) {
    Write-Host "`nError: No se encuentra el directorio de backup" -ForegroundColor Red
    Write-Host "Carpetas disponibles:" -ForegroundColor Yellow
    Get-ChildItem "backups" -Directory -Recurse | ForEach-Object { 
        $relativePath = $_.FullName.Replace((Join-Path $scriptPath "backups\"), "")
        Write-Host "  - $relativePath" -ForegroundColor White 
    }
    exit 1
}

# Leer informacion del backup si existe
$backupInfoPath = Join-Path $backupPath "BACKUP_INFO.json"
if (Test-Path $backupInfoPath) {
    $backupInfo = Get-Content $backupInfoPath -Raw | ConvertFrom-Json
    Write-Host "`nInformacion del Backup:" -ForegroundColor Yellow
    Write-Host "   Fecha: $($backupInfo.BackupDate)" -ForegroundColor White
    Write-Host "   Hora: $($backupInfo.BackupTime)" -ForegroundColor White
    Write-Host "   Nombre: $($backupInfo.BackupName)" -ForegroundColor White
    Write-Host "   Commit: $($backupInfo.GitCommit)" -ForegroundColor White
}

# Buscar archivos de backup
Write-Host "`nAnalizando archivos de backup..." -ForegroundColor Blue
$backupFiles = Get-ChildItem $backupPath -File
Write-Host "   Archivos encontrados: $($backupFiles.Count)" -ForegroundColor White

# Identificar archivos principales
$postgresMain = $backupFiles | Where-Object { $_.Name -like "*postgres_ticketing_full*" } | Select-Object -First 1
$postgresApprovals = $backupFiles | Where-Object { $_.Name -like "*postgres_approvals_db*" } | Select-Object -First 1
$mongoUsers = $backupFiles | Where-Object { $_.Name -like "*mongodb_users*" } | Select-Object -First 1
$mongoFestivalDump = $backupFiles | Where-Object { $_.Name -like "*festival_services_dump*" } | Select-Object -First 1
$prismaAdmin = $backupFiles | Where-Object { $_.Name -like "*prisma_admin_schema*" } | Select-Object -First 1
$prismaServices = $backupFiles | Where-Object { $_.Name -like "*prisma_services_schema*" } | Select-Object -First 1

Write-Host "`nArchivos criticos:" -ForegroundColor Yellow
Write-Host "   PostgreSQL Principal: $(if ($postgresMain) { 'OK ' + $postgresMain.Name } else { 'ERROR No encontrado' })" -ForegroundColor $(if ($postgresMain) { 'Green' } else { 'Red' })
Write-Host "   PostgreSQL Approvals: $(if ($postgresApprovals) { 'OK ' + $postgresApprovals.Name } else { 'WARN No encontrado' })" -ForegroundColor $(if ($postgresApprovals) { 'Green' } else { 'Yellow' })
Write-Host "   MongoDB Usuarios: $(if ($mongoUsers) { 'OK ' + $mongoUsers.Name } else { 'WARN No encontrado' })" -ForegroundColor $(if ($mongoUsers) { 'Green' } else { 'Yellow' })
Write-Host "   MongoDB Festival Services: $(if ($mongoFestivalDump) { 'OK ' + $mongoFestivalDump.Name } else { 'WARN No encontrado' })" -ForegroundColor $(if ($mongoFestivalDump) { 'Green' } else { 'Yellow' })
Write-Host "   Prisma Admin Schema: $(if ($prismaAdmin) { 'OK ' + $prismaAdmin.Name } else { 'WARN No encontrado' })" -ForegroundColor $(if ($prismaAdmin) { 'Green' } else { 'Yellow' })
Write-Host "   Prisma Services Schema: $(if ($prismaServices) { 'OK ' + $prismaServices.Name } else { 'WARN No encontrado' })" -ForegroundColor $(if ($prismaServices) { 'Green' } else { 'Yellow' })

# Verificar archivos criticos
if (!$postgresMain) {
    Write-Host "`nError: No se encontro el backup principal de PostgreSQL" -ForegroundColor Red
    exit 1
}

# Funcion para mostrar progress
function Show-Progress {
    param($Activity, $Status, $PercentComplete)
    if ($ShowProgress) {
        Write-Progress -Activity $Activity -Status $Status -PercentComplete $PercentComplete
    }
}

# Funcion para verificar servicios Docker
function Test-DockerServices {
    Write-Host "`nVerificando servicios Docker..." -ForegroundColor Blue
    
    $services = @("ticketing-postgres", "ticketing-mongodb", "ticketing-redis", "ticketing-rabbitmq")
    $allRunning = $true
    
    foreach ($service in $services) {
        $status = docker ps --filter "name=$service" --format "{{.Status}}" 2>$null
        if ($status -and $status.Contains("Up")) {
            Write-Host "   OK $service : Running" -ForegroundColor Green
        } else {
            Write-Host "   ERROR $service : Not running" -ForegroundColor Red
            $allRunning = $false
        }
    }
    
    return $allRunning
}

# Verificar servicios Docker
if (!(Test-DockerServices)) {
    Write-Host "`nError: Algunos servicios Docker no estan corriendo" -ForegroundColor Red
    Write-Host "Por favor, inicia los servicios Docker con: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Confirmacion del usuario
if (!$SkipConfirmation) {
    Write-Host "`nADVERTENCIA: Esta operacion SOBRESCRIBIRA completamente:" -ForegroundColor Yellow
    Write-Host "   - Todas las bases de datos PostgreSQL" -ForegroundColor Red
    Write-Host "   - Todas las bases de datos MongoDB" -ForegroundColor Red  
    Write-Host "   - Todos los esquemas Prisma" -ForegroundColor Red
    if ($RestoreConfigs) {
        Write-Host "   - Todos los archivos de configuracion" -ForegroundColor Red
    }
    
    Write-Host "`nEsta accion es IRREVERSIBLE" -ForegroundColor Red
    $confirm = Read-Host "`nEscribe 'RESTAURAR' (en mayusculas) para continuar"
    if ($confirm -ne "RESTAURAR") {
        Write-Host "Restauracion cancelada por el usuario" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`nIniciando Restauracion Completa..." -ForegroundColor Green

# ============================================================================
# 1. POSTGRESQL - BASE DE DATOS PRINCIPAL
# ============================================================================
Write-Host "`n[1/7] Restaurando PostgreSQL - Base de Datos Principal..." -ForegroundColor Blue
Show-Progress "PostgreSQL Main" "Restaurando base de datos principal..." 14

try {
    Write-Host "   Limpiando base de datos existente..." -ForegroundColor Cyan
    docker exec ticketing-postgres psql -U admin -d ticketing -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;' 2>$null | Out-Null
    
    Write-Host "   Restaurando desde backup..." -ForegroundColor Cyan
    Get-Content $postgresMain.FullName | docker exec -i ticketing-postgres psql -U admin -d ticketing 2>$null | Out-Null
    
    # Verificar restauracion
    $eventCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null
    $venueCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null
    
    Write-Host "   OK PostgreSQL principal restaurado exitosamente" -ForegroundColor Green
    if ($eventCount) {
        Write-Host "     - Eventos: $($eventCount.Trim())" -ForegroundColor White
    }
    if ($venueCount) {
        Write-Host "     - Venues: $($venueCount.Trim())" -ForegroundColor White
    }
    
} catch {
    Write-Host "   ERROR restaurando PostgreSQL principal: $_" -ForegroundColor Red
}

# ============================================================================
# 2. POSTGRESQL - BASE DE DATOS APPROVALS
# ============================================================================
Write-Host "`n[2/7] Restaurando PostgreSQL - Base de Datos Approvals..." -ForegroundColor Blue
Show-Progress "PostgreSQL Approvals" "Restaurando base de datos de approvals..." 28

if ($postgresApprovals) {
    try {
        Write-Host "   Creando base de datos approvals_db..." -ForegroundColor Cyan
        docker exec ticketing-postgres psql -U admin -c "DROP DATABASE IF EXISTS approvals_db;" 2>$null | Out-Null
        docker exec ticketing-postgres psql -U admin -c "CREATE DATABASE approvals_db;" 2>$null | Out-Null
        
        Write-Host "   Restaurando desde backup..." -ForegroundColor Cyan
        Get-Content $postgresApprovals.FullName | docker exec -i ticketing-postgres psql -U admin -d approvals_db 2>$null | Out-Null
        
        # Verificar restauracion
        $approvalCount = docker exec ticketing-postgres psql -U admin -d approvals_db -t -c 'SELECT COUNT(*) FROM "Approval";' 2>$null
        
        Write-Host "   OK PostgreSQL approvals restaurado exitosamente" -ForegroundColor Green
        if ($approvalCount) {
            Write-Host "     - Aprobaciones: $($approvalCount.Trim())" -ForegroundColor White
        }
        
    } catch {
        Write-Host "   ERROR restaurando PostgreSQL approvals: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   WARN Backup de approvals no encontrado, omitiendo..." -ForegroundColor Yellow
}

# ============================================================================
# 3. MONGODB - USUARIOS
# ============================================================================
Write-Host "`n[3/7] Restaurando MongoDB - Usuarios..." -ForegroundColor Blue
Show-Progress "MongoDB Users" "Restaurando usuarios..." 42

if ($mongoUsers) {
    try {
        Write-Host "   Limpiando coleccion de usuarios..." -ForegroundColor Cyan
        docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.users.deleteMany({})' 2>$null | Out-Null
        
        Write-Host "   Restaurando usuarios..." -ForegroundColor Cyan
        docker cp $mongoUsers.FullName ticketing-mongodb:/tmp/users_restore.json 2>$null | Out-Null
        docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/users_restore.json 2>$null | Out-Null
        
        # Verificar restauracion
        $userCount = docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.users.countDocuments()' 2>$null
        
        Write-Host "   OK MongoDB usuarios restaurado exitosamente" -ForegroundColor Green
        if ($userCount) {
            Write-Host "     - Usuarios: $($userCount.Trim())" -ForegroundColor White
        }
        
    } catch {
        Write-Host "   ERROR restaurando usuarios: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   WARN Backup de usuarios no encontrado, omitiendo..." -ForegroundColor Yellow
}

# ============================================================================
# 4. MONGODB - FESTIVAL SERVICES
# ============================================================================
Write-Host "`n[4/7] Restaurando MongoDB - Festival Services..." -ForegroundColor Blue
Show-Progress "MongoDB Festival Services" "Restaurando servicios del festival..." 56

if ($mongoFestivalDump) {
    try {
        Write-Host "   Copiando dump al contenedor..." -ForegroundColor Cyan
        docker cp $mongoFestivalDump.FullName ticketing-mongodb:/tmp/ 2>$null | Out-Null
        
        Write-Host "   Extrayendo dump..." -ForegroundColor Cyan
        docker exec ticketing-mongodb tar -xzf "/tmp/$($mongoFestivalDump.Name)" -C /tmp/ 2>$null | Out-Null
        
        Write-Host "   Restaurando base de datos festival_services..." -ForegroundColor Cyan
        docker exec ticketing-mongodb mongorestore --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services /tmp/festival_services/ --drop 2>$null | Out-Null
        
        # Verificar restauracion
        $collections = @("travels", "restaurants", "products", "bookings", "reservations", "orders", "carts")
        Write-Host "   OK MongoDB festival_services restaurado exitosamente" -ForegroundColor Green
        
        foreach ($collection in $collections) {
            try {
                $count = docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval "use festival_services; db.$collection.countDocuments()" 2>$null
                if ($count -and $count.Trim() -ne "0") {
                    Write-Host "     - $collection : $($count.Trim())" -ForegroundColor White
                }
            } catch {
                # Silenciar errores de conteo
            }
        }
        
    } catch {
        Write-Host "   ERROR restaurando festival_services: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   WARN Backup de festival_services no encontrado, omitiendo..." -ForegroundColor Yellow
}

# ============================================================================
# 5. PRISMA SCHEMAS
# ============================================================================
Write-Host "`n[5/7] Restaurando Prisma Schemas..." -ForegroundColor Blue
Show-Progress "Prisma Schemas" "Restaurando esquemas de base de datos..." 70

# Restaurar Schema Admin
if ($prismaAdmin) {
    try {
        $adminSchemaPath = Join-Path $scriptPath "..\..\backend\admin\prisma\schema.prisma"
        Write-Host "   Restaurando schema Admin..." -ForegroundColor Cyan
        
        # Hacer backup del schema actual si existe
        if (Test-Path $adminSchemaPath) {
            $backupSchemaName = "prisma_admin_schema_backup_$timestamp.prisma"
            $backupSchemaPath = Join-Path $backupPath $backupSchemaName
            Copy-Item $adminSchemaPath $backupSchemaPath -Force
            Write-Host "     Backup del schema actual guardado en: backups\$BackupFolder\$backupSchemaName" -ForegroundColor Yellow
        }
        
        # Copiar nuevo schema
        Copy-Item $prismaAdmin.FullName $adminSchemaPath -Force
        Write-Host "   OK Schema Admin restaurado" -ForegroundColor Green
        
        # Generar cliente Prisma
        Push-Location (Join-Path $scriptPath "..\..\backend\admin")
        Write-Host "   Generando cliente Prisma Admin..." -ForegroundColor Cyan
        npx prisma generate 2>$null | Out-Null
        Write-Host "   OK Cliente Prisma Admin generado" -ForegroundColor Green
        Pop-Location
        
    } catch {
        Write-Host "   ERROR restaurando schema Admin: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   WARN Schema Admin no encontrado, omitiendo..." -ForegroundColor Yellow
}

# Restaurar Schema Services
if ($prismaServices) {
    try {
        $servicesSchemaPath = Join-Path $scriptPath "..\..\backend\services\festival-services\prisma\schema.prisma"
        Write-Host "   Restaurando schema Festival Services..." -ForegroundColor Cyan
        
        # Hacer backup del schema actual si existe
        if (Test-Path $servicesSchemaPath) {
            $backupSchemaName = "prisma_services_schema_backup_$timestamp.prisma"
            $backupSchemaPath = Join-Path $backupPath $backupSchemaName
            Copy-Item $servicesSchemaPath $backupSchemaPath -Force
            Write-Host "     Backup del schema actual guardado en: backups\$BackupFolder\$backupSchemaName" -ForegroundColor Yellow
        }
        
        # Copiar nuevo schema
        Copy-Item $prismaServices.FullName $servicesSchemaPath -Force
        Write-Host "   OK Schema Festival Services restaurado" -ForegroundColor Green
        
        # Generar cliente Prisma
        Push-Location (Join-Path $scriptPath "..\..\backend\services\festival-services")
        Write-Host "   Generando cliente Prisma Services..." -ForegroundColor Cyan
        npx prisma generate 2>$null | Out-Null
        Write-Host "   OK Cliente Prisma Services generado" -ForegroundColor Green
        Pop-Location
        
    } catch {
        Write-Host "   ERROR restaurando schema Services: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   WARN Schema Services no encontrado, omitiendo..." -ForegroundColor Yellow
}

# ============================================================================
# 6. CONFIGURACIONES (OPCIONAL)
# ============================================================================
Write-Host "`n[6/7] Restaurando Configuraciones..." -ForegroundColor Blue
Show-Progress "System Configs" "Restaurando configuraciones..." 84

if ($RestoreConfigs) {
    Write-Host "   Restaurando archivos de configuracion..." -ForegroundColor Cyan
    
    $configFiles = $backupFiles | Where-Object { $_.Name -like "config_*" }
    
    foreach ($configFile in $configFiles) {
        try {
            $configName = $configFile.Name -replace "config_", "" -replace "_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.", "."
            
            $targetPath = switch -Regex ($configName) {
                "admin_env" { Join-Path $scriptPath "..\..\backend\admin\.env" }
                "services_env" { Join-Path $scriptPath "..\..\backend\services\festival-services\.env" }
                "user_service_env" { Join-Path $scriptPath "..\..\backend\user-service\.env" }
                "docker_compose" { Join-Path $scriptPath "..\..\docker\docker-compose.yml" }
                "docker_env" { Join-Path $scriptPath "..\..\docker\.env" }
                default { $null }
            }
            
            if ($targetPath) {
                # Hacer backup del archivo actual
                if (Test-Path $targetPath) {
                    $configBackupName = "config_backup_$($configFile.BaseName)_$timestamp.txt"
                    $configBackupPath = Join-Path $backupPath $configBackupName
                    Copy-Item $targetPath $configBackupPath -Force
                    Write-Host "       Backup guardado en: backups\$BackupFolder\$configBackupName" -ForegroundColor Gray
                }
                
                Copy-Item $configFile.FullName $targetPath -Force
                Write-Host "     - $configName : OK" -ForegroundColor White
            }
            
        } catch {
            Write-Host "     - $($configFile.Name) : ERROR" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   WARN Restauracion de configuraciones omitida (usar -RestoreConfigs para incluir)" -ForegroundColor Yellow
}

# ============================================================================
# 7. VERIFICACION FINAL
# ============================================================================
Write-Host "`n[7/7] Verificacion Final..." -ForegroundColor Blue
Show-Progress "Final Verification" "Verificando restauracion completa..." 100

Write-Host "`nVerificando restauracion..." -ForegroundColor Cyan

# Verificar PostgreSQL
try {
    $pgTables = docker exec ticketing-postgres psql -U admin -d ticketing -t -c "\dt" 2>$null
    if ($pgTables) {
        Write-Host "   OK PostgreSQL principal: Operativo" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERROR PostgreSQL principal: Error" -ForegroundColor Red
}

# Verificar MongoDB
try {
    $mongoStatus = docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --eval "db.runCommand('ping')" --quiet 2>$null
    if ($mongoStatus) {
        Write-Host "   OK MongoDB: Operativo" -ForegroundColor Green
    }
} catch {
    Write-Host "   ERROR MongoDB: Error" -ForegroundColor Red
}

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "                   RESTAURACION COMPLETADA                          " -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green

Write-Host "`nResumen de la Restauracion:" -ForegroundColor Yellow
Write-Host "   Backup utilizado: $BackupFolder" -ForegroundColor White
Write-Host "   PostgreSQL: $(if ($postgresMain) { 'Restaurado' } else { 'Omitido' })" -ForegroundColor White
Write-Host "   Approvals DB: $(if ($postgresApprovals) { 'Restaurado' } else { 'Omitido' })" -ForegroundColor White
Write-Host "   MongoDB: $(if ($mongoUsers -or $mongoFestivalDump) { 'Restaurado' } else { 'Omitido' })" -ForegroundColor White
Write-Host "   Prisma Schemas: $(if ($prismaAdmin -or $prismaServices) { 'Restaurado' } else { 'Omitido' })" -ForegroundColor White
Write-Host "   Configuraciones: $(if ($RestoreConfigs) { 'Restaurado' } else { 'Omitido' })" -ForegroundColor White

Write-Host "`nSiguientes pasos:" -ForegroundColor Cyan
Write-Host "   1. Reiniciar los servicios backend:" -ForegroundColor White
Write-Host "      cd backend\admin && npm run dev" -ForegroundColor Gray
Write-Host "      cd backend\services\festival-services && npm run dev" -ForegroundColor Gray
Write-Host "      cd backend\user-service && npm run dev" -ForegroundColor Gray
Write-Host "   2. Verificar que los endpoints funcionan:" -ForegroundColor White
Write-Host "      curl http://localhost:3003/api/events/public" -ForegroundColor Gray
Write-Host "      curl http://localhost:3004/api/travel" -ForegroundColor Gray
Write-Host "   3. Revisar logs de los servicios para confirmar funcionamiento" -ForegroundColor White

Write-Host "`nRestauracion completa finalizada exitosamente!" -ForegroundColor Green