# Script de Restauración - Festival Services Backend
# Autor: Sistema de Backup Automatico
# Fecha: 2025-10-12

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFolder,
    [Parameter(Mandatory=$false)]
    [switch]$SkipConfirmation
)

Write-Host "Iniciando Restauración del Backend Festival Services..." -ForegroundColor Green

# Validar que existe la carpeta de backup
if (!(Test-Path $BackupFolder)) {
    Write-Host "Error: No se encuentra la carpeta de backup: $BackupFolder" -ForegroundColor Red
    exit 1
}

# Buscar archivos de backup en la carpeta
$backupFiles = @()
$backupFiles += Get-ChildItem -Path $BackupFolder -Name "*festival*" -ErrorAction SilentlyContinue
$backupFiles += Get-ChildItem -Path $BackupFolder -Name "*approvals*" -ErrorAction SilentlyContinue
$backupFiles += Get-ChildItem -Path $BackupFolder -Name "*services*" -ErrorAction SilentlyContinue
$backupFiles += Get-ChildItem -Path $BackupFolder -Name "*travels*" -ErrorAction SilentlyContinue
$backupFiles += Get-ChildItem -Path $BackupFolder -Name "*restaurants*" -ErrorAction SilentlyContinue
$backupFiles += Get-ChildItem -Path $BackupFolder -Name "*products*" -ErrorAction SilentlyContinue

if ($backupFiles.Count -eq 0) {
    Write-Host "Error: No se encontraron archivos de backup del Festival Services en la carpeta especificada" -ForegroundColor Red
    exit 1
}

Write-Host "Carpeta de backup: $BackupFolder" -ForegroundColor Cyan
Write-Host "Archivos encontrados:" -ForegroundColor Yellow
$backupFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }

if (!$SkipConfirmation) {
    $confirmation = Read-Host "`nEsta operación puede sobrescribir datos existentes. ¿Continuar? (s/N)"
    if ($confirmation -ne 's' -and $confirmation -ne 'S') {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`nIniciando restauración..." -ForegroundColor Green

# 1. Restaurar PostgreSQL - Base de datos de approvals
Write-Host "`n1️⃣ Restaurando PostgreSQL - Approvals DB..." -ForegroundColor Blue

$approvalsSqlFile = Get-ChildItem -Path $BackupFolder -Name "*approvals*.sql" | Select-Object -First 1
if ($approvalsSqlFile) {
    try {
        Write-Host " Encontrado: $approvalsSqlFile" -ForegroundColor White
        
        # Crear la base de datos si no existe
        Write-Host " Creando base de datos approvals_db..." -ForegroundColor Yellow
        docker exec ticketing-postgres psql -U admin -c "CREATE DATABASE approvals_db;" 2>$null
        
        # Copiar archivo al contenedor
        docker cp "$BackupFolder\$approvalsSqlFile" ticketing-postgres:/tmp/approvals_restore.sql
        
        # Restaurar
        docker exec ticketing-postgres psql -U admin -d approvals_db -f /tmp/approvals_restore.sql
        Write-Host " PostgreSQL Approvals DB restaurada exitosamente" -ForegroundColor Green
    } catch {
        Write-Host " Error restaurando Approvals DB: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host " No se encontró archivo de backup de Approvals DB" -ForegroundColor Yellow
}

# 2. Restaurar MongoDB - Festival Services
Write-Host "`n2️⃣ Restaurando MongoDB - Festival Services..." -ForegroundColor Blue

# Restaurar dump completo si existe
$mongoCompleteDump = Get-ChildItem -Path $BackupFolder -Name "*festival_services_dump*.tar.gz" | Select-Object -First 1
if ($mongoCompleteDump) {
    try {
        Write-Host " Encontrado dump completo: $mongoCompleteDump" -ForegroundColor White
        
        # Copiar y extraer
        docker cp "$BackupFolder\$mongoCompleteDump" ticketing-mongodb:/tmp/
        docker exec ticketing-mongodb tar -xzf "/tmp/$mongoCompleteDump" -C /tmp/
        
        # Restaurar
        docker exec ticketing-mongodb mongorestore --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services /tmp/festival_services/ --drop
        Write-Host " MongoDB Festival Services (dump completo) restaurado exitosamente" -ForegroundColor Green
    } catch {
        Write-Host " Error restaurando dump completo: $_" -ForegroundColor Yellow
        Write-Host " Intentando restauración individual..." -ForegroundColor Yellow
        
        # Fallback: restaurar colecciones individuales
        $collections = @(
            @{Name="travels"; Pattern="*travels*.json"},
            @{Name="restaurants"; Pattern="*restaurants*.json"},
            @{Name="products"; Pattern="*products*.json"}
        )
        
        foreach ($collection in $collections) {
            $collectionFile = Get-ChildItem -Path $BackupFolder -Name $collection.Pattern | Select-Object -First 1
            if ($collectionFile) {
                try {
                    Write-Host " Restaurando $($collection.Name): $collectionFile" -ForegroundColor White
                    docker cp "$BackupFolder\$collectionFile" ticketing-mongodb:/tmp/collection_restore.json
                    docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=$($collection.Name) --file=/tmp/collection_restore.json --drop
                    Write-Host " Colección $($collection.Name) restaurada" -ForegroundColor Green
                } catch {
                    Write-Host " Error restaurando $($collection.Name): $_" -ForegroundColor Yellow
                }
            } else {
                Write-Host " No se encontró archivo para $($collection.Name)" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host " No se encontró dump completo de festival_services, intentando restauración individual..." -ForegroundColor Yellow
    
    # Restaurar colecciones individuales
    $collections = @(
        @{Name="travels"; Pattern="*travels*.json"},
        @{Name="restaurants"; Pattern="*restaurants*.json"},
        @{Name="products"; Pattern="*products*.json"}
    )
    
    foreach ($collection in $collections) {
        $collectionFile = Get-ChildItem -Path $BackupFolder -Name $collection.Pattern | Select-Object -First 1
        if ($collectionFile) {
            try {
                Write-Host " Restaurando $($collection.Name): $collectionFile" -ForegroundColor White
                docker cp "$BackupFolder\$collectionFile" ticketing-mongodb:/tmp/collection_restore.json
                docker exec ticketing-mongodb mongoimport --authenticationDatabase=admin --username=admin --password=admin123 --db=festival_services --collection=$($collection.Name) --file=/tmp/collection_restore.json --drop
                Write-Host " Colección $($collection.Name) restaurada" -ForegroundColor Green
            } catch {
                Write-Host " Error restaurando $($collection.Name): $_" -ForegroundColor Yellow
            }
        } else {
            Write-Host " No se encontró archivo para $($collection.Name)" -ForegroundColor Yellow
        }
    }
}

# 3. Configurar Prisma Schema
Write-Host "`n3️⃣ Configurando Prisma Schema..." -ForegroundColor Blue

$prismaServicesSchema = Get-ChildItem -Path $BackupFolder -Name "*services*schema*.prisma" | Select-Object -First 1
if ($prismaServicesSchema) {
    try {
        $destinationPath = "..\..\backend\services\festival-services\prisma\schema.prisma"
        if (Test-Path $destinationPath) {
            # Hacer backup del schema actual
            $backupSchemaPath = "..\..\backend\services\festival-services\prisma\schema.prisma.backup.$(Get-Date -Format 'yyyyMMdd-HHmm')"
            Copy-Item $destinationPath $backupSchemaPath -Force
            Write-Host "💾 Backup del schema actual creado: $backupSchemaPath" -ForegroundColor Yellow
        }
        
        # Copiar el nuevo schema
        Copy-Item "$BackupFolder\$prismaServicesSchema" $destinationPath -Force
        Write-Host " Prisma Schema restaurado: $destinationPath" -ForegroundColor Green
        
        Write-Host " Generando cliente Prisma..." -ForegroundColor Yellow
        $originalLocation = Get-Location
        Set-Location "..\..\backend\services\festival-services"
        
        if (Test-Path "package.json") {
            npm install --silent 2>$null
            npx prisma generate 2>$null
            Write-Host " Cliente Prisma generado" -ForegroundColor Green
        } else {
            Write-Host " No se encontró package.json, ejecutar manualmente: npm install && npx prisma generate" -ForegroundColor Yellow
        }
        
        Set-Location $originalLocation
    } catch {
        Write-Host " Error configurando Prisma: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host " No se encontró Prisma Schema para services" -ForegroundColor Yellow
}

# 4. Verificación
Write-Host "`n4️⃣ Verificando restauración..." -ForegroundColor Blue

try {
    # Verificar PostgreSQL
    $approvalsCount = docker exec ticketing-postgres psql -U admin -d approvals_db -t -c 'SELECT COUNT(*) FROM "Approval";' 2>$null
    if ($approvalsCount) {
        Write-Host " PostgreSQL - Aprobaciones: $($approvalsCount.Trim())" -ForegroundColor Green
    } else {
        Write-Host " PostgreSQL - No se pudo verificar la tabla Approval" -ForegroundColor Yellow
    }
    
    # Verificar MongoDB
    $travelsCount = docker exec ticketing-mongodb mongo --authenticationDatabase=admin -u admin -p admin123 festival_services --eval "db.travels.count()" --quiet 2>$null
    $restaurantsCount = docker exec ticketing-mongodb mongo --authenticationDatabase=admin -u admin -p admin123 festival_services --eval "db.restaurants.count()" --quiet 2>$null
    $productsCount = docker exec ticketing-mongodb mongo --authenticationDatabase=admin -u admin -p admin123 festival_services --eval "db.products.count()" --quiet 2>$null
    
    if ($travelsCount) { Write-Host " MongoDB - Viajes: $($travelsCount.Trim())" -ForegroundColor Green }
    if ($restaurantsCount) { Write-Host " MongoDB - Restaurantes: $($restaurantsCount.Trim())" -ForegroundColor Green }
    if ($productsCount) { Write-Host " MongoDB - Productos: $($productsCount.Trim())" -ForegroundColor Green }
    
} catch {
    Write-Host " Error en verificación: $_" -ForegroundColor Yellow
}

Write-Host "`n Restauración del Festival Services completada!" -ForegroundColor Green
Write-Host " Siguientes pasos recomendados:" -ForegroundColor Yellow
Write-Host "   1. Verificar variables de entorno (.env)" -ForegroundColor White
Write-Host "   2. Reiniciar los servicios: docker-compose restart" -ForegroundColor White
Write-Host "   3. Probar las APIs del backend services" -ForegroundColor White

Write-Host "`n Variables de entorno necesarias en backend/services/festival-services/.env:" -ForegroundColor Yellow
Write-Host "   MONGODB_URI=mongodb://admin:admin123@localhost:27017/festival_services?authSource=admin" -ForegroundColor White
Write-Host "   DATABASE_URL=`"postgresql://admin:admin123@localhost:5432/approvals_db?schema=public`"" -ForegroundColor White
