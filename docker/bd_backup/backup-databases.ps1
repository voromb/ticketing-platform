# Script de Backup Completo - Ticketing Platform
# Autor: Sistema de Backup Automatico
# Fecha: 2025-10-07

Write-Host "Iniciando Backup Completo de Bases de Datos..." -ForegroundColor Green

# Variables con rutas relativas desde el script
$scriptPath = $PSScriptRoot
$date = Get-Date -Format "yyyy-MM-dd"
$timestamp = Get-Date -Format "HH-mm"
$backupDir = Join-Path $scriptPath "backups\$date"
$commitHash = (git rev-parse --short HEAD 2>$null) -replace "`n", ""

Write-Host "Fecha: $date" -ForegroundColor Cyan
Write-Host "Hora: $timestamp" -ForegroundColor Cyan
Write-Host "Directorio: $backupDir" -ForegroundColor Cyan
Write-Host "Commit: $commitHash" -ForegroundColor Cyan

# Crear directorio por fecha si no existe
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
    Write-Host "Directorio de backup creado: $backupDir" -ForegroundColor Yellow
} else {
    Write-Host "Usando directorio existente: $backupDir" -ForegroundColor Yellow
}

Write-Host "`nCreando backup de PostgreSQL..." -ForegroundColor Blue

# Backup PostgreSQL - Dump completo (ESTO ES LO MAS IMPORTANTE)
try {
    docker exec ticketing-postgres pg_dump -U admin -d ticketing > "$backupDir\postgres_full_backup_$timestamp.sql"
    Write-Host "PostgreSQL dump creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error en PostgreSQL dump: $_" -ForegroundColor Red
}

# Backup PostgreSQL - Eventos via API (ENDPOINT PUBLICO)
try {
    curl -X GET "http://localhost:3004/api/events/public" -H "Content-Type: application/json" > "$backupDir\postgres_events_$timestamp.json"
    Write-Host "Eventos exportados via API" -ForegroundColor Green
} catch {
    Write-Host "Error exportando eventos: $_" -ForegroundColor Red
}

# Backup PostgreSQL - Venues via API (PUBLICO)
try {
    curl -X GET "http://localhost:3004/api/venues?limit=100" -H "Content-Type: application/json" > "$backupDir\postgres_venues_$timestamp.json"
    Write-Host "Venues exportados via API" -ForegroundColor Green
} catch {
    Write-Host "Error exportando venues: $_" -ForegroundColor Red
}

# Backup PostgreSQL - Venues pagina 2
try {
    curl -X GET "http://localhost:3004/api/venues?limit=100&page=2" -H "Content-Type: application/json" > "$backupDir\postgres_venues_page2_$timestamp.json"
    Write-Host "Venues pagina 2 exportados" -ForegroundColor Green
} catch {
    Write-Host "Info: No hay segunda pagina de venues" -ForegroundColor Yellow
}

Write-Host "`nCreando backup de MongoDB..." -ForegroundColor Blue

# Backup MongoDB - Base de datos principal (usuarios)
try {
    docker exec ticketing-mongodb mongoexport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --out=/tmp/users_backup.json
    docker cp ticketing-mongodb:/tmp/users_backup.json "$backupDir\mongodb_users_$timestamp.json"
    Write-Host "Usuarios exportados desde MongoDB" -ForegroundColor Green
} catch {
    Write-Host "Error exportando usuarios: $_" -ForegroundColor Red
}

# Backup MongoDB - Festival Services (NUEVO BACKEND)
Write-Host "Exportando datos del nuevo backend Festival Services..." -ForegroundColor Magenta

# Backup MongoDB - Travel Collection
try {
    docker exec ticketing-mongodb mongoexport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=travels --out=/tmp/travels_backup.json
    docker cp ticketing-mongodb:/tmp/travels_backup.json "$backupDir\mongodb_travels_$timestamp.json"
    Write-Host "Viajes exportados desde festival_services" -ForegroundColor Green
} catch {
    Write-Host "Error exportando viajes (puede que no existan datos): $_" -ForegroundColor Yellow
}

