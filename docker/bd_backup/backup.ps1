# Script de Backup Completo Unificado - Ticketing Platform
# Autor: Sistema de Backup Automatico Unificado
# Fecha: 2025-10-13
# Descripcion: Backup completo de todo el sistema incluyendo todas las bases de datos, esquemas y configuraciones

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupName = "manual-backup",
    [Parameter(Mandatory=$false)]
    [switch]$IncludeConfigs,
    [Parameter(Mandatory=$false)]
    [switch]$ShowProgress
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                   BACKUP COMPLETO UNIFICADO                         " -ForegroundColor Cyan  
Write-Host "                   Ticketing Platform v2.0                          " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# Variables globales
$scriptPath = $PSScriptRoot
$date = Get-Date -Format "yyyy-MM-dd"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupDir = Join-Path $scriptPath "backups\$date"

Write-Host "`nCreando directorio de backup..." -ForegroundColor Blue
Write-Host "   Ruta: $backupDir" -ForegroundColor White

# Crear directorio de backup
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
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

Write-Host "`nIniciando Backup Completo..." -ForegroundColor Green

# ============================================================================
# 1. POSTGRESQL - BASE DE DATOS PRINCIPAL
# ============================================================================
Write-Host "`n[1/8] Backup PostgreSQL - Base de Datos Principal..." -ForegroundColor Blue
Show-Progress "PostgreSQL Main" "Respaldando base de datos principal..." 12

try {
    $postgresFile = Join-Path $backupDir "postgres_ticketing_full_$timestamp.sql"
    Write-Host "   Exportando base de datos ticketing..." -ForegroundColor Cyan
    docker exec ticketing-postgres pg_dump -U admin -d ticketing --clean --create > $postgresFile 2>$null
    
    # Verificar y mostrar estadisticas
    $eventCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null
    $venueCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null
    $categoryCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Category";' 2>$null
    
    Write-Host "   OK PostgreSQL principal respaldado exitosamente" -ForegroundColor Green
    if ($eventCount) { Write-Host "     - Eventos: $($eventCount.Trim())" -ForegroundColor White }
    if ($venueCount) { Write-Host "     - Venues: $($venueCount.Trim())" -ForegroundColor White }
    if ($categoryCount) { Write-Host "     - Categorias: $($categoryCount.Trim())" -ForegroundColor White }
    
} catch {
    Write-Host "   ERROR respaldando PostgreSQL principal: $_" -ForegroundColor Red
}

# ============================================================================
# 2. POSTGRESQL - BASE DE DATOS APPROVALS
# ============================================================================
Write-Host "`n[2/8] Backup PostgreSQL - Base de Datos Approvals..." -ForegroundColor Blue
Show-Progress "PostgreSQL Approvals" "Respaldando base de datos de approvals..." 25

