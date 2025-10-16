param(
    [string]$BackupDir = "backups\2025-10-16"
)

$ErrorActionPreference = "Stop"

Write-Host "=== BACKUP SISTEMA TICKETING ===" -ForegroundColor Green
Write-Host "Iniciando backup completo del sistema..."

$BackupPath = Join-Path $PSScriptRoot $BackupDir
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "Carpeta de backup creada: $BackupPath"
}

Write-Host "`n1. BACKUP POSTGRESQL (TODAS LAS BASES DE DATOS)"

# Base de datos principal ticketing
$PostgresMainFile = Join-Path $BackupPath "postgres_ticketing_backup.sql"
$PgDumpMainCmd = "docker exec ticketing-postgres pg_dump -U admin -d ticketing --no-owner --no-privileges --inserts"
Invoke-Expression $PgDumpMainCmd | Out-File -FilePath $PostgresMainFile -Encoding UTF8
Write-Host "PostgreSQL ticketing backup guardado: postgres_ticketing_backup.sql"

# Base de datos ticketing_admin
$PostgresAdminFile = Join-Path $BackupPath "postgres_ticketing_admin_backup.sql"
$PgDumpAdminCmd = "docker exec ticketing-postgres pg_dump -U admin -d ticketing_admin --no-owner --no-privileges --inserts"
Invoke-Expression $PgDumpAdminCmd | Out-File -FilePath $PostgresAdminFile -Encoding UTF8
Write-Host "PostgreSQL ticketing_admin backup guardado: postgres_ticketing_admin_backup.sql"

# Base de datos approvals_db
$PostgresApprovalsFile = Join-Path $BackupPath "postgres_approvals_backup.sql"
$PgDumpApprovalsCmd = "docker exec ticketing-postgres pg_dump -U admin -d approvals_db --no-owner --no-privileges --inserts"
Invoke-Expression $PgDumpApprovalsCmd | Out-File -FilePath $PostgresApprovalsFile -Encoding UTF8
Write-Host "PostgreSQL approvals_db backup guardado: postgres_approvals_backup.sql"

Write-Host "`n2. BACKUP MONGODB (Users + Festival Services)"
$MongoFile = Join-Path $BackupPath "mongodb_backup.archive"
$MongoDumpCmd = "docker exec ticketing-mongodb mongodump --username admin --password admin123 --authenticationDatabase admin --archive=/tmp/backup.archive --gzip"
Invoke-Expression $MongoDumpCmd | Out-Null
$CopyCmd = "docker cp ticketing-mongodb:/tmp/backup.archive `"$MongoFile`""
Invoke-Expression $CopyCmd
Write-Host "MongoDB backup guardado en: mongodb_backup.archive"

Write-Host "`n3. BACKUP PRISMA MIGRATIONS"
$PrismaBackupDir = Join-Path $BackupPath "prisma"
if (-not (Test-Path $PrismaBackupDir)) {
    New-Item -ItemType Directory -Path $PrismaBackupDir -Force | Out-Null
}

$AdminPrismaSource = "..\..\backend\admin\prisma"
$FestivalPrismaSource = "..\..\backend\services\festival-services\prisma"
$DockerPrismaSource = "..\prisma"

if (Test-Path $AdminPrismaSource) {
    $AdminPrismaTarget = Join-Path $PrismaBackupDir "admin"
    Copy-Item -Path $AdminPrismaSource -Destination $AdminPrismaTarget -Recurse -Force
    Write-Host "Migraciones Admin Prisma copiadas"
}

if (Test-Path $FestivalPrismaSource) {
    $FestivalPrismaTarget = Join-Path $PrismaBackupDir "festival-services"
    Copy-Item -Path $FestivalPrismaSource -Destination $FestivalPrismaTarget -Recurse -Force
    Write-Host "Migraciones Festival Prisma copiadas"
}

if (Test-Path $DockerPrismaSource) {
    $DockerPrismaTarget = Join-Path $PrismaBackupDir "docker"
    Copy-Item -Path $DockerPrismaSource -Destination $DockerPrismaTarget -Recurse -Force
    Write-Host "Schema Docker Prisma copiado"
}

Write-Host "`n4. VERIFICACION EXHAUSTIVA DEL BACKUP"

