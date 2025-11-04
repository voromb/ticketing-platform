param(
    [Parameter(Mandatory=$true)]
    [string]$BackupDate,
    [switch]$SkipConfirmation
)

$BackupPath = "$(Split-Path $MyInvocation.MyCommand.Path)\backups\$BackupDate"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESTAURACIÓN SEGURA V4.2 - TICKETMASTER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fecha de backup: $BackupDate" -ForegroundColor Yellow
Write-Host ""

function ExitWithError($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

# Verificar contenedores
Write-Host "Verificando contenedores..."
$pg = docker ps --format "{{.Names}}" | Select-String "ticketing-postgres"
$mg = docker ps --format "{{.Names}}" | Select-String "ticketing-mongodb"
if(-not $pg -or -not $mg) { ExitWithError "Contenedores no están activos" }
Write-Host "   OK ✅"

# Validar archivos necesarios
Write-Host ""
Write-Host "Verificando archivos de backup..."
function CheckFile($file) {
    $path = "$BackupPath\$file"
    if(Test-Path $path) {
        Write-Host "   $file ✓"
    } else {
        ExitWithError "$file NO ENCONTRADO"
    }
}
CheckFile "postgres_ticketing_backup.sql"
CheckFile "postgres_ticketing_admin_backup.sql"
CheckFile "postgres_approvals_backup.sql"
CheckFile "mongodb_backup.archive"
Write-Host ""

# Confirmación
if(-not $SkipConfirmation) {
    $confirm = Read-Host "¿Seguro que deseas restaurar? Esto BORRARÁ los datos actuales. Escribe SI"
    if($confirm -ne "SI") { ExitWithError "Cancelado por usuario" }
}

Write-Host ""
Write-Host "LIMPIANDO ENTORNO..." -ForegroundColor Yellow

# Cerrar conexiones PostgreSQL
docker exec ticketing-postgres psql -U admin -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname IN ('ticketing','ticketing_admin','approvals_db') AND pid <> pg_backend_pid();"

# Eliminar y recrear bases de datos
$Databases = @("ticketing","ticketing_admin","approvals_db")
foreach($db in $Databases) {
    docker exec ticketing-postgres psql -U admin -d postgres -c "DROP DATABASE IF EXISTS $db;"
    docker exec ticketing-postgres psql -U admin -d postgres -c "CREATE DATABASE $db;"
}

Write-Host ""
Write-Host "RESTAURANDO POSTGRESQL..." -ForegroundColor Green

docker cp "$BackupPath\postgres_ticketing_backup.sql" ticketing-postgres:/tmp/ticketing.sql
docker exec ticketing-postgres psql -U admin -d ticketing -f /tmp/ticketing.sql

docker cp "$BackupPath\postgres_ticketing_admin_backup.sql" ticketing-postgres:/tmp/ticketing_admin.sql
docker exec ticketing-postgres psql -U admin -d ticketing_admin -f /tmp/ticketing_admin.sql

docker cp "$BackupPath\postgres_approvals_backup.sql" ticketing-postgres:/tmp/approvals.sql
docker exec ticketing-postgres psql -U admin -d approvals_db -f /tmp/approvals.sql

Write-Host ""
Write-Host "RESTAURANDO MONGODB..." -ForegroundColor Green

docker cp "$BackupPath\mongodb_backup.archive" ticketing-mongodb:/tmp/mongo.archive
docker exec ticketing-mongodb mongorestore --archive=/tmp/mongo.archive --drop --gzip --username admin --password admin123 --authenticationDatabase admin

Write-Host ""
Write-Host "LIMPIEZA DE BACKUP DE PRISMA..." -ForegroundColor Yellow

$PrismaBackupPath = "$BackupPath\prisma"
if(Test-Path $PrismaBackupPath) {
    Remove-Item -Recurse -Force $PrismaBackupPath
    Write-Host "   Prisma antiguo eliminado ✅"
} else {
    Write-Host "   No había directorio Prisma en backup ✅"
}

Write-Host ""
Write-Host "SINCRONIZANDO PRISMA CON DB..." -ForegroundColor Cyan

cd "$(Split-Path $MyInvocation.MyCommand.Path)\..\backend\admin"
npx prisma db push --skip-generate

Write-Host ""
Write-Host "VALIDANDO RESULTADO..." -ForegroundColor Yellow

docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) AS eventos FROM \"Event\";"
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) AS venues FROM \"Venue\";"
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) AS companies FROM companies;"
docker exec ticketing-postgres psql -U admin -d ticketing -c "SELECT COUNT(*) AS admins FROM admins;"

Write-Host ""
Write-Host "✅ Restauración completa y verificada" -ForegroundColor Green
Write-Host ""