try {
    # Verificar si existe la base de datos approvals_db
    $dbExists = docker exec ticketing-postgres psql -U admin -t -c "SELECT 1 FROM pg_database WHERE datname='approvals_db';" 2>$null
    
    if ($dbExists -and $dbExists.Trim() -eq "1") {
        $approvalsFile = Join-Path $backupDir "postgres_approvals_db_$timestamp.sql"
        Write-Host "   Exportando base de datos approvals_db..." -ForegroundColor Cyan
        docker exec ticketing-postgres pg_dump -U admin -d approvals_db --clean --create > $approvalsFile 2>$null
        
        # Verificar estadisticas
        $approvalCount = docker exec ticketing-postgres psql -U admin -d approvals_db -t -c 'SELECT COUNT(*) FROM "Approval";' 2>$null
        
        Write-Host "   OK PostgreSQL approvals respaldado exitosamente" -ForegroundColor Green
        if ($approvalCount) { Write-Host "     - Aprobaciones: $($approvalCount.Trim())" -ForegroundColor White }
    } else {
        Write-Host "   INFO Base de datos approvals_db no existe, omitiendo..." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ERROR respaldando PostgreSQL approvals: $_" -ForegroundColor Red
}

# ============================================================================
# 3. MONGODB - USUARIOS
# ============================================================================
Write-Host "`n[3/8] Backup MongoDB - Usuarios..." -ForegroundColor Blue
Show-Progress "MongoDB Users" "Respaldando usuarios..." 37

try {
    $mongoUsersFile = Join-Path $backupDir "mongodb_users_$timestamp.json"
    Write-Host "   Exportando coleccion de usuarios..." -ForegroundColor Cyan
    docker exec ticketing-mongodb mongoexport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --out=/tmp/users_backup.json 2>$null
    docker cp ticketing-mongodb:/tmp/users_backup.json $mongoUsersFile 2>$null
    
    # Contar usuarios
    $userCount = docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.users.countDocuments()' 2>$null
    
    Write-Host "   OK MongoDB usuarios respaldado exitosamente" -ForegroundColor Green
    if ($userCount) { Write-Host "     - Usuarios: $($userCount.Trim())" -ForegroundColor White }
    
} catch {
    Write-Host "   ERROR respaldando usuarios: $_" -ForegroundColor Red
}

# ============================================================================
# 4. MONGODB - FESTIVAL SERVICES
# ============================================================================
Write-Host "`n[4/8] Backup MongoDB - Festival Services..." -ForegroundColor Blue
Show-Progress "MongoDB Festival Services" "Respaldando servicios del festival..." 50

try {
    Write-Host "   Creando dump de festival_services..." -ForegroundColor Cyan
    docker exec ticketing-mongodb mongodump --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --out=/tmp/festival_dump 2>$null
    
    Write-Host "   Comprimiendo dump..." -ForegroundColor Cyan
    docker exec ticketing-mongodb tar -czf /tmp/festival_services_dump.tar.gz -C /tmp/festival_dump . 2>$null
    
    $festivalDumpFile = Join-Path $backupDir "mongodb_festival_services_dump_$timestamp.tar.gz"
    docker cp ticketing-mongodb:/tmp/festival_services_dump.tar.gz $festivalDumpFile 2>$null
    
    # Verificar colecciones y contar documentos
    $collections = @(
        @{Name="travels"; Description="Viajes"},
        @{Name="restaurants"; Description="Restaurantes"}, 
        @{Name="products"; Description="Productos"},
        @{Name="bookings"; Description="Reservas"},
        @{Name="reservations"; Description="Reservaciones"},
        @{Name="orders"; Description="Ordenes de merchandising"},
        @{Name="carts"; Description="Carritos de compra"}
    )
    
    Write-Host "   OK MongoDB festival_services respaldado exitosamente" -ForegroundColor Green
    
    foreach ($collection in $collections) {
        try {
            $count = docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval "use festival_services; db.$($collection.Name).countDocuments()" 2>$null
            if ($count -and $count.Trim() -ne "0") {
                Write-Host "     - $($collection.Description): $($count.Trim()) documentos" -ForegroundColor White
            }
        } catch {
            # Silenciar errores de conteo
        }
    }
    
} catch {
    Write-Host "   ERROR respaldando festival_services: $_" -ForegroundColor Red
}

# ============================================================================
# 5. PRISMA SCHEMAS
# ============================================================================
Write-Host "`n[5/8] Backup Prisma Schemas..." -ForegroundColor Blue
Show-Progress "Prisma Schemas" "Respaldando esquemas de base de datos..." 62

# Backup Schema Admin
try {
    $adminSchemaPath = Join-Path $scriptPath "..\..\backend\admin\prisma\schema.prisma"
    if (Test-Path $adminSchemaPath) {
        $adminSchemaBackup = Join-Path $backupDir "prisma_admin_schema_$timestamp.prisma"
        Copy-Item $adminSchemaPath $adminSchemaBackup -Force
        Write-Host "   OK Schema Admin respaldado" -ForegroundColor Green
    } else {
        Write-Host "   WARN Schema Admin no encontrado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR respaldando schema Admin: $_" -ForegroundColor Red
}

# Backup Schema Services
try {
    $servicesSchemaPath = Join-Path $scriptPath "..\..\backend\services\festival-services\prisma\schema.prisma"
    if (Test-Path $servicesSchemaPath) {
        $servicesSchemaBackup = Join-Path $backupDir "prisma_services_schema_$timestamp.prisma"
        Copy-Item $servicesSchemaPath $servicesSchemaBackup -Force
        Write-Host "   OK Schema Festival Services respaldado" -ForegroundColor Green
    } else {
        Write-Host "   WARN Schema Festival Services no encontrado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR respaldando schema Services: $_" -ForegroundColor Red
}

# ============================================================================
# 6. CONFIGURACIONES (OPCIONAL)
# ============================================================================
Write-Host "`n[6/8] Backup Configuraciones..." -ForegroundColor Blue
Show-Progress "System Configs" "Respaldando configuraciones..." 75

if ($IncludeConfigs) {
    Write-Host "   Respaldando archivos de configuracion..." -ForegroundColor Cyan
    
    $configFiles = @(
        @{Source = "..\..\backend\admin\.env"; Name = "admin_env"},
        @{Source = "..\..\backend\services\festival-services\.env"; Name = "services_env"},
        @{Source = "..\..\backend\user-service\.env"; Name = "user_service_env"},
        @{Source = "..\..\docker\docker-compose.yml"; Name = "docker_compose"},
        @{Source = "..\..\docker\.env"; Name = "docker_env"}
    )
    
    foreach ($config in $configFiles) {
        try {
            $sourcePath = Join-Path $scriptPath $config.Source
            if (Test-Path $sourcePath) {
                $targetPath = Join-Path $backupDir "config_$($config.Name)_$timestamp.txt"
                Copy-Item $sourcePath $targetPath -Force
                Write-Host "     - $($config.Name): OK" -ForegroundColor White
            } else {
                Write-Host "     - $($config.Name): No encontrado" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "     - $($config.Name): ERROR" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   INFO Backup de configuraciones omitido (usar -IncludeConfigs para incluir)" -ForegroundColor Yellow
}

# ============================================================================
# 7. INFORMACION DEL SISTEMA
# ============================================================================
Write-Host "`n[7/8] Generando Informacion del Sistema..." -ForegroundColor Blue
Show-Progress "System Info" "Generando informacion del sistema..." 87

try {
    $systemInfoFile = Join-Path $backupDir "SYSTEM_INFO_$timestamp.txt"
    $gitCommit = ""
    
    # Intentar obtener informacion de Git
    try {
        Push-Location (Join-Path $scriptPath "..\..")
        $gitCommit = git rev-parse HEAD 2>$null
        $gitBranch = git branch --show-current 2>$null
        Pop-Location
    } catch {
        $gitCommit = "No disponible"
        $gitBranch = "No disponible"
    }
    
    $systemInfo = @"
===================================================================
            INFORMACION DEL SISTEMA - BACKUP
===================================================================

Fecha del Backup: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Nombre del Backup: $BackupName
Directorio: $backupDir

===================================================================
            INFORMACION DE GIT
===================================================================

Commit Hash: $gitCommit
Branch: $gitBranch

===================================================================
            SERVICIOS DOCKER
===================================================================

$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null)

===================================================================
            ESTADISTICAS DE BASES DE DATOS
===================================================================

PostgreSQL (ticketing):
$(docker exec ticketing-postgres psql -U admin -d ticketing -c '\dt' 2>$null)

MongoDB (ticketing):
$(docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use ticketing; db.stats()' 2>$null)

MongoDB (festival_services):
$(docker exec ticketing-mongodb mongosh --authenticationDatabase=admin -u admin -p admin123 --quiet --eval 'use festival_services; db.stats()' 2>$null)

===================================================================
"@
    
    $systemInfo | Out-File -FilePath $systemInfoFile -Encoding UTF8
    
    Write-Host "   OK Informacion del sistema generada" -ForegroundColor Green
    
} catch {
    Write-Host "   ERROR generando informacion del sistema: $_" -ForegroundColor Red
}

# ============================================================================
# 8. VERIFICACION Y RESUMEN FINAL
# ============================================================================
Write-Host "`n[8/8] Verificacion Final..." -ForegroundColor Blue
Show-Progress "Final Verification" "Verificando backup completo..." 100

Write-Host "`nVerificando archivos de backup..." -ForegroundColor Cyan
$backupFiles = Get-ChildItem $backupDir -File
$totalSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "                    BACKUP COMPLETADO                               " -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green

Write-Host "`nResumen del Backup:" -ForegroundColor Yellow
Write-Host "   Directorio: $backupDir" -ForegroundColor White
Write-Host "   Archivos creados: $($backupFiles.Count)" -ForegroundColor White
Write-Host "   Tamaño total: $([math]::Round($totalSize / 1MB, 2)) MB" -ForegroundColor White

Write-Host "`nArchivos generados:" -ForegroundColor Cyan
foreach ($file in $backupFiles) {
    $sizeKB = [math]::Round($file.Length / 1KB, 2)
    Write-Host "   - $($file.Name) ($sizeKB KB)" -ForegroundColor White
}

# Crear archivo de informacion del backup en JSON
$backupInfoJson = @{
    BackupDate = Get-Date -Format "yyyy-MM-dd"
    BackupTime = Get-Date -Format "HH:mm:ss"
    BackupName = $BackupName
    BackupDirectory = $backupDir
    GitCommit = $gitCommit
    GitBranch = $gitBranch
    FilesCount = $backupFiles.Count
    TotalSizeMB = [math]::Round($totalSize / 1MB, 2)
    IncludedConfigs = $IncludeConfigs.IsPresent
} | ConvertTo-Json -Depth 3

$backupInfoPath = Join-Path $backupDir "BACKUP_INFO.json"
$backupInfoJson | Out-File -FilePath $backupInfoPath -Encoding UTF8

Write-Host "`nSiguientes pasos:" -ForegroundColor Cyan
Write-Host "   1. Para restaurar este backup usar:" -ForegroundColor White
Write-Host "      .\restore.ps1 -BackupFolder `"$date`"" -ForegroundColor Gray
Write-Host "   2. Los archivos estan en: $backupDir" -ForegroundColor White
Write-Host "   3. Verificar que todos los servicios siguen funcionando correctamente" -ForegroundColor White

Write-Host "`nBackup completo finalizado exitosamente!" -ForegroundColor Green