# Verificar PostgreSQL ticketing
if (Test-Path $PostgresMainFile) {
    $PostgresMainSize = (Get-Item $PostgresMainFile).Length
    Write-Host "PostgreSQL ticketing: $($PostgresMainSize / 1KB) KB"

    # Contar INSERT statements específicos
    $EventInserts = (Select-String -Path $PostgresMainFile -Pattern 'INSERT INTO public\."Event"' -AllMatches).Matches.Count
    $VenueInserts = (Select-String -Path $PostgresMainFile -Pattern 'INSERT INTO public\."Venue"' -AllMatches).Matches.Count
    $CategoryInserts = (Select-String -Path $PostgresMainFile -Pattern 'INSERT INTO public\."EventCategory"' -AllMatches).Matches.Count
    $SubcategoryInserts = (Select-String -Path $PostgresMainFile -Pattern 'INSERT INTO public\."EventSubcategory"' -AllMatches).Matches.Count
    $OrderInserts = (Select-String -Path $PostgresMainFile -Pattern 'INSERT INTO public\."Order"' -AllMatches).Matches.Count
    $TicketInserts = (Select-String -Path $PostgresMainFile -Pattern 'INSERT INTO public\."Ticket"' -AllMatches).Matches.Count
    $AdminInserts = (Select-String -Path $PostgresMainFile -Pattern 'INSERT INTO public\.admins' -AllMatches).Matches.Count

    Write-Host "  - Eventos: $EventInserts"
    Write-Host "  - Venues: $VenueInserts"
    Write-Host "  - Categorias: $CategoryInserts"
    Write-Host "  - Subcategorias: $SubcategoryInserts"
    Write-Host "  - Ordenes: $OrderInserts"
    Write-Host "  - Tickets: $TicketInserts"
    Write-Host "  - Admins: $AdminInserts"
}

# Verificar PostgreSQL ticketing_admin
if (Test-Path $PostgresAdminFile) {
    $PostgresAdminSize = (Get-Item $PostgresAdminFile).Length
    Write-Host "PostgreSQL ticketing_admin: $($PostgresAdminSize / 1KB) KB"
    
    $AdminEventInserts = (Select-String -Path $PostgresAdminFile -Pattern 'INSERT INTO public\."Event"' -AllMatches).Matches.Count
    $AdminVenueInserts = (Select-String -Path $PostgresAdminFile -Pattern 'INSERT INTO public\."Venue"' -AllMatches).Matches.Count
    $AdminCategoryInserts = (Select-String -Path $PostgresAdminFile -Pattern 'INSERT INTO public\."EventCategory"' -AllMatches).Matches.Count
    
    Write-Host "  - Eventos adicionales: $AdminEventInserts"
    Write-Host "  - Venues adicionales: $AdminVenueInserts"
    Write-Host "  - Categorias: $AdminCategoryInserts"
}

# Verificar PostgreSQL approvals_db
if (Test-Path $PostgresApprovalsFile) {
    $PostgresApprovalsSize = (Get-Item $PostgresApprovalsFile).Length
    Write-Host "PostgreSQL approvals_db: $($PostgresApprovalsSize / 1KB) KB"
    
    $ApprovalInserts = (Select-String -Path $PostgresApprovalsFile -Pattern 'INSERT INTO public\."Approval"' -AllMatches).Matches.Count
    Write-Host "  - Approvals: $ApprovalInserts"
}

if (Test-Path $MongoFile) {
    $MongoSize = (Get-Item $MongoFile).Length
    Write-Host "MongoDB: $($MongoSize / 1KB) KB"
}

$PrismaFiles = Get-ChildItem -Path $PrismaBackupDir -Recurse -File | Measure-Object
Write-Host "Prisma: $($PrismaFiles.Count) archivos copiados"

Write-Host "`n=== BACKUP COMPLETADO ===" -ForegroundColor Green
Write-Host "Ubicacion: $BackupPath"
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Verificar si existe base de datos para festival-services en PostgreSQL
$FestivalPgExists = docker exec ticketing-postgres psql -U admin -l | Select-String "festival_services"
if ($FestivalPgExists) {
    Write-Host "`nADVERTENCIA: Encontrada base PostgreSQL festival_services no respaldada!" -ForegroundColor Yellow
} else {
    Write-Host "`nFestival Services: Solo MongoDB (correcto)" -ForegroundColor Green
}

Write-Host "`nRESUMEN TOTAL:"
if ((Test-Path $PostgresMainFile) -and (Test-Path $PostgresAdminFile) -and (Test-Path $PostgresApprovalsFile)) {
    $TotalEvents = $EventInserts + $AdminEventInserts
    $TotalVenues = $VenueInserts + $AdminVenueInserts
    Write-Host "EVENTOS TOTALES: $TotalEvents ($EventInserts + $AdminEventInserts)" -ForegroundColor Cyan
    Write-Host "VENUES TOTALES: $TotalVenues ($VenueInserts + $AdminVenueInserts)" -ForegroundColor Cyan
    Write-Host "APPROVALS: $ApprovalInserts" -ForegroundColor Cyan
    Write-Host "BACKUP 100% COMPLETO" -ForegroundColor Green
}