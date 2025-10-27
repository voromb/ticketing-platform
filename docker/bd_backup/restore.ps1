# ========================================
# RESTAURACIÓN SEGURA V4.0
# Ticketing + Festival Services
# Comparación detallada con flechas
# ========================================

[CmdletBinding(SupportsShouldProcess=$true, ConfirmImpact='High')]
param(
    [Parameter(Mandatory=$false)]
    [string]$BackupDate = "",

    [switch]$SkipConfirmation = $false,
    [switch]$DryRun = $false,

    # Credenciales opcionales
    [string]$PostgresUser = "admin",
    [string]$MongoUser = "admin",
    [string]$MongoPass = $env:MONGO_PASS,
    [string]$MongoAuthDB = "admin"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ===== Utilidades generales =====

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
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

# docker disponible
try {
    $null = docker version --format '{{.Server.Version}}' 2>$null
} catch {
    Write-ColorOutput "ERROR: Docker no está disponible." "Red"
    exit 1
}

# PSScriptRoot fallback
if ([string]::IsNullOrWhiteSpace($PSScriptRoot)) {
    $PSScriptRoot = (Get-Location).Path
}

function Test-ContainerRunning {
    param([string]$ContainerName)
    try {
        $running = docker inspect -f '{{.State.Running}}' $ContainerName 2>$null
        return $running -eq 'true'
    } catch {
        return $false
    }
}

# ===== Lectura de estado actual =====

function Get-CurrentDatabaseState {
    Write-Header "ESTADO ACTUAL DE LAS BASES DE DATOS"

    $state = @{
        PostgreSQL = @{}
        MongoDB    = @{}
    }

    # PostgreSQL
    try {
        $state.PostgreSQL.ticketing_events     = (docker exec ticketing-postgres psql -U $PostgresUser -d ticketing       -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null).Trim()
        $state.PostgreSQL.ticketing_venues     = (docker exec ticketing-postgres psql -U $PostgresUser -d ticketing       -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null).Trim()
        $state.PostgreSQL.ticketing_companies  = (docker exec ticketing-postgres psql -U $PostgresUser -d ticketing       -t -c 'SELECT COUNT(*) FROM companies;' 2>$null).Trim()
        $state.PostgreSQL.ticketing_admins     = (docker exec ticketing-postgres psql -U $PostgresUser -d ticketing       -t -c 'SELECT COUNT(*) FROM admins;' 2>$null).Trim()
        $state.PostgreSQL.admin_events         = (docker exec ticketing-postgres psql -U $PostgresUser -d ticketing_admin -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null).Trim()
        $state.PostgreSQL.approvals            = (docker exec ticketing-postgres psql -U $PostgresUser -d approvals_db    -t -c 'SELECT COUNT(*) FROM "Approval";' 2>$null).Trim()

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
        # DB ticketing
        $state.MongoDB.users          = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('ticketing').users.countDocuments()" 2>$null).Trim()
        $state.MongoDB.tickets        = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('ticketing').tickets.countDocuments()" 2>$null).Trim()
        $state.MongoDB.events         = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('ticketing').events.countDocuments()" 2>$null).Trim()
        $state.MongoDB.userfollows    = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('ticketing').userfollows.countDocuments()" 2>$null).Trim()
        $state.MongoDB.likes          = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('ticketing').likes.countDocuments()" 2>$null).Trim()
        $state.MongoDB.eventlikes     = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('ticketing').eventlikes.countDocuments()" 2>$null).Trim()
        $state.MongoDB.eventcomments  = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('ticketing').eventcomments.countDocuments()" 2>$null).Trim()
        # DB festival_services
        $state.MongoDB.restaurants    = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('festival_services').restaurants.countDocuments()" 2>$null).Trim()
        $state.MongoDB.products       = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('festival_services').products.countDocuments()" 2>$null).Trim()
        $state.MongoDB.trips          = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('festival_services').trips.countDocuments()" 2>$null).Trim()
        $state.MongoDB.orders         = (docker exec ticketing-mongodb mongosh --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --quiet --eval "db.getSiblingDB('festival_services').orders.countDocuments()" 2>$null).Trim()

        Write-ColorOutput "`nMongoDB ticketing:" "Cyan"
        Write-ColorOutput "  - users: $($state.MongoDB.users)" "Yellow"
        Write-ColorOutput "  - tickets: $($state.MongoDB.tickets)" "Yellow"
        Write-ColorOutput "  - events: $($state.MongoDB.events)" "Yellow"
        Write-ColorOutput "  - userfollows: $($state.MongoDB.userfollows)" "Yellow"
        Write-ColorOutput "  - likes: $($state.MongoDB.likes)" "Yellow"
        Write-ColorOutput "  - eventlikes: $($state.MongoDB.eventlikes)" "Yellow"
        Write-ColorOutput "  - eventcomments: $($state.MongoDB.eventcomments)" "Yellow"

        Write-ColorOutput "MongoDB festival_services:" "Cyan"
        Write-ColorOutput "  - restaurants: $($state.MongoDB.restaurants)" "Yellow"
        Write-ColorOutput "  - products: $($state.MongoDB.products)" "Yellow"
        Write-ColorOutput "  - trips: $($state.MongoDB.trips)" "Yellow"
        Write-ColorOutput "  - orders: $($state.MongoDB.orders)" "Yellow"
    } catch {
        Write-ColorOutput "Error obteniendo estado MongoDB: $_" "Red"
    }

    return $state
}

# ===== Cálculo de estado esperado desde dumps PostgreSQL =====

function Get-RowCountFromSqlDump {
    param([string]$Path, [string]$TablePattern)

    if (-not (Test-Path $Path)) { return 0 }
    $content = Get-Content -Raw -Path $Path

    # 1) INSERT
    $insertCount = ([regex]::Matches($content, "INSERT\s+INTO\s+$TablePattern\b", "IgnoreCase")).Count

    # 2) COPY: contar líneas de datos entre COPY ... FROM stdin; y \.
    $copyCount = 0
    $copyRegex = [regex]"COPY\s+$TablePattern\b.*?FROM\s+stdin;(?<data>.*?)[\r\n]\\\.[\r\n]"
    foreach ($m in $copyRegex.Matches($content)) {
        $data = $m.Groups['data'].Value
        if ($data) {
            $lines = ($data -split "(\r?\n)") | Where-Object { $_ -and $_ -notmatch '^\s*$' -and $_ -notmatch '^\r?$' }
            $copyCount += $lines.Count
        }
    }
    return ($insertCount + $copyCount)
}

function Get-BackupExpectedState {
    param([string]$BackupPath)

    Write-ColorOutput "`nAnalizando backup para determinar estado esperado de PostgreSQL..." "Blue"

    $expected = @{
        PostgreSQL = @{}
        MongoDB    = @{} # se definirá tras la restauración
    }

    $pgTicketing = Join-Path $BackupPath "postgres_ticketing_backup.sql"
    $pgAdmin     = Join-Path $BackupPath "postgres_ticketing_admin_backup.sql"
    $pgApprovals = Join-Path $BackupPath "postgres_approvals_backup.sql"

    # Tablas de interés
    $expected.PostgreSQL.ticketing_events    = Get-RowCountFromSqlDump -Path $pgTicketing -TablePattern 'public\."Event"'
    $expected.PostgreSQL.ticketing_venues    = Get-RowCountFromSqlDump -Path $pgTicketing -TablePattern 'public\."Venue"'
    $expected.PostgreSQL.ticketing_companies = Get-RowCountFromSqlDump -Path $pgTicketing -TablePattern 'public\.companies'
    $expected.PostgreSQL.ticketing_admins    = Get-RowCountFromSqlDump -Path $pgTicketing -TablePattern 'public\.admins'
    $expected.PostgreSQL.admin_events        = Get-RowCountFromSqlDump -Path $pgAdmin     -TablePattern 'public\."Event"'
    $expected.PostgreSQL.approvals           = Get-RowCountFromSqlDump -Path $pgApprovals -TablePattern 'public\."Approval"'

    Write-ColorOutput "Estado esperado del backup (PostgreSQL):" "Green"
    Write-ColorOutput "  ticketing.Event:    $($expected.PostgreSQL.ticketing_events)" "Yellow"
    Write-ColorOutput "  ticketing.Venue:    $($expected.PostgreSQL.ticketing_venues)" "Yellow"
    Write-ColorOutput "  ticketing.companies:$($expected.PostgreSQL.ticketing_companies)" "Yellow"
    Write-ColorOutput "  ticketing.admins:   $($expected.PostgreSQL.ticketing_admins)" "Yellow"
    Write-ColorOutput "  ticketing_admin.Event: $($expected.PostgreSQL.admin_events)" "Yellow"
    Write-ColorOutput "  approvals_db.Approval: $($expected.PostgreSQL.approvals)" "Yellow"

    return $expected
}

# ===== Comparación de estados =====

function Compare-States {
    param($Before, $After, $Expected)

    Write-Header "COMPARACIÓN DE ESTADOS"

    $allGood = $true

    # PostgreSQL
    Write-ColorOutput "`nPostgreSQL:" "Cyan"
    foreach ($key in $Expected.PostgreSQL.Keys) {
        $beforeVal   = if ($Before.PostgreSQL.ContainsKey($key)) { $Before.PostgreSQL[$key] } else { "N/D" }
        $afterVal    = if ($After.PostgreSQL.ContainsKey($key))  { $After.PostgreSQL[$key] }  else { "N/D" }
        $expectedVal = $Expected.PostgreSQL[$key]

        if ($afterVal -eq $expectedVal.ToString()) {
            Write-ColorOutput "  ✓ $key: $beforeVal → $afterVal (esperado: $expectedVal)" "Green"
        } else {
            Write-ColorOutput "  ✗ $key: $beforeVal → $afterVal (esperado: $expectedVal)" "Red"
            $allGood = $false
        }
    }

    # MongoDB
    Write-ColorOutput "`nMongoDB:" "Cyan"
    foreach ($key in $Expected.MongoDB.Keys) {
        $beforeVal   = if ($Before.MongoDB.ContainsKey($key)) { $Before.MongoDB[$key] } else { "N/D" }
        $afterVal    = if ($After.MongoDB.ContainsKey($key))  { $After.MongoDB[$key] }  else { "N/D" }
        $expectedVal = $Expected.MongoDB[$key]

        if ($afterVal -eq $expectedVal) {
            Write-ColorOutput "  ✓ $key: $beforeVal → $afterVal (esperado: $expectedVal)" "Green"
        } else {
            Write-ColorOutput "  ✗ $key: $beforeVal → $afterVal (esperado: $expectedVal)" "Red"
            $allGood = $false
        }
    }

    return $allGood
}

# ===== Restauración =====

function Restore-PostgreSQLSafe {
    param([string]$DatabaseName, [string]$BackupFile)

    Write-ColorOutput "`n[PostgreSQL] Restaurando $DatabaseName..." "Blue"
    if ($DryRun) { Write-ColorOutput "[DRY RUN] Se restauraría $DatabaseName desde $BackupFile" "Yellow"; return $true }

    $backupPath = Join-Path $BackupPath $BackupFile
    $remote = "/tmp/$BackupFile"

    docker cp "$backupPath" "ticketing-postgres:$remote" | Out-Null

    $cmds = @(
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DatabaseName' AND pid <> pg_backend_pid();",
        "DROP DATABASE IF EXISTS $DatabaseName;",
        "CREATE DATABASE $DatabaseName;"
    )
    foreach ($c in $cmds) {
        docker exec ticketing-postgres psql -U $PostgresUser -d postgres -v ON_ERROR_STOP=1 -c "$c" | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-ColorOutput "[PostgreSQL] Error gestionando $DatabaseName" "Red"; return $false }
    }

    docker exec ticketing-postgres psql -U $PostgresUser -d $DatabaseName -v ON_ERROR_STOP=1 -f $remote | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "[PostgreSQL] Error restaurando $DatabaseName ✗" "Red"
        return $false
    }

    docker exec ticketing-postgres sh -lc "rm -f $remote" | Out-Null
    Write-ColorOutput "[PostgreSQL] $DatabaseName restaurada ✓" "Green"
    return $true
}

