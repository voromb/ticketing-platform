# SOLUCION PROBLEMA MONGO - Para tu compañero
# Ejecutar paso a paso para solucionar el problema

Write-Host "=== SOLUCION PROBLEMA MONGO-TICKETING ===" -ForegroundColor Cyan

Write-Host "`n1. Parando todos los contenedores..." -ForegroundColor Yellow
docker-compose down

Write-Host "`n2. Eliminando contenedores antiguos/zombie..." -ForegroundColor Yellow
docker container prune -f

Write-Host "`n3. Verificando contenedores eliminados..." -ForegroundColor Yellow
docker ps -a --filter "name=ticketing" --format "table {{.Names}}\t{{.Status}}"

Write-Host "`n4. Limpiando imágenes huérfanas..." -ForegroundColor Yellow
docker image prune -f

Write-Host "`n5. Iniciando servicios limpios..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "`n6. Esperando servicios..." -ForegroundColor Yellow
Start-Sleep 10

Write-Host "`n7. Verificando estado final..." -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

Write-Host "`n8. Test de conexion MongoDB..." -ForegroundColor Yellow
try {
    $mongoTest = docker exec ticketing-mongodb mongosh --quiet --eval 'db.adminCommand("ping")' 2>$null
    if ($mongoTest -and $mongoTest.Contains('"ok" : 1')) {
        Write-Host "MongoDB OK - Lista para restore" -ForegroundColor Green
    } else {
        Write-Host "MongoDB aún tiene problemas" -ForegroundColor Red
    }
} catch {
    Write-Host "Error probando MongoDB: $_" -ForegroundColor Red
}

Write-Host "`n9. Test de conexion PostgreSQL..." -ForegroundColor Yellow
try {
    $pgTest = docker exec ticketing-postgres psql -U admin -d ticketing -c '\l' 2>$null
    if ($pgTest) {
        Write-Host "PostgreSQL OK - Listo para restore" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL aún tiene problemas" -ForegroundColor Red
    }
} catch {
    Write-Host "Error probando PostgreSQL: $_" -ForegroundColor Red
}

Write-Host "`n=== SI TODO OK, AHORA EJECUTAR RESTORE ===" -ForegroundColor Cyan
Write-Host ".\restore.ps1 -BackupDate `"2025-10-15`" -ShowProgress" -ForegroundColor White