# Backup MongoDB - Restaurant Collection
try {
    docker exec ticketing-mongodb mongoexport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=restaurants --out=/tmp/restaurants_backup.json
    docker cp ticketing-mongodb:/tmp/restaurants_backup.json "$backupDir\mongodb_restaurants_$timestamp.json"
    Write-Host "Restaurantes exportados desde festival_services" -ForegroundColor Green
} catch {
    Write-Host "Error exportando restaurantes (puede que no existan datos): $_" -ForegroundColor Yellow
}

# Backup MongoDB - Merchandising Collection
try {
    docker exec ticketing-mongodb mongoexport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=products --out=/tmp/products_backup.json
    docker cp ticketing-mongodb:/tmp/products_backup.json "$backupDir\mongodb_products_$timestamp.json"
    Write-Host "Productos de merchandising exportados desde festival_services" -ForegroundColor Green
} catch {
    Write-Host "Error exportando productos (puede que no existan datos): $_" -ForegroundColor Yellow
}

# Backup completo de la base de datos festival_services
try {
    docker exec ticketing-mongodb mongodump --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --out=/tmp/
    docker exec ticketing-mongodb tar -czf /tmp/festival_services_dump_$timestamp.tar.gz -C /tmp festival_services
    docker cp ticketing-mongodb:/tmp/festival_services_dump_$timestamp.tar.gz "$backupDir\"
    Write-Host "Dump completo de festival_services creado" -ForegroundColor Green
} catch {
    Write-Host "Error creando dump de festival_services: $_" -ForegroundColor Yellow
}

Write-Host "`nCopiando Prisma Schemas..." -ForegroundColor Blue

