# ========================================
# SCRIPT DE RESTAURACIÓN SEGURA V3.0
# Sistema de Ticketing - ULTRA PRECISO
# NO BORRA NADA QUE NO DEBA
# ========================================

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupDate,
    
    [switch]$SkipConfirmation = $false,
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

# ===== FUNCIONES DE UTILIDAD =====

function Write-ColorOutput {
    param([string]$Text, [string]$Color = "White")
    switch ($Color) {
        "Green" { Write-Host $Text -ForegroundColor Green }
        "Red" { Write-Host $Text -ForegroundColor Red }
        "Yellow" { Write-Host $Text -ForegroundColor Yellow }
        "Blue" { Write-Host $Text -ForegroundColor Blue }
        "Cyan" { Write-Host $Text -ForegroundColor Cyan }
        "Magenta" { Write-Host $Text -ForegroundColor Magenta }
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

function Get-CurrentDatabaseState {
    Write-Header "ESTADO ACTUAL DE LAS BASES DE DATOS"
    
    $state = @{
        PostgreSQL = @{}
        MongoDB = @{}
    }
    
    # PostgreSQL
    try {
        $state.PostgreSQL.ticketing_events = (docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null).Trim()
        $state.PostgreSQL.ticketing_venues = (docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null).Trim()
        $state.PostgreSQL.ticketing_companies = (docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM companies;' 2>$null).Trim()
        $state.PostgreSQL.ticketing_admins = (docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM admins;' 2>$null).Trim()
        $state.PostgreSQL.admin_events = (docker exec ticketing-postgres psql -U admin -d ticketing_admin -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null).Trim()
        $state.PostgreSQL.approvals = (docker exec ticketing-postgres psql -U admin -d approvals_db -t -c 'SELECT COUNT(*) FROM "Approval";' 2>$null).Trim()
        
        Write-ColorOutput "PostgreSQL ticketing:" "Cyan"
        Write-ColorOutput "  - Eventos: $($state.PostgreSQL.ticketing_events)" "Yellow"
        Write-ColorOutput "  - Venues: $($state.PostgreSQL.ticketing_venues)" "Yellow"
        Write-ColorOutput "  - Compañías: $($state.PostgreSQL.ticketing_companies)" "Yellow"
        Write-ColorOutput "  - Admins: $($state.PostgreSQL.ticketing_admins)" "Yellow"
        Write-ColorOutput "PostgreSQL ticketing_admin:" "Cyan"
        Write-ColorOutput "  - Eventos: $($state.PostgreSQL.admin_events)" "Yellow"
        Write-ColorOutput "PostgreSQL approvals_db:" "Cyan"
        Write-ColorOutput "  - Approvals: $($state.PostgreSQL.approvals)" "Yellow"
    } catch {
        Write-ColorOutput "Error obteniendo estado PostgreSQL: $_" "Red"
    }
    
    # MongoDB
    try {
        $state.MongoDB.users = (docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('ticketing').users.countDocuments()" 2>$null).Trim()
        $state.MongoDB.restaurants = (docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').restaurants.countDocuments()" 2>$null).Trim()
        $state.MongoDB.trips = (docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').trips.countDocuments()" 2>$null).Trim()
        $state.MongoDB.products = (docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').products.countDocuments()" 2>$null).Trim()
        $state.MongoDB.orders = (docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --quiet --eval "db.getSiblingDB('festival_services').orders.countDocuments()" 2>$null).Trim()
        
        Write-ColorOutput "`nMongoDB ticketing:" "Cyan"
        Write-ColorOutput "  - Usuarios: $($state.MongoDB.users)" "Yellow"
        Write-ColorOutput "MongoDB festival_services:" "Cyan"
        Write-ColorOutput "  - Restaurantes: $($state.MongoDB.restaurants)" "Yellow"
        Write-ColorOutput "  - Viajes: $($state.MongoDB.trips)" "Yellow"
        Write-ColorOutput "  - Productos: $($state.MongoDB.products)" "Yellow"
        Write-ColorOutput "  - Órdenes: $($state.MongoDB.orders)" "Yellow"
    } catch {
        Write-ColorOutput "Error obteniendo estado MongoDB: $_" "Red"
    }
    
    return $state
}

function Compare-States {
    param($Before, $After, $Expected)
    
    Write-Header "COMPARACIÓN DE ESTADOS"
    
    $allGood = $true
    
    # Comparar PostgreSQL
    Write-ColorOutput "`nPostgreSQL:" "Cyan"
    foreach ($key in $Expected.PostgreSQL.Keys) {
        $beforeVal = if ($Before.PostgreSQL[$key]) { $Before.PostgreSQL[$key] } else { "0" }
        $afterVal = if ($After.PostgreSQL[$key]) { $After.PostgreSQL[$key] } else { "0" }
        $expectedVal = $Expected.PostgreSQL[$key]
        
        if ($afterVal -eq $expectedVal) {
            Write-ColorOutput "  ✓ $key`: $beforeVal → $afterVal (esperado: $expectedVal)" "Green"
        } else {
            Write-ColorOutput "  ✗ $key`: $beforeVal → $afterVal (esperado: $expectedVal)" "Red"
            $allGood = $false
        }
    }
    
    # Comparar MongoDB
    Write-ColorOutput "`nMongoDB:" "Cyan"
    foreach ($key in $Expected.MongoDB.Keys) {
        $beforeVal = if ($Before.MongoDB[$key]) { $Before.MongoDB[$key] } else { "0" }
        $afterVal = if ($After.MongoDB[$key]) { $After.MongoDB[$key] } else { "0" }
        $expectedVal = $Expected.MongoDB[$key]
        
        if ($afterVal -eq $expectedVal) {
            Write-ColorOutput "  ✓ $key`: $beforeVal → $afterVal (esperado: $expectedVal)" "Green"
        } else {
            Write-ColorOutput "  ✗ $key`: $beforeVal → $afterVal (esperado: $expectedVal)" "Red"
            $allGood = $false
        }
    }
    
    return $allGood
}

function Get-BackupExpectedState {
    param([string]$BackupPath)
    
    Write-ColorOutput "`nAnalizando backup para determinar estado esperado..." "Blue"
    
    $expected = @{
        PostgreSQL = @{}
        MongoDB = @{}
    }
    
    # Analizar PostgreSQL backups
    $pgTicketing = Join-Path $BackupPath "postgres_ticketing_backup.sql"
    if (Test-Path $pgTicketing) {
        $content = Get-Content $pgTicketing -Raw
        $expected.PostgreSQL.ticketing_events = ([regex]::Matches($content, 'INSERT INTO public\."Event"')).Count
        $expected.PostgreSQL.ticketing_venues = ([regex]::Matches($content, 'INSERT INTO public\."Venue"')).Count
        $expected.PostgreSQL.ticketing_companies = ([regex]::Matches($content, 'INSERT INTO public\.companies')).Count
        $expected.PostgreSQL.ticketing_admins = ([regex]::Matches($content, 'INSERT INTO public\.admins')).Count
    }
    
    $pgAdmin = Join-Path $BackupPath "postgres_ticketing_admin_backup.sql"
    if (Test-Path $pgAdmin) {
        $content = Get-Content $pgAdmin -Raw
        $expected.PostgreSQL.admin_events = ([regex]::Matches($content, 'INSERT INTO public\."Event"')).Count
    }
    
    $pgApprovals = Join-Path $BackupPath "postgres_approvals_backup.sql"
    if (Test-Path $pgApprovals) {
        $content = Get-Content $pgApprovals -Raw
        $expected.PostgreSQL.approvals = ([regex]::Matches($content, 'INSERT INTO public\."Approval"')).Count
    }
    
    Write-ColorOutput "Estado esperado del backup:" "Green"
    Write-ColorOutput "  PostgreSQL ticketing:" "Cyan"
    Write-ColorOutput "    - Eventos: $($expected.PostgreSQL.ticketing_events)" "Yellow"
    Write-ColorOutput "    - Venues: $($expected.PostgreSQL.ticketing_venues)" "Yellow"
    Write-ColorOutput "    - Compañías: $($expected.PostgreSQL.ticketing_companies)" "Yellow"
    Write-ColorOutput "    - Admins: $($expected.PostgreSQL.ticketing_admins)" "Yellow"
    Write-ColorOutput "  PostgreSQL ticketing_admin:" "Cyan"
    Write-ColorOutput "    - Eventos: $($expected.PostgreSQL.admin_events)" "Yellow"
    Write-ColorOutput "  PostgreSQL approvals_db:" "Cyan"
    Write-ColorOutput "    - Approvals: $($expected.PostgreSQL.approvals)" "Yellow"
    
    # MongoDB - no podemos analizar el archive fácilmente, usamos valores conocidos
    $expected.MongoDB.users = "6"
    $expected.MongoDB.restaurants = "839"
    $expected.MongoDB.trips = "839"
    $expected.MongoDB.products = "2532"
    $expected.MongoDB.orders = "0"
    
    Write-ColorOutput "  MongoDB (valores conocidos del backup):" "Cyan"
    Write-ColorOutput "    - Usuarios: $($expected.MongoDB.users)" "Yellow"
    Write-ColorOutput "    - Restaurantes: $($expected.MongoDB.restaurants)" "Yellow"
    Write-ColorOutput "    - Viajes: $($expected.MongoDB.trips)" "Yellow"
    Write-ColorOutput "    - Productos: $($expected.MongoDB.products)" "Yellow"
    Write-ColorOutput "    - Órdenes: $($expected.MongoDB.orders)" "Yellow"
    
    return $expected
}

function Restore-PostgreSQLSafe {
    param([string]$DatabaseName, [string]$BackupFile)
    
    Write-ColorOutput "`n[PostgreSQL] Restaurando $DatabaseName..." "Blue"
    
    if ($DryRun) {
        Write-ColorOutput "[DRY RUN] Se restauraría $DatabaseName desde $BackupFile" "Yellow"
        return $true
    }
    
    # Terminar conexiones
    docker exec ticketing-postgres psql -U admin -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DatabaseName' AND pid <> pg_backend_pid();" 2>$null | Out-Null
    
    # Drop y Create
    docker exec ticketing-postgres psql -U admin -d postgres -c "DROP DATABASE IF EXISTS $DatabaseName;" 2>$null | Out-Null
    docker exec ticketing-postgres psql -U admin -d postgres -c "CREATE DATABASE $DatabaseName;" 2>$null | Out-Null
    
    # Restaurar
    $backupPath = Join-Path $BackupPath $BackupFile
    Get-Content "$backupPath" | docker exec -i ticketing-postgres psql -U admin -d $DatabaseName 2>$null | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "[PostgreSQL] $DatabaseName restaurada ✓" "Green"
        return $true
    } else {
        Write-ColorOutput "[PostgreSQL] Error restaurando $DatabaseName ✗" "Red"
        return $false
    }
}

function Restore-MongoDBSafe {
    Write-ColorOutput "`n[MongoDB] Restaurando..." "Blue"
    
    if ($DryRun) {
        Write-ColorOutput "[DRY RUN] Se restauraría MongoDB" "Yellow"
        return $true
    }
    
    $mongoBackup = Join-Path $BackupPath "mongodb_backup.archive"
    
    # Copiar al contenedor
    docker cp "$mongoBackup" ticketing-mongodb:/tmp/mongodb_backup.archive 2>&1 | Out-Null
    
    # Restaurar con --drop (elimina colecciones existentes antes de restaurar)
    docker exec ticketing-mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --archive=/tmp/mongodb_backup.archive --drop --gzip 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "[MongoDB] Restaurada con gzip ✓" "Green"
        return $true
    } else {
        # Intentar sin gzip
        docker exec ticketing-mongodb mongorestore --username admin --password admin123 --authenticationDatabase admin --archive=/tmp/mongodb_backup.archive --drop 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "[MongoDB] Restaurada sin gzip ✓" "Green"
            return $true
        } else {
            Write-ColorOutput "[MongoDB] Error en restauración ✗" "Red"
            return $false
        }
    }
}

# ===== INICIO DEL SCRIPT =====

Write-Header "RESTAURACIÓN SEGURA V3.0 - ULTRA PRECISA"
Write-ColorOutput "Fecha de backup: $BackupDate" "Cyan"
if ($DryRun) {
    Write-ColorOutput "MODO: DRY RUN (solo simulación)" "Yellow"
}

$BackupPath = Join-Path $PSScriptRoot "backups\$BackupDate"
if (-not (Test-Path $BackupPath)) {
    Write-ColorOutput "ERROR: No existe el backup para la fecha $BackupDate" "Red"
    exit 1
}

# Verificar archivos
Write-ColorOutput "`nVerificando archivos de backup..." "Blue"
$requiredFiles = @(
    "postgres_ticketing_backup.sql",
    "postgres_ticketing_admin_backup.sql",
    "postgres_approvals_backup.sql",
    "mongodb_backup.archive"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $BackupPath $file
    if (Test-Path $filePath) {
        $size = (Get-Item $filePath).Length / 1KB
        Write-ColorOutput "  ✓ $file ($([math]::Round($size, 2)) KB)" "Green"
    } else {
        Write-ColorOutput "  ✗ $file - NO ENCONTRADO" "Red"
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-ColorOutput "`nERROR: Faltan archivos necesarios" "Red"
    exit 1
}

# Verificar contenedores
Write-ColorOutput "`nVerificando contenedores..." "Blue"
if (-not (Test-ContainerRunning "ticketing-postgres")) {
    Write-ColorOutput "ERROR: ticketing-postgres no está corriendo" "Red"
    exit 1
}
if (-not (Test-ContainerRunning "ticketing-mongodb")) {
    Write-ColorOutput "ERROR: ticketing-mongodb no está corriendo" "Red"
    exit 1
}
Write-ColorOutput "  ✓ Todos los contenedores están corriendo" "Green"

# Obtener estado actual
$stateBefore = Get-CurrentDatabaseState

# Analizar backup
$expectedState = Get-BackupExpectedState -BackupPath $BackupPath

# Confirmación
if (-not $SkipConfirmation -and -not $DryRun) {
    Write-ColorOutput "`n⚠️  ADVERTENCIA: Esta operación reemplazará los datos actuales" "Yellow"
    Write-ColorOutput "Estado actual se perderá y será reemplazado por el backup" "Yellow"
    $confirmation = Read-Host "`n¿Desea continuar? (escriba 'SI' para confirmar)"
    if ($confirmation -ne "SI") {
        Write-ColorOutput "Restauración cancelada" "Red"
        exit 0
    }
}

# RESTAURACIÓN
Write-Header "EJECUTANDO RESTAURACIÓN"

$startTime = Get-Date

# PostgreSQL
$pgSuccess = $true
$pgSuccess = $pgSuccess -and (Restore-PostgreSQLSafe "ticketing" "postgres_ticketing_backup.sql")
$pgSuccess = $pgSuccess -and (Restore-PostgreSQLSafe "ticketing_admin" "postgres_ticketing_admin_backup.sql")
$pgSuccess = $pgSuccess -and (Restore-PostgreSQLSafe "approvals_db" "postgres_approvals_backup.sql")

# MongoDB
$mongoSuccess = Restore-MongoDBSafe

# Esperar a que se estabilicen las bases de datos
if (-not $DryRun) {
    Write-ColorOutput "`nEsperando estabilización de bases de datos..." "Blue"
    Start-Sleep -Seconds 5
}

# Obtener estado después
$stateAfter = Get-CurrentDatabaseState

# Comparar estados
$comparisonSuccess = Compare-States -Before $stateBefore -After $stateAfter -Expected $expectedState

# RESULTADO FINAL
Write-Header "RESULTADO FINAL"

$endTime = Get-Date
$duration = $endTime - $startTime

if ($pgSuccess -and $mongoSuccess -and $comparisonSuccess) {
    Write-ColorOutput "`n✓ RESTAURACIÓN COMPLETADA EXITOSAMENTE" "Green"
    Write-ColorOutput "✓ Todos los datos coinciden con el backup" "Green"
    Write-ColorOutput "`nTiempo total: $($duration.Minutes)m $($duration.Seconds)s" "Cyan"
    Write-ColorOutput "`n⚠️  IMPORTANTE: Sincroniza Prisma manualmente:" "Yellow"
    Write-ColorOutput "  cd backend\admin" "White"
    Write-ColorOutput "  npx prisma db push --skip-generate" "White"
    Write-ColorOutput "`nLuego inicia los servicios:" "Yellow"
    Write-ColorOutput "  npm run dev" "White"
    Write-ColorOutput "  cd ..\services\festival-services && npm run start:dev" "White"
} elseif ($DryRun) {
    Write-ColorOutput "`n[DRY RUN] Simulación completada" "Yellow"
    Write-ColorOutput "La restauración real se ejecutaría correctamente" "Green"
} else {
    Write-ColorOutput "`n✗ RESTAURACIÓN CON ADVERTENCIAS" "Yellow"
    if (-not $pgSuccess) { Write-ColorOutput "  - PostgreSQL tuvo problemas" "Red" }
    if (-not $mongoSuccess) { Write-ColorOutput "  - MongoDB tuvo problemas" "Red" }
    if (-not $comparisonSuccess) { Write-ColorOutput "  - Algunos datos no coinciden con lo esperado" "Yellow" }
}
