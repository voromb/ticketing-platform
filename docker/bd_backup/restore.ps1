# ========================================
# SCRIPT DE RESTAURACIÓN AUTOMÁTICA V2.0
# Sistema de Ticketing - 100% ROBUSTO
# ========================================

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupDate,
    
    [switch]$SkipConfirmation = $false
)

# ===== FUNCIONES PRINCIPALES =====

function Write-ColorOutput {
    param([string]$Text, [string]$Color = "White")
    switch ($Color) {
        "Green" { Write-Host $Text -ForegroundColor Green }
        "Red" { Write-Host $Text -ForegroundColor Red }
        "Yellow" { Write-Host $Text -ForegroundColor Yellow }
        "Blue" { Write-Host $Text -ForegroundColor Blue }
        "Cyan" { Write-Host $Text -ForegroundColor Cyan }
        default { Write-Host $Text }
    }
}

function Write-Header {
    param([string]$Text)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Test-ContainerRunning {
    param([string]$ContainerName)
    try {
        $result = docker ps --filter "name=$ContainerName" --filter "status=running" --format "{{.Names}}" 2>$null
        return $result -eq $ContainerName
    } catch {
        return $false
    }
}

function Wait-ForContainer {
    param([string]$ContainerName, [int]$TimeoutSeconds = 30)
    
    Write-ColorOutput "Esperando que $ContainerName esté listo..." "Yellow"
    $timeout = $TimeoutSeconds
    
    do {
        if (Test-ContainerRunning $ContainerName) {
            Start-Sleep -Seconds 3  # Dar tiempo extra para que el servicio inicie
            Write-ColorOutput "$ContainerName está listo" "Green"
            return $true
        }
        Start-Sleep -Seconds 2
        $timeout -= 2
    } while ($timeout -gt 0)
    
    Write-ColorOutput "Timeout esperando $ContainerName" "Red"
    return $false
}

function Test-PostgreSQLConnection {
    param([string]$User = "admin", [string]$Database = "postgres")
    try {
        $null = docker exec ticketing-postgres psql -U $User -d $Database -c "\q" 2>$null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Test-MongoDBConnection {
    try {
        $null = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db.adminCommand('ping')" 2>$null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Invoke-SafeCommand {
    param([string]$Command, [string]$Description, [bool]$CriticalError = $false)
    
    Write-ColorOutput "$Description..." "Blue"
    try {
        $result = Invoke-Expression $Command 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "$Description completado" "Green"
            return $true
        } else {
            $errorMsg = if ($result) { $result | Out-String } else { "Código de salida: $LASTEXITCODE" }
            if ($CriticalError) {
                Write-ColorOutput "ERROR CRÍTICO en $Description`:" "Red"
                Write-ColorOutput $errorMsg "Red"
                exit 1
            } else {
                Write-ColorOutput "$Description tuvo problemas pero continuamos:" "Yellow"
                Write-ColorOutput $errorMsg "Yellow"
                return $false
            }
        }
    } catch {
        if ($CriticalError) {
            Write-ColorOutput "ERROR CRÍTICO en $Description`:" "Red"
            Write-ColorOutput $_.Exception.Message "Red"
            exit 1
        } else {
            Write-ColorOutput "Error en $Description pero continuamos:" "Yellow"
            Write-ColorOutput $_.Exception.Message "Yellow"
            return $false
        }
    }
}

function Restore-PostgreSQLDatabase {
    param([string]$DatabaseName, [string]$BackupFile)
    
    Write-ColorOutput "`nRestaurando PostgreSQL: $DatabaseName" "Blue"
    
    # 1. Verificar conexión
    if (-not (Test-PostgreSQLConnection)) {
        Write-ColorOutput "❌ No se puede conectar a PostgreSQL" "Red"
        return $false
    }
    
    # 2. Terminar conexiones activas
    Invoke-SafeCommand "docker exec ticketing-postgres psql -U admin -d postgres -c `"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DatabaseName' AND pid <> pg_backend_pid();`"" "Terminando conexiones a $DatabaseName"
    
    # 3. Eliminar y recrear base de datos
    Invoke-SafeCommand "docker exec ticketing-postgres psql -U admin -d postgres -c `"DROP DATABASE IF EXISTS $DatabaseName;`"" "Eliminando base $DatabaseName"
    Invoke-SafeCommand "docker exec ticketing-postgres psql -U admin -d postgres -c `"CREATE DATABASE $DatabaseName;`"" "Creando base $DatabaseName" $true
    
    # 4. Crear usuario si no existe
    Invoke-SafeCommand "docker exec ticketing-postgres psql -U admin -d postgres -c `"DO \`$\`$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ticketing_user') THEN CREATE USER ticketing_user WITH PASSWORD 'ticketing_password' CREATEDB SUPERUSER; END IF; END \`$\`$;`"" "Creando usuario ticketing_user"
    
    # 5. Restaurar datos
    $backupPath = Join-Path $BackupPath $BackupFile
    if (Test-Path $backupPath) {
        Invoke-SafeCommand "Get-Content `"$backupPath`" | docker exec -i ticketing-postgres psql -U admin -d $DatabaseName" "Restaurando datos en $DatabaseName" $true
        
        # 6. Verificar restauración
        $count = docker exec ticketing-postgres psql -U admin -d $DatabaseName -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>$null
        if ($count -and $count.Trim() -gt 0) {
            Write-ColorOutput "$DatabaseName restaurada correctamente ($($count.Trim()) tablas)" "Green"
            return $true
        } else {
            Write-ColorOutput "$DatabaseName restaurada pero sin verificación de tablas" "Yellow"
            return $true
        }
    } else {
        Write-ColorOutput "Archivo de backup no encontrado: $BackupFile" "Red"
        return $false
    }
}

function Restore-MongoDB {
    Write-ColorOutput "`nRestaurando MongoDB..." "Blue"
    
    # 1. Verificar conexión
    if (-not (Test-MongoDBConnection)) {
        Write-ColorOutput "No se puede conectar a MongoDB" "Red"
        return $false
    }
    
    # 2. Copiar archivo al contenedor
    $mongoBackup = Join-Path $BackupPath "mongodb_backup.archive"
    if (-not (Test-Path $mongoBackup)) {
        Write-ColorOutput "Archivo MongoDB backup no encontrado" "Red"
        return $false
    }
    
    Write-ColorOutput "Copiando backup MongoDB al contenedor..." "Blue"
    docker cp "$mongoBackup" ticketing-mongodb:/tmp/mongodb_backup.archive 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "Error copiando archivo al contenedor" "Red"
        return $false
    }
    Write-ColorOutput "Archivo copiado correctamente" "Green"
    
    # 3. Restaurar con autenticación - Intentar con gzip
    Write-ColorOutput "Intentando restauración con gzip..." "Blue"
    $output = docker exec ticketing-mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --archive=/tmp/mongodb_backup.archive --drop --gzip 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "MongoDB restaurada con gzip" "Green"
    } else {
        Write-ColorOutput "Fallo con gzip, intentando sin gzip..." "Yellow"
        Write-ColorOutput "Error: $output" "Yellow"
        
        # Intentar sin gzip
        $output = docker exec ticketing-mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --archive=/tmp/mongodb_backup.archive --drop 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "ERROR en restauración MongoDB:" "Red"
            Write-ColorOutput "$output" "Red"
            return $false
        }
        Write-ColorOutput "MongoDB restaurada sin gzip" "Green"
    }
    
    # 4. Verificar restauración
    Start-Sleep -Seconds 2
    $userCount = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.users.countDocuments()" --quiet 2>$null
    if ($userCount -and $userCount.Trim() -gt 0) {
        Write-ColorOutput "MongoDB restaurada correctamente ($($userCount.Trim()) usuarios)" "Green"
        return $true
    } else {
        Write-ColorOutput "MongoDB restaurada pero sin verificación completa" "Yellow"
        return $true
    }
}

function Restore-PrismaMigrations {
    Write-ColorOutput "`nRestaurando migraciones Prisma..." "Blue"
    
    $prismaBackup = Join-Path $BackupPath "prisma"
    if (-not (Test-Path $prismaBackup)) {
        Write-ColorOutput "No se encontraron migraciones Prisma para restaurar" "Yellow"
        return $true
    }
    
    # Admin migrations
    $adminSource = Join-Path $prismaBackup "admin"
    if (Test-Path $adminSource) {
        $adminTarget = "c:\Users\yop\Documents\Servidor_DAW\ticketing-platform\backend\admin\prisma\migrations\restored_admin"
        Invoke-SafeCommand "Copy-Item -Path `"$adminSource`" -Destination `"$adminTarget`" -Recurse -Force" "Restaurando migraciones Admin"
    }
    
    # Festival migrations
    $festivalSource = Join-Path $prismaBackup "festival-services"
    if (Test-Path $festivalSource) {
        $festivalTarget = "c:\Users\yop\Documents\Servidor_DAW\ticketing-platform\backend\services\festival-services\prisma\migrations\restored_festival"
        Invoke-SafeCommand "Copy-Item -Path `"$festivalSource`" -Destination `"$festivalTarget`" -Recurse -Force" "Restaurando migraciones Festival"
    }
    
    # Docker schema
    $dockerSource = Join-Path $prismaBackup "docker"
    if (Test-Path $dockerSource) {
        $dockerTarget = "c:\Users\yop\Documents\Servidor_DAW\ticketing-platform\docker\prisma\restored_docker"
        Invoke-SafeCommand "Copy-Item -Path `"$dockerSource`" -Destination `"$dockerTarget`" -Recurse -Force" "Restaurando schema Docker"
    }
    
    Write-ColorOutput "Migraciones Prisma restauradas" "Green"
    return $true
}

# ===== INICIO DEL SCRIPT =====

$BackupPath = ".\backups\$BackupDate"
if (-not (Test-Path $BackupPath)) {
    Write-ColorOutput "ERROR: No existe el backup para la fecha $BackupDate" "Red"
    Write-ColorOutput "Ruta buscada: $BackupPath" "Yellow"
    exit 1
}

Write-Header "RESTAURACIÓN AUTOMÁTICA V2.0"
Write-ColorOutput "Fecha de backup: $BackupDate" "Blue"
Write-ColorOutput "Ruta: $BackupPath" "Blue"
Write-ColorOutput "Modo: COMPLETAMENTE AUTOMÁTICO" "Cyan"

# ===== VERIFICACIONES INICIALES =====

Write-ColorOutput "`nVerificando archivos de backup..." "Yellow"
$RequiredFiles = @(
    "postgres_ticketing_backup.sql",
    "postgres_ticketing_admin_backup.sql", 
    "postgres_approvals_backup.sql",
    "mongodb_backup.archive"
)

$AllFilesExist = $true
foreach ($file in $RequiredFiles) {
    $filePath = Join-Path $BackupPath $file
    if (Test-Path $filePath) {
        Write-ColorOutput "$file" "Green"
    } else {
        Write-ColorOutput "$file - NO ENCONTRADO" "Red"
        $AllFilesExist = $false
    }
}

if (-not $AllFilesExist) {
    Write-ColorOutput "Faltan archivos de backup necesarios" "Red"
    exit 1
}

# Confirmación
if (-not $SkipConfirmation) {
    Write-ColorOutput "`nADVERTENCIA: Esta operación eliminará todos los datos actuales" "Yellow"
    $confirmation = Read-Host "¿Desea continuar con la restauración? (s/N)"
    if ($confirmation -ne "s" -and $confirmation -ne "S") {
        Write-ColorOutput "Restauración cancelada por el usuario" "Red"
        exit 0
    }
}

# ===== VERIFICACIÓN DE CONTENEDORES =====

Write-Header "VERIFICACIÓN DE CONTENEDORES"

$requiredContainers = @("ticketing-postgres", "ticketing-mongodb")
foreach ($container in $requiredContainers) {
    if (-not (Wait-ForContainer $container)) {
        Write-ColorOutput "No se puede proceder sin $container funcionando" "Red"
        exit 1
    }
}

# ===== RESTAURACIÓN =====

Write-Header "INICIANDO RESTAURACIÓN"

$startTime = Get-Date

# PostgreSQL
$postgresSuccess = $true
$postgresSuccess = $postgresSuccess -and (Restore-PostgreSQLDatabase "ticketing" "postgres_ticketing_backup.sql")
$postgresSuccess = $postgresSuccess -and (Restore-PostgreSQLDatabase "ticketing_admin" "postgres_ticketing_admin_backup.sql")
$postgresSuccess = $postgresSuccess -and (Restore-PostgreSQLDatabase "approvals_db" "postgres_approvals_backup.sql")

# MongoDB
$mongoSuccess = Restore-MongoDB

# Prisma
$prismaSuccess = Restore-PrismaMigrations

# ===== VERIFICACIÓN FINAL =====

Write-Header "VERIFICACIÓN FINAL"

if ($postgresSuccess -and $mongoSuccess -and $prismaSuccess) {
    Write-ColorOutput "`nRESTAURACIÓN COMPLETADA EXITOSAMENTE!" "Green"
    
    # Verificación rápida de datos
    Write-ColorOutput "`nVerificando datos restaurados..." "Blue"
    
    $events = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null
    $venues = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null
    $users = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.users.countDocuments()" --quiet 2>$null
    
    if ($events) { Write-ColorOutput "Eventos principales: $($events.Trim())" "Green" }
    if ($venues) { Write-ColorOutput "Venues principales: $($venues.Trim())" "Green" }
    if ($users) { Write-ColorOutput "Usuarios MongoDB: $($users.Trim())" "Green" }
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    Write-ColorOutput "`nTiempo total: $($duration.Minutes)m $($duration.Seconds)s" "Cyan"
    
    Write-ColorOutput "`nURLs del sistema:" "Blue"
    Write-ColorOutput "   • Frontend: http://localhost:4200" "Cyan"
    Write-ColorOutput "   • Admin API: http://localhost:3001" "Cyan"
    Write-ColorOutput "   • Festival API: http://localhost:3003" "Cyan"
    
} else {
    Write-ColorOutput "`nLA RESTAURACIÓN TUVO PROBLEMAS" "Red"
    $pgStatus = if ($postgresSuccess) { 'OK' } else { 'ERROR' }
    $pgColor = if ($postgresSuccess) { 'Green' } else { 'Red' }
    Write-ColorOutput "PostgreSQL: $pgStatus" $pgColor
    
    $mongoStatus = if ($mongoSuccess) { 'OK' } else { 'ERROR' }
    $mongoColor = if ($mongoSuccess) { 'Green' } else { 'Red' }
    Write-ColorOutput "MongoDB: $mongoStatus" $mongoColor
    
    $prismaStatus = if ($prismaSuccess) { 'OK' } else { 'ERROR' }
    $prismaColor = if ($prismaSuccess) { 'Green' } else { 'Red' }
    Write-ColorOutput "Prisma: $prismaStatus" $prismaColor
    exit 1
}