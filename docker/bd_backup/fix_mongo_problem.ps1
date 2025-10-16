# SOLUCION PROBLEMA MONGO CON DIAGNOSTICO DETALLADO - Para tu compañero
# Ejecutar paso a paso para solucionar el problema con logs completos

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "           DIAGNOSTICO Y SOLUCION PROBLEMA MONGO-TICKETING              " -ForegroundColor Cyan  
Write-Host "                        CON LOGS DETALLADOS                             " -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan

# PASO 0: Diagnóstico inicial
Write-Host "`n[0/10] DIAGNOSTICO INICIAL..." -ForegroundColor Magenta
Write-Host "   Verificando Docker instalado..." -ForegroundColor White
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "   [OK] Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Docker no está instalado o no funciona: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n   Estado inicial de contenedores:" -ForegroundColor White
$initialContainers = docker ps -a --filter "name=ticketing" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" 2>&1
if ($initialContainers) {
    Write-Host "$initialContainers" -ForegroundColor Cyan
} else {
    Write-Host "   No hay contenedores ticketing" -ForegroundColor Yellow
}

Write-Host "`n[1/10] Parando todos los contenedores..." -ForegroundColor Yellow
try {
    $stopOutput = docker-compose down 2>&1
    Write-Host "   [OK] Contenedores parados exitosamente" -ForegroundColor Green
    Write-Host "   Salida: $stopOutput" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Error parando contenedores: $_" -ForegroundColor Red
    Write-Host "   Intentando parar manualmente..." -ForegroundColor Yellow
    
    $containers = docker ps -q --filter "name=ticketing" 2>$null
    if ($containers) {
        foreach ($container in $containers) {
            docker stop $container 2>&1 | Out-Null
            docker rm $container 2>&1 | Out-Null
        }
        Write-Host "   [OK] Contenedores parados manualmente" -ForegroundColor Green
    }
}

Write-Host "`n[2/10] Eliminando contenedores antiguos/zombie..." -ForegroundColor Yellow
try {
    $pruneOutput = docker container prune -f 2>&1
    Write-Host "   [OK] Contenedores zombie eliminados" -ForegroundColor Green
    Write-Host "   Salida: $pruneOutput" -ForegroundColor Gray
} catch {
    Write-Host "   [WARN] Error limpiando contenedores: $_" -ForegroundColor Yellow
}

Write-Host "`n[3/10] Verificando contenedores eliminados..." -ForegroundColor Yellow
$remainingContainers = docker ps -a --filter "name=ticketing" --format "table {{.Names}}\t{{.Status}}" 2>&1
if ($remainingContainers -and $remainingContainers -notlike "*NAMES*") {
    Write-Host "   [WARN] Aún quedan contenedores:" -ForegroundColor Yellow
    Write-Host "$remainingContainers" -ForegroundColor Cyan
} else {
    Write-Host "   [OK] Todos los contenedores ticketing eliminados" -ForegroundColor Green
}

Write-Host "`n[4/10] Limpiando imágenes huérfanas..." -ForegroundColor Yellow
try {
    $imagePrune = docker image prune -f 2>&1
    Write-Host "   [OK] Imágenes huérfanas limpiadas" -ForegroundColor Green
    Write-Host "   Salida: $imagePrune" -ForegroundColor Gray
} catch {
    Write-Host "   [WARN] Error limpiando imágenes: $_" -ForegroundColor Yellow
}

Write-Host "`n[5/10] Verificando docker-compose.yml..." -ForegroundColor Yellow
$composeFile = "..\docker-compose.yml"
if (Test-Path $composeFile) {
    Write-Host "   [OK] docker-compose.yml encontrado en directorio padre" -ForegroundColor Green
    Write-Host "   Cambiando al directorio docker..." -ForegroundColor Gray
    Push-Location ".."
} else {
    Write-Host "   [ERROR] docker-compose.yml NO encontrado" -ForegroundColor Red
    Write-Host "   Directorio actual: $(Get-Location)" -ForegroundColor Red
    Write-Host "   Buscado en: $composeFile" -ForegroundColor Red
    exit 1
}

Write-Host "`n[6/10] Iniciando servicios limpios..." -ForegroundColor Yellow
try {
    Write-Host "   Ejecutando: docker-compose up -d" -ForegroundColor Gray
    $upOutput = docker-compose up -d 2>&1
    Write-Host "   [OK] Servicios iniciados" -ForegroundColor Green
    Write-Host "   Salida completa:" -ForegroundColor Gray
    Write-Host "$upOutput" -ForegroundColor Cyan
} catch {
    Write-Host "   [ERROR] Error iniciando servicios: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n[7/10] Esperando servicios (15 segundos)..." -ForegroundColor Yellow
for ($i = 1; $i -le 15; $i++) {
    Write-Host "   Esperando... $i/15 segundos" -ForegroundColor Gray
    Start-Sleep 1
}

Write-Host "`n[8/10] Verificando estado final..." -ForegroundColor Yellow
$finalContainers = docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" 2>&1
Write-Host "   Estado de contenedores:" -ForegroundColor White
Write-Host "$finalContainers" -ForegroundColor Cyan

# Verificar contenedores específicos
$requiredContainers = @("ticketing-postgres", "ticketing-mongodb", "ticketing-rabbitmq")
foreach ($container in $requiredContainers) {
    $status = docker ps --filter "name=$container" --format "{{.Status}}" 2>$null
    if ($status -and $status.Contains("Up")) {
        Write-Host "   [OK] ${container}: $status" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] ${container}: NO EJECUTÁNDOSE" -ForegroundColor Red
    }
}