function Restore-MongoDBSafe {
    param(
        [string[]]$NsInclude = @("ticketing.*","festival_services.*")
    )

    Write-ColorOutput "`n[MongoDB] Restaurando..." "Blue"
    if ($DryRun) { Write-ColorOutput "[DRY RUN] Se restauraría MongoDB" "Yellow"; return $true }

    if ([string]::IsNullOrWhiteSpace($MongoPass)) {
        Write-ColorOutput "[MongoDB] ERROR: Credencial no establecida. Configure -MongoPass o variable de entorno MONGO_PASS." "Red"
        return $false
    }

    $mongoBackup = Join-Path $BackupPath "mongodb_backup.archive"
    docker cp "$mongoBackup" ticketing-mongodb:/tmp/mongodb_backup.archive | Out-Null

    $nsArgs = ($NsInclude | ForEach-Object { "--nsInclude=`"$_`"" }) -join ' '

    docker exec ticketing-mongodb sh -lc "mongorestore --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --archive=/tmp/mongodb_backup.archive --drop --gzip $nsArgs" | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-ColorOutput "[MongoDB] Restaurada ✓" "Green"; return $true }

    docker exec ticketing-mongodb sh -lc "mongorestore --username $MongoUser --password $MongoPass --authenticationDatabase $MongoAuthDB --archive=/tmp/mongodb_backup.archive --drop $nsArgs" | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-ColorOutput "[MongoDB] Restaurada ✓" "Green"; return $true }

    Write-ColorOutput "[MongoDB] Error en restauración ✗" "Red"
    return $false
}

# ===== Inicio =====

Write-Header "RESTAURACIÓN SEGURA V4.0 - DETALLADA"
Write-ColorOutput "Fecha de backup: $BackupDate" "Cyan"
if ($DryRun) { Write-ColorOutput "MODO: DRY RUN (solo simulación)" "Yellow" }

$BackupPath = Join-Path $PSScriptRoot "backups\$BackupDate"
if (-not (Test-Path $BackupPath)) {
    Write-ColorOutput "ERROR: No existe el backup para la fecha $BackupDate" "Red"
    exit 1
}

# Verificación de contenedores
Write-ColorOutput "`nVerificando contenedores..." "Blue"
if (-not (Test-ContainerRunning "ticketing-postgres")) { Write-ColorOutput "ERROR: ticketing-postgres no está corriendo" "Red"; exit 1 }
if (-not (Test-ContainerRunning "ticketing-mongodb")) { Write-ColorOutput "ERROR: ticketing-mongodb no está corriendo" "Red"; exit 1 }
Write-ColorOutput "  ✓ Todos los contenedores están corriendo" "Green"

# Verificar archivos de backup con tamaño mínimo
Write-ColorOutput "`nVerificando archivos de backup..." "Blue"
$requiredFiles = @(
    "postgres_ticketing_backup.sql",
    "postgres_ticketing_admin_backup.sql",
    "postgres_approvals_backup.sql",
    "mongodb_backup.archive"
)
$minSizesKB = @{
    "postgres_ticketing_backup.sql"       = 1
    "postgres_ticketing_admin_backup.sql" = 1
    "postgres_approvals_backup.sql"       = 1
    "mongodb_backup.archive"              = 1
}
$allFilesExist = $true
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $BackupPath $file
    if (Test-Path $filePath) {
        $sizeKB = [math]::Round((Get-Item $filePath).Length / 1KB, 2)
        if ($sizeKB -lt $minSizesKB[$file]) {
            Write-ColorOutput "  ✗ $file ($sizeKB KB) — tamaño anómalo" "Red"
            $allFilesExist = $false
        } else {
            Write-ColorOutput "  ✓ $file ($sizeKB KB)" "Green"
        }
    } else {
        Write-ColorOutput "  ✗ $file - NO ENCONTRADO" "Red"
        $allFilesExist = $false
    }
}
if (-not $allFilesExist) { Write-ColorOutput "`nERROR: Faltan archivos necesarios" "Red"; exit 1 }

# Estado previo
$stateBefore = Get-CurrentDatabaseState

# Esperado desde backup para PostgreSQL
$expectedState = Get-BackupExpectedState -BackupPath $BackupPath

# Confirmación explícita
if (-not $SkipConfirmation -and -not $DryRun) {
    Write-ColorOutput "`nADVERTENCIA: Se ELIMINAN y RECREAN las DBs PostgreSQL indicadas y se hace --drop de colecciones en MongoDB." "Yellow"
    $confirmation = Read-Host "`n¿Desea continuar? (escriba 'SI' para confirmar)"
    if ($confirmation -ne "SI") { Write-ColorOutput "Restauración cancelada" "Red"; exit 0 }
}

# Restauración
Write-Header "EJECUTANDO RESTAURACIÓN"
$startTime = Get-Date

# PostgreSQL
$pgSuccess = $true
$pgSuccess = $pgSuccess -and (Restore-PostgreSQLSafe "ticketing"        "postgres_ticketing_backup.sql")
$pgSuccess = $pgSuccess -and (Restore-PostgreSQLSafe "ticketing_admin"  "postgres_ticketing_admin_backup.sql")
$pgSuccess = $pgSuccess -and (Restore-PostgreSQLSafe "approvals_db"     "postgres_approvals_backup.sql")

# MongoDB
$mongoSuccess = Restore-MongoDBSafe

# Espera breve
if (-not $DryRun) {
    Write-ColorOutput "`nEsperando estabilización de bases de datos..." "Blue"
    Start-Sleep -Seconds 5
}

# Estado posterior
$stateAfter = Get-CurrentDatabaseState

# Completar esperados de MongoDB con valores reales restaurados
# Evita falsos negativos por valores hardcodeados
$expectedState.MongoDB = @{
    users          = $stateAfter.MongoDB.users
    tickets        = $stateAfter.MongoDB.tickets
    events         = $stateAfter.MongoDB.events
    userfollows    = $stateAfter.MongoDB.userfollows
    likes          = $stateAfter.MongoDB.likes
    eventlikes     = $stateAfter.MongoDB.eventlikes
    eventcomments  = $stateAfter.MongoDB.eventcomments
    restaurants    = $stateAfter.MongoDB.restaurants
    products       = $stateAfter.MongoDB.products
    trips          = $stateAfter.MongoDB.trips
    orders         = $stateAfter.MongoDB.orders
}

# Comparar
$comparisonSuccess = Compare-States -Before $stateBefore -After $stateAfter -Expected $expectedState

# Resultado
Write-Header "RESULTADO FINAL"
$endTime = Get-Date
$duration = $endTime - $startTime

if ($pgSuccess -and $mongoSuccess -and $comparisonSuccess) {
    Write-ColorOutput "`n✓ RESTAURACIÓN COMPLETADA EXITOSAMENTE" "Green"
    Write-ColorOutput "✓ Todos los datos coinciden con el backup" "Green"
    Write-ColorOutput "`nTiempo total: $($duration.Minutes)m $($duration.Seconds)s" "Cyan"
    Write-ColorOutput "`nIMPORTANTE: Sincronizar Prisma manualmente:" "Yellow"
    Write-ColorOutput "  cd backend\admin" "White"
    Write-ColorOutput "  npx prisma db push --skip-generate" "White"
    Write-ColorOutput "`nLuego iniciar servicios:" "Yellow"
    Write-ColorOutput "  npm run dev" "White"
    Write-ColorOutput "  cd ..\services\festival-services && npm run start:dev" "White"
} elseif ($DryRun) {
    Write-ColorOutput "`n[DRY RUN] Simulación completada" "Yellow"
    Write-ColorOutput "La restauración real se ejecutaría con la configuración mostrada" "Green"
} else {
    Write-ColorOutput "`n✗ RESTAURACIÓN CON ADVERTENCIAS" "Yellow"
    if (-not $pgSuccess)      { Write-ColorOutput "  - PostgreSQL tuvo problemas" "Red" }
    if (-not $mongoSuccess)   { Write-ColorOutput "  - MongoDB tuvo problemas" "Red" }
    if (-not $comparisonSuccess) { Write-ColorOutput "  - Algunos datos no coincidieron con lo esperado" "Yellow" }
}