# Backup Prisma Schema - Admin Backend
try {
    $prismaPath = Join-Path $scriptPath "..\..\backend\admin\prisma\schema.prisma"
    if (Test-Path $prismaPath) {
        Copy-Item $prismaPath "$backupDir\prisma_admin_schema_$timestamp.prisma" -Force
        Write-Host "Prisma Schema (Admin) copiado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Advertencia: No se encontro el schema de Prisma (Admin)" -ForegroundColor Yellow
        Write-Host "Ruta buscada: $prismaPath" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error copiando Prisma Schema (Admin): $_" -ForegroundColor Red
}

# Backup Prisma Schema - Festival Services Backend (NUEVO)
try {
    $prismaServicesPath = Join-Path $scriptPath "..\..\backend\services\festival-services\prisma\schema.prisma"
    if (Test-Path $prismaServicesPath) {
        Copy-Item $prismaServicesPath "$backupDir\prisma_services_schema_$timestamp.prisma" -Force
        Write-Host "Prisma Schema (Festival Services) copiado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "Advertencia: No se encontro el schema de Prisma (Services)" -ForegroundColor Yellow
        Write-Host "Ruta buscada: $prismaServicesPath" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error copiando Prisma Schema (Services): $_" -ForegroundColor Red
}

# Backup de la base de datos PostgreSQL de approvals (Festival Services)
Write-Host "`nCreando backup de PostgreSQL - Festival Services Approvals..." -ForegroundColor Magenta

try {
    docker exec ticketing-postgres pg_dump -U admin -d approvals_db > "$backupDir\postgres_approvals_db_$timestamp.sql"
    Write-Host "PostgreSQL Approvals DB dump creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "Error en PostgreSQL Approvals DB dump (puede que la DB no exista): $_" -ForegroundColor Yellow
}

Write-Host "`nCreando estadisticas del backup..." -ForegroundColor Blue

# Contar registros en PostgreSQL
try {
    $venueCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";'
    $eventCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";'
    $localityCount = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "EventLocality";'
    
    if ($venueCount) { Write-Host "Venues: $($venueCount.Trim())" -ForegroundColor Cyan }
    if ($eventCount) { Write-Host "Eventos: $($eventCount.Trim())" -ForegroundColor Cyan }
    if ($localityCount) { Write-Host "Localidades: $($localityCount.Trim())" -ForegroundColor Cyan }
} catch {
    Write-Host "No se pudieron obtener estadisticas de ticketing" -ForegroundColor Yellow
}

# Contar registros en PostgreSQL - Approvals DB (Festival Services)
try {
    $approvalsCount = docker exec ticketing-postgres psql -U admin -d approvals_db -t -c 'SELECT COUNT(*) FROM "Approval";' 2>$null
    if ($approvalsCount) { 
        Write-Host "Aprobaciones (Festival Services): $($approvalsCount.Trim())" -ForegroundColor Cyan 
    } else {
        Write-Host "Base de datos approvals_db no existe o esta vacia" -ForegroundColor Yellow
    }
} catch {
    Write-Host "No se pudieron obtener estadisticas de approvals_db" -ForegroundColor Yellow
}

# Contar registros en MongoDB - Festival Services
try {
    $travelsCount = docker exec ticketing-mongodb mongo --authenticationDatabase=admin -u admin -p admin123 festival_services --eval "db.travels.count()" --quiet 2>$null
    $restaurantsCount = docker exec ticketing-mongodb mongo --authenticationDatabase=admin -u admin -p admin123 festival_services --eval "db.restaurants.count()" --quiet 2>$null
    $productsCount = docker exec ticketing-mongodb mongo --authenticationDatabase=admin -u admin -p admin123 festival_services --eval "db.products.count()" --quiet 2>$null
    
    if ($travelsCount) { Write-Host "Viajes (MongoDB): $($travelsCount.Trim())" -ForegroundColor Cyan }
    if ($restaurantsCount) { Write-Host "Restaurantes (MongoDB): $($restaurantsCount.Trim())" -ForegroundColor Cyan }
    if ($productsCount) { Write-Host "Productos (MongoDB): $($productsCount.Trim())" -ForegroundColor Cyan }
} catch {
    Write-Host "No se pudieron obtener estadisticas de festival_services" -ForegroundColor Yellow
}

# Crear archivo de informacion del backup
$backupInfo = @"
# BACKUP COMPLETO - TICKETING PLATFORM
**Fecha:** $date $timestamp  
**Commit:** $commitHash  
**Rama:** $(git branch --show-current 2>$null)

## CONTENIDO DEL BACKUP

### PostgreSQL - Base Principal (ticketing)
- postgres_full_backup_$timestamp.sql - Dump completo de la BD principal
- postgres_events_$timestamp.json - Eventos exportados via API
- postgres_venues_$timestamp.json - Venues exportados via API
- postgres_venues_page2_$timestamp.json - Venues página 2

### PostgreSQL - Festival Services (approvals_db)
- postgres_approvals_db_$timestamp.sql - Base de datos de aprobaciones (Prisma)

### MongoDB - Base Principal (ticketing)
- mongodb_users_$timestamp.json - Usuarios del sistema

### MongoDB - Festival Services (festival_services)
- mongodb_travels_$timestamp.json - Colección de viajes
- mongodb_restaurants_$timestamp.json - Colección de restaurantes  
- mongodb_products_$timestamp.json - Colección de productos/merchandising
- festival_services_dump_$timestamp.tar.gz - Dump completo de la BD

### Prisma Schemas
- prisma_admin_schema_$timestamp.prisma - Schema del backend admin
- prisma_services_schema_$timestamp.prisma - Schema del backend services

## PARA RESTAURAR EN OTRO EQUIPO

### 1. Restaurar PostgreSQL (Base Principal)
``````bash
# Copiar el archivo SQL al contenedor
docker cp postgres_full_backup_$timestamp.sql ticketing-postgres:/tmp/

# Restaurar la base de datos
docker exec ticketing-postgres psql -U admin -d ticketing -f /tmp/postgres_full_backup_$timestamp.sql
``````

### 2. Restaurar PostgreSQL (Festival Services)
``````bash
# Crear la base de datos approvals_db si no existe
docker exec ticketing-postgres psql -U admin -c "CREATE DATABASE approvals_db;"

# Restaurar
docker cp postgres_approvals_db_$timestamp.sql ticketing-postgres:/tmp/
docker exec ticketing-postgres psql -U admin -d approvals_db -f /tmp/postgres_approvals_db_$timestamp.sql
``````

### 3. Restaurar MongoDB (Usuarios)
``````bash
# Importar usuarios
docker cp mongodb_users_$timestamp.json ticketing-mongodb:/tmp/
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=ticketing --collection=users --file=/tmp/mongodb_users_$timestamp.json
``````

### 4. Restaurar MongoDB (Festival Services)
``````bash
# Opción A: Restaurar colecciones individuales
docker cp mongodb_travels_$timestamp.json ticketing-mongodb:/tmp/
docker cp mongodb_restaurants_$timestamp.json ticketing-mongodb:/tmp/  
docker cp mongodb_products_$timestamp.json ticketing-mongodb:/tmp/

docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=travels --file=/tmp/mongodb_travels_$timestamp.json
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=restaurants --file=/tmp/mongodb_restaurants_$timestamp.json
docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=products --file=/tmp/mongodb_products_$timestamp.json

# Opción B: Restaurar dump completo
docker cp festival_services_dump_$timestamp.tar.gz ticketing-mongodb:/tmp/
docker exec ticketing-mongodb tar -xzf /tmp/festival_services_dump_$timestamp.tar.gz -C /tmp/
docker exec ticketing-mongodb mongorestore --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services /tmp/festival_services/
``````

### 5. Configurar Prisma
``````bash
# En el backend admin
cd backend/admin
npm install
npx prisma generate
npx prisma db push

# En el backend services  
cd backend/services/festival-services
npm install
npx prisma generate
npx prisma db push
``````

## VARIABLES DE ENTORNO NECESARIAS

### Backend Admin (.env)
``````
DATABASE_URL="postgresql://admin:admin123@localhost:5432/ticketing?schema=public"
``````

### Backend Services (.env)
``````
MONGODB_URI=mongodb://admin:admin123@localhost:27017/festival_services?authSource=admin
DATABASE_URL="postgresql://admin:admin123@localhost:5432/approvals_db?schema=public"
``````

---
**Generado automáticamente por:** backup-databases.ps1  
**Fecha de creación:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

$backupInfo | Out-File -FilePath "$backupDir\BACKUP_INFO.md" -Encoding UTF8

Write-Host "`nArchivo de información creado: BACKUP_INFO.md" -ForegroundColor Green

Write-Host "`nBackup completo finalizado exitosamente!" -ForegroundColor Green
Write-Host "Archivos creados en: $backupDir" -ForegroundColor White
Write-Host "`nTotal de datos respaldados:" -ForegroundColor White
if ($venueCount) { Write-Host "  Venues: $($venueCount.Trim())" -ForegroundColor Cyan }
if ($eventCount) { Write-Host "  Eventos: $($eventCount.Trim())" -ForegroundColor Cyan }
if ($localityCount) { Write-Host "  Localidades: $($localityCount.Trim())" -ForegroundColor Cyan }
if ($approvalsCount) { Write-Host "  Aprobaciones: $($approvalsCount.Trim())" -ForegroundColor Cyan }
if ($travelsCount) { Write-Host "  Viajes: $($travelsCount.Trim())" -ForegroundColor Cyan }
if ($restaurantsCount) { Write-Host "  Restaurantes: $($restaurantsCount.Trim())" -ForegroundColor Cyan }
if ($productsCount) { Write-Host "  Productos: $($productsCount.Trim())" -ForegroundColor Cyan }

Write-Host "`nLee el archivo BACKUP_INFO.md para instrucciones completas de restauración" -ForegroundColor Yellow