Write-Host "`n[9/10] Test DETALLADO de conexión MongoDB..." -ForegroundColor Yellow
try {
    Write-Host "   Intentando comando ping básico..." -ForegroundColor Gray
    $mongoPing = docker exec ticketing-mongodb mongosh --eval 'db.adminCommand("ping")' 2>&1
    Write-Host "   Salida completa MongoDB:" -ForegroundColor Gray
    Write-Host "$mongoPing" -ForegroundColor Cyan
    
    if ($mongoPing -and ($mongoPing.Contains('"ok" : 1') -or $mongoPing.Contains('ok: 1'))) {
        Write-Host "   [OK] MongoDB: Conectado y respondiendo correctamente" -ForegroundColor Green
        
        # Test adicional con autenticación
        Write-Host "   Probando con autenticación..." -ForegroundColor Gray
        $mongoAuthTest = docker exec ticketing-mongodb mongosh "mongodb://admin:admin123@localhost:27017/ticketing?authSource=admin" --eval 'db.stats()' 2>&1
        if ($mongoAuthTest -and !$mongoAuthTest.Contains("MongoServerError")) {
            Write-Host "   [OK] MongoDB: Autenticación funcionando" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] MongoDB: Problema con autenticación" -ForegroundColor Yellow
            Write-Host "   Salida auth: $mongoAuthTest" -ForegroundColor Red
        }
        
    } else {
        Write-Host "   [ERROR] MongoDB: NO responde correctamente" -ForegroundColor Red
        
        # Diagnósticos adicionales
        Write-Host "   Verificando logs del contenedor MongoDB..." -ForegroundColor Gray
        $mongoLogs = docker logs ticketing-mongodb --tail 20 2>&1
        Write-Host "   Logs MongoDB:" -ForegroundColor Gray
        Write-Host "$mongoLogs" -ForegroundColor Red
    }
} catch {
    Write-Host "   [ERROR] Error crítico probando MongoDB: $_" -ForegroundColor Red
    
    # Verificar si el contenedor existe
    $containerExists = docker ps -a --filter "name=ticketing-mongodb" --format "{{.Names}}" 2>$null
    if ($containerExists) {
        Write-Host "   El contenedor existe, verificando logs..." -ForegroundColor Yellow
        $errorLogs = docker logs ticketing-mongodb --tail 10 2>&1
        Write-Host "   Logs de error:" -ForegroundColor Red
        Write-Host "$errorLogs" -ForegroundColor Red
    } else {
        Write-Host "   [ERROR CRÍTICO] El contenedor ticketing-mongodb no existe!" -ForegroundColor Red
    }
}

Write-Host "`n[10/10] Test DETALLADO de conexión PostgreSQL..." -ForegroundColor Yellow
try {
    Write-Host "   Intentando listar bases de datos..." -ForegroundColor Gray
    $pgTest = docker exec ticketing-postgres psql -U admin -d ticketing -c '\l' 2>&1
    Write-Host "   Salida PostgreSQL:" -ForegroundColor Gray
    Write-Host "$pgTest" -ForegroundColor Cyan
    
    if ($pgTest -and !$pgTest.Contains("FATAL") -and !$pgTest.Contains("ERROR")) {
        Write-Host "   [OK] PostgreSQL: Conectado y operativo" -ForegroundColor Green
        
        # Test de tablas
        $tableTest = docker exec ticketing-postgres psql -U admin -d ticketing -c '\dt' 2>&1
        if ($tableTest) {
            Write-Host "   [OK] PostgreSQL: Tablas accesibles" -ForegroundColor Green
        }
    } else {
        Write-Host "   [ERROR] PostgreSQL: Problemas de conexión" -ForegroundColor Red
    }
} catch {
    Write-Host "   [ERROR] Error probando PostgreSQL: $_" -ForegroundColor Red
}

Write-Host "`n=========================================================================" -ForegroundColor Cyan
Write-Host "                           RESUMEN DIAGNÓSTICO                          " -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan

Write-Host "`nSI VES TODOS LOS [OK] ARRIBA, EJECUTA EL RESTORE:" -ForegroundColor Green
Write-Host '.\restore.ps1 -BackupDate "2025-10-16" -ShowProgress' -ForegroundColor White

Write-Host "`nSI HAY ERRORES, ENVÍA TODA LA SALIDA DE ESTE SCRIPT PARA AYUDA" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Cyan

# Regresar al directorio original
try {
    Pop-Location
} catch {
    # Ignorar errores si no hay directorio en la pila
}