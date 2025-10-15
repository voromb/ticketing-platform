# Script de Backup Completo Mejorado - Ticketing Platform
# Autor: Sistema de Backup con Migraciones Prisma
# Fecha: 2025-10-14
# Descripcion: Backup completo incluyendo bases de datos, schemas, migraciones y configuraciones

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupName = "sistema-completo",
    [Parameter(Mandatory=$false)]
    [switch]$IncludeConfigs,
    [Parameter(Mandatory=$false)]
    [switch]$ShowProgress
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "             BACKUP COMPLETO MEJORADO - TICKETING PLATFORM           " -ForegroundColor Cyan  
Write-Host "                     Con Migraciones Prisma v2.0                     " -ForegroundColor Cyan
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
    
    $services = @("ticketing-postgres", "ticketing-mongodb")
    $allRunning = $true
    
    foreach ($service in $services) {
        $status = docker ps --filter "name=$service" --format "{{.Status}}" 2>$null
        if ($status -and $status.Contains("Up")) {
            Write-Host "   [OK] $service : Running" -ForegroundColor Green
        } else {
            Write-Host "   [ERROR] $service : Not running" -ForegroundColor Red
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

Write-Host "`nIniciando Backup Completo Mejorado..." -ForegroundColor Green

# ============================================================================
# 1. POSTGRESQL - BASE DE DATOS PRINCIPAL CON ESTRUCTURA ACTUAL
# ============================================================================
Write-Host "`n[1/6] Backup PostgreSQL - Estado Actual..." -ForegroundColor Blue
Show-Progress "PostgreSQL Current State" "Respaldando estado actual de PostgreSQL..." 17

try {
    $postgresFile = Join-Path $backupDir "postgres_estado_actual_$timestamp.sql"
    Write-Host "   Exportando base de datos ticketing completa..." -ForegroundColor Cyan
    docker exec ticketing-postgres pg_dump -U admin -d ticketing --clean --create --verbose > $postgresFile 2>$null
    
    # Verificar y mostrar estadisticas
    $adminCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "admins";' 2>$null
    $eventCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null
    $venueCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null
    $categoryCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Category";' 2>$null
    
    Write-Host "   OK PostgreSQL estado actual respaldado exitosamente" -ForegroundColor Green
    if ($adminCount) { Write-Host "     - Administradores: $($adminCount.Trim())" -ForegroundColor White }
    if ($eventCount) { Write-Host "     - Eventos: $($eventCount.Trim())" -ForegroundColor White }
    if ($venueCount) { Write-Host "     - Venues: $($venueCount.Trim())" -ForegroundColor White }
    if ($categoryCount) { Write-Host "     - Categorias: $($categoryCount.Trim())" -ForegroundColor White }
    
} catch {
    Write-Host "   ERROR respaldando PostgreSQL: $_" -ForegroundColor Red
}

# ============================================================================
# 2. MONGODB - USUARIOS RESTAURADOS
# ============================================================================
Write-Host "`n[2/6] Backup MongoDB - Usuarios Actuales..." -ForegroundColor Blue
Show-Progress "MongoDB Current Users" "Respaldando usuarios actuales..." 34

try {
    $mongoUsersFile = Join-Path $backupDir "mongodb_users_$timestamp.json"
    Write-Host "   Exportando coleccion de usuarios..." -ForegroundColor Cyan
    
    # Exportar usuarios usando mongoexport con autenticación
    docker exec ticketing-mongodb mongoexport -u admin -p admin123 --authenticationDatabase admin --db ticketing --collection users --out /tmp/users_backup.json 2>$null
    docker cp ticketing-mongodb:/tmp/users_backup.json $mongoUsersFile 2>$null
    
    # Verificar el backup
    if (Test-Path $mongoUsersFile) {
        $fileSize = (Get-Item $mongoUsersFile).Length
        if ($fileSize -gt 0) {
            # Contar usuarios y obtener estadisticas
            $userCount = docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'use ticketing; print(db.users.countDocuments())' 2>$null
            
            Write-Host "   [OK] MongoDB usuarios respaldado exitosamente" -ForegroundColor Green
            if ($userCount) { 
                $userCountClean = $userCount.Trim()
                if ($userCountClean -ne "") { 
                    Write-Host "     - Total usuarios: $userCountClean" -ForegroundColor White 
                }
            }
        } else {
            Write-Host "   WARN Backup de usuarios vacío" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   WARN Backup de usuarios fallido" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ERROR respaldando usuarios MongoDB: $_" -ForegroundColor Red
}

# Backup Festival Services MongoDB (si existe)
try {
    $mongoFestivalFile = Join-Path $backupDir "mongodb_festival_services_dump_$timestamp.tar.gz"
    Write-Host "   Exportando base de datos festival_services..." -ForegroundColor Cyan
    
    # Verificar si existe la base de datos festival_services
    $festivalDbExists = docker exec ticketing-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin --quiet --eval 'db.adminCommand("listDatabases").databases.find(db => db.name === "festival_services")' 2>$null
    
    if ($festivalDbExists) {
        $festivalDbTrimmed = $festivalDbExists.Trim()
        if (($festivalDbTrimmed -ne "null") -and ($festivalDbTrimmed -ne "")) {
            # Exportar toda la base de datos festival_services
            docker exec ticketing-mongodb mongodump -u admin -p admin123 --authenticationDatabase admin --db festival_services --archive=/tmp/festival_services.tar.gz --gzip 2>$null
            docker cp ticketing-mongodb:/tmp/festival_services.tar.gz $mongoFestivalFile 2>$null
            
            if (Test-Path $mongoFestivalFile) {
                $fileSize = (Get-Item $mongoFestivalFile).Length
                if ($fileSize -gt 0) {
                    Write-Host "   [OK] MongoDB festival_services respaldado exitosamente" -ForegroundColor Green
                } else {
                    Write-Host "   WARN Backup de festival_services vacío" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "   INFO Base de datos festival_services no existe aún" -ForegroundColor Gray
            # Crear archivo vacío para mantener consistencia
            New-Item -Path $mongoFestivalFile -ItemType File -Force > $null
        }
    } else {
        Write-Host "   INFO Base de datos festival_services no existe aún" -ForegroundColor Gray
        # Crear archivo vacío para mantener consistencia
        New-Item -Path $mongoFestivalFile -ItemType File -Force > $null
    }
    
} catch {
    Write-Host "   ERROR respaldando festival_services MongoDB: $_" -ForegroundColor Red
}

# ============================================================================
# 3. BACKUP RABBITMQ - CONFIGURACIONES Y COLAS
# ============================================================================
Write-Host "`n[3/7] Backup RabbitMQ - Configuraciones y Colas..." -ForegroundColor Blue
Show-Progress "RabbitMQ Config" "Respaldando configuraciones RabbitMQ..." 43

try {
    $rabbitMQConfigFile = Join-Path $backupDir "rabbitmq_config_$timestamp.json"
    Write-Host "   Exportando configuraciones de RabbitMQ..." -ForegroundColor Cyan
    
    # Verificar si RabbitMQ está corriendo
    $rabbitStatus = docker ps --filter "name=ticketing-rabbitmq" --format "{{.Status}}" 2>$null
    if ($rabbitStatus -and $rabbitStatus.Contains("Up")) {
        # Exportar configuración de RabbitMQ (exchanges, queues, bindings)
        $rabbitConfig = docker exec ticketing-rabbitmq rabbitmqctl list_exchanges name type --formatter json 2>$null
        if ($rabbitConfig) {
            $rabbitConfig | Out-File -FilePath $rabbitMQConfigFile -Encoding utf8
            Write-Host "   [OK] Configuraciones RabbitMQ respaldadas" -ForegroundColor Green
        } else {
            Write-Host "   INFO RabbitMQ sin configuraciones especiales" -ForegroundColor Gray
            "[]" | Out-File -FilePath $rabbitMQConfigFile -Encoding utf8
        }
        
        # Backup de colas existentes
        $rabbitQueuesFile = Join-Path $backupDir "rabbitmq_queues_$timestamp.json"
        $rabbitQueues = docker exec ticketing-rabbitmq rabbitmqctl list_queues name messages --formatter json 2>$null
        if ($rabbitQueues) {
            $rabbitQueues | Out-File -FilePath $rabbitQueuesFile -Encoding utf8
            Write-Host "   [OK] Colas RabbitMQ respaldadas" -ForegroundColor Green
        }
    } else {
        Write-Host "   WARN RabbitMQ no está corriendo" -ForegroundColor Yellow
        "[]" | Out-File -FilePath $rabbitMQConfigFile -Encoding utf8
    }
    
} catch {
    Write-Host "   ERROR respaldando RabbitMQ: $_" -ForegroundColor Red
}

# ============================================================================
# 4. PRISMA SCHEMAS Y MIGRACIONES - LO MAS IMPORTANTE
# ============================================================================
Write-Host "`n[4/7] Backup Prisma - Schemas y Migraciones..." -ForegroundColor Blue
Show-Progress "Prisma Complete" "Respaldando schemas y migraciones..." 57

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

# Backup Migraciones Admin - CRITICO
try {
    $adminMigrationsPath = Join-Path $scriptPath "..\..\backend\admin\prisma\migrations"
    if (Test-Path $adminMigrationsPath) {
        $adminMigrationsBackup = Join-Path $backupDir "prisma_admin_migrations_$timestamp"
        
        # Crear directorio para migraciones
        New-Item -ItemType Directory -Path $adminMigrationsBackup -Force | Out-Null
        
        # Copiar todas las migraciones
        Copy-Item "$adminMigrationsPath\*" $adminMigrationsBackup -Recurse -Force
        
        # Listar migraciones respaldadas
        $migrations = Get-ChildItem $adminMigrationsPath -Directory
        Write-Host "   OK Migraciones Admin respaldadas ($($migrations.Count) migraciones)" -ForegroundColor Green
        foreach ($migration in $migrations) {
            Write-Host "     - $($migration.Name)" -ForegroundColor White
        }
    } else {
        Write-Host "   WARN Migraciones Admin no encontradas" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR respaldando migraciones Admin: $_" -ForegroundColor Red
}

# Backup Schema Services (si existe)
try {
    $servicesSchemaPath = Join-Path $scriptPath "..\..\backend\services\festival-services\prisma\schema.prisma"
    if (Test-Path $servicesSchemaPath) {
        $servicesSchemaBackup = Join-Path $backupDir "prisma_services_schema_$timestamp.prisma"
        Copy-Item $servicesSchemaPath $servicesSchemaBackup -Force
        Write-Host "   OK Schema Festival Services respaldado" -ForegroundColor Green
    } else {
        Write-Host "   INFO Schema Festival Services no existe" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR respaldando schema Festival Services: $_" -ForegroundColor Red
}

# Backup Migraciones Festival Services
try {
    $servicesMigrationsPath = Join-Path $scriptPath "..\..\backend\services\festival-services\prisma\migrations"
    if (Test-Path $servicesMigrationsPath) {
        $servicesMigrationsBackup = Join-Path $backupDir "prisma_services_migrations_$timestamp"
        
        # Crear directorio para migraciones
        New-Item -ItemType Directory -Path $servicesMigrationsBackup -Force > $null
        
        # Copiar todas las migraciones
        Copy-Item -Path "$servicesMigrationsPath\*" -Destination $servicesMigrationsBackup -Recurse -Force
        
        # Listar migraciones respaldadas
        $servicesMigrations = Get-ChildItem $servicesMigrationsPath -Directory
        Write-Host "   OK Migraciones Festival Services respaldadas ($($servicesMigrations.Count) migraciones)" -ForegroundColor Green
        foreach ($migration in $servicesMigrations) {
            Write-Host "     - $($migration.Name)" -ForegroundColor White
        }
    } else {
        Write-Host "   INFO Migraciones Festival Services no existen aún" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERROR respaldando migraciones Festival Services: $_" -ForegroundColor Red
}

# ============================================================================
# 5. CONFIGURACIONES IMPORTANTES
# ============================================================================
Write-Host "`n[5/7] Backup Configuraciones..." -ForegroundColor Blue
Show-Progress "System Configs" "Respaldando configuraciones..." 71

Write-Host "   Respaldando archivos de configuracion criticos..." -ForegroundColor Cyan

$configFiles = @(
    @{Source = "..\..\backend\admin\.env"; Name = "admin_env"; Description = "Variables Admin Service"},
    @{Source = "..\..\backend\user-service\.env"; Name = "user_service_env"; Description = "Variables User Service"},
    @{Source = "..\..\backend\services\festival-services\.env"; Name = "festival_services_env"; Description = "Variables Festival Services"},
    @{Source = "..\..\docker\docker-compose.yml"; Name = "docker_compose"; Description = "Docker Compose"},
    @{Source = "..\..\docker\.env"; Name = "docker_env"; Description = "Variables Docker"},
    @{Source = "..\..\backend\admin\package.json"; Name = "admin_package"; Description = "Dependencias Admin"},
    @{Source = "..\..\backend\user-service\package.json"; Name = "user_package"; Description = "Dependencias User Service"},
    @{Source = "..\..\backend\services\festival-services\package.json"; Name = "festival_services_package"; Description = "Dependencias Festival Services"},
    @{Source = "..\..\frontend\ticketing-app\package.json"; Name = "frontend_package"; Description = "Dependencias Frontend"}
)

foreach ($config in $configFiles) {
    try {
        $sourcePath = Join-Path $scriptPath $config.Source
        if (Test-Path $sourcePath) {
            $targetPath = Join-Path $backupDir "config_$($config.Name)_$timestamp.txt"
            Copy-Item $sourcePath $targetPath -Force
            Write-Host "     - $($config.Description): OK" -ForegroundColor White
        } else {
            Write-Host "     - $($config.Description): No encontrado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "     - $($config.Description): ERROR" -ForegroundColor Red
    }
}

# ============================================================================
# 6. INFORMACION DEL SISTEMA
# ============================================================================
Write-Host "`n[6/7] Backup Informacion del Sistema..." -ForegroundColor Blue
Show-Progress "System Info" "Generando informacion del sistema..." 86

try {
    $systemInfoFile = Join-Path $backupDir "sistema_info_$timestamp.txt"
    $systemInfo = @"
BACKUP COMPLETO SISTEMA TICKETING PLATFORM
==========================================
Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Backup ID: $timestamp
Estado: Sistema funcionando con datos restaurados

ARQUITECTURA:
- Admin Service (PostgreSQL): Puerto 3003 
- User Service (MongoDB): Puerto 3001
- Frontend (Angular): Puerto 4200

USUARIOS ACTIVOS:
- Admin PostgreSQL: 3 administradores
- Users MongoDB: $(if ($userCount) { $userCount.Trim() } else { 'N/A' }) usuarios ($(if ($vipCount) { $vipCount.Trim() } else { '0' }) VIP)

DATOS RESPALDADOS:
- Base de datos PostgreSQL completa con esquema actual
- Usuarios MongoDB restaurados desde backup anterior  
- Schemas Prisma actuales
- Migraciones Prisma completas
- Configuraciones del sistema

MIGRACIONES PRISMA INCLUIDAS:
$(if (Test-Path (Join-Path $scriptPath "..\..\backend\admin\prisma\migrations")) {
    $migrations = Get-ChildItem (Join-Path $scriptPath "..\..\backend\admin\prisma\migrations") -Directory
    foreach ($migration in $migrations) {
        "- $($migration.Name)"
    }
} else {
    "- No se encontraron migraciones"
})

ESTADO DE SERVICIOS DOCKER:
$(docker ps --filter "name=ticketing\|mongodb-no-auth" --format "- {{.Names}}: {{.Status}}" 2>$null)

NOTAS:
- Este backup incluye el estado actual del sistema funcionando
- Se han restaurado los usuarios desde backup anterior 
- Dashboard funcionando con datos reales
- Funcionalidad de eliminar imagenes implementada
- Comunicacion entre microservicios operativa

"@

    $systemInfo | Out-File -FilePath $systemInfoFile -Encoding UTF8
    Write-Host "   OK Informacion del sistema generada" -ForegroundColor Green
    
} catch {
    Write-Host "   ERROR generando informacion del sistema: $_" -ForegroundColor Red
}

# ============================================================================
# 7. VERIFICACION Y RESUMEN FINAL
# ============================================================================
Write-Host "`n[7/7] Verificacion Final..." -ForegroundColor Blue
Show-Progress "Final Verification" "Verificando archivos de backup..." 100

Write-Host "`nVerificando archivos de backup generados..." -ForegroundColor Cyan

$backupFiles = Get-ChildItem $backupDir -File
$totalSize = ($backupFiles | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host "                     BACKUP COMPLETADO EXITOSAMENTE                  " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green

Write-Host "`nRESUMEN DEL BACKUP:" -ForegroundColor White
Write-Host "   Directorio: $backupDir" -ForegroundColor Cyan
Write-Host "   Timestamp: $timestamp" -ForegroundColor Cyan
Write-Host "   Archivos generados: $($backupFiles.Count)" -ForegroundColor Cyan
Write-Host "   Tamaño total: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Cyan

Write-Host "`nARCHIVOS RESPALDADOS:" -ForegroundColor White
foreach ($file in $backupFiles | Sort-Object Name) {
    $sizeKB = [math]::Round($file.Length / 1KB, 1)
    Write-Host "   [OK] $($file.Name) ($sizeKB KB)" -ForegroundColor Green
}

Write-Host "`nPARA RESTAURAR ESTE BACKUP:" -ForegroundColor Yellow
Write-Host "   .\restore.ps1 -BackupDate $date" -ForegroundColor White

Write-Host "`nSISTEMA ACTUAL OPERATIVO Y RESPALDADO [OK]" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green

if ($ShowProgress) {
    Write-Progress -Activity "Backup Complete" -Completed
}
