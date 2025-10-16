# ========================================
# SCRIPT DE VERIFICACIÓN POST-RESTORE
# Sistema de Ticketing - Verify Restore
# ========================================

param(
    [switch]$Detailed = $false
)

# Colores para output
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
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "========================================" "Cyan"
    Write-ColorOutput $Title "Cyan"
    Write-ColorOutput "========================================" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "✗ $Message" "Red"
}

function Test-Container {
    param([string]$ContainerName)
    try {
        $status = docker inspect --format='{{.State.Running}}' $ContainerName 2>$null
        return $status -eq "true"
    } catch {
        return $false
    }
}

Write-Header "VERIFICACIÓN DEL SISTEMA RESTAURADO"
Write-Host "Fecha: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
Write-Host ""

# Verificar contenedores
Write-ColorOutput "🐳 ESTADO DE CONTENEDORES:" "Blue"
$containers = @("ticketing-postgres", "ticketing-mongodb", "ticketing-rabbitmq", "ticketing-admin", "ticketing-user-service", "ticketing-festival-services")

foreach ($container in $containers) {
    if (Test-Container $container) {
        Write-ColorOutput "✓ ${container}: Ejecutándose" "Green"
    } else {
        Write-ColorOutput "✗ ${container}: Detenido o error" "Red"
    }
}

# Verificar PostgreSQL
Write-Header "VERIFICACIÓN POSTGRESQL"

Write-ColorOutput "📊 Base de datos 'ticketing':" "Blue"
try {
    $events = docker exec ticketing-postgres psql -U ticketing_user -d ticketing -t -c "SELECT COUNT(*) FROM public.\"Event\";" 2>$null
    $venues = docker exec ticketing-postgres psql -U ticketing_user -d ticketing -t -c "SELECT COUNT(*) FROM public.\"Venue\";" 2>$null
    $categories = docker exec ticketing-postgres psql -U ticketing_user -d ticketing -t -c "SELECT COUNT(*) FROM public.\"EventCategory\";" 2>$null
    $subcategories = docker exec ticketing-postgres psql -U ticketing_user -d ticketing -t -c "SELECT COUNT(*) FROM public.\"EventSubcategory\";" 2>$null
    $admins = docker exec ticketing-postgres psql -U ticketing_user -d ticketing -t -c "SELECT COUNT(*) FROM public.admins;" 2>$null
    
    Write-Success "Eventos: $($events.Trim())"
    Write-Success "Venues: $($venues.Trim())"
    Write-Success "Categorías: $($categories.Trim())"
    Write-Success "Subcategorías: $($subcategories.Trim())"
    Write-Success "Administradores: $($admins.Trim())"
} catch {
    Write-Error "Error verificando base 'ticketing'"
}

Write-ColorOutput "📊 Base de datos 'ticketing_admin':" "Blue"
try {
    $eventsAdmin = docker exec ticketing-postgres psql -U ticketing_user -d ticketing_admin -t -c "SELECT COUNT(*) FROM public.\"Event\";" 2>$null
    $venuesAdmin = docker exec ticketing-postgres psql -U ticketing_user -d ticketing_admin -t -c "SELECT COUNT(*) FROM public.\"Venue\";" 2>$null
    
    Write-Success "Eventos Admin: $($eventsAdmin.Trim())"
    Write-Success "Venues Admin: $($venuesAdmin.Trim())"
} catch {
    Write-Error "Error verificando base 'ticketing_admin'"
}

Write-ColorOutput "📊 Base de datos 'approvals_db':" "Blue"
try {
    $approvals = docker exec ticketing-postgres psql -U ticketing_user -d approvals_db -t -c "SELECT COUNT(*) FROM public.\"Approval\";" 2>$null
    Write-Success "Aprobaciones: $($approvals.Trim())"
} catch {
    Write-Error "Error verificando base 'approvals_db'"
}

# Verificar MongoDB
Write-Header "VERIFICACIÓN MONGODB"

Write-ColorOutput "📊 Bases de datos MongoDB:" "Blue"
try {
    $databases = docker exec ticketing-mongodb mongosh --quiet --eval "db.adminCommand('listDatabases').databases.map(d => d.name).join(', ')" 2>$null
    Write-Success "Bases de datos: $databases"
    
    # Verificar colección de usuarios
    $users = docker exec ticketing-mongodb mongosh ticketing --quiet --eval "db.users.countDocuments()" 2>$null
    Write-Success "Usuarios en ticketing: $users"
    
    # Verificar colecciones en festival_services
    $collections = docker exec ticketing-mongodb mongosh festival_services --quiet --eval "db.getCollectionNames().length" 2>$null
    Write-Success "Colecciones en festival_services: $collections"
    
} catch {
    Write-Error "Error verificando MongoDB"
}

# Verificar APIs
Write-Header "VERIFICACIÓN DE APIS"

$apis = @(
    @{ Name = "Admin API"; Url = "http://localhost:3001/health"; Port = 3001 },
    @{ Name = "User Service"; Url = "http://localhost:3002/health"; Port = 3002 },
    @{ Name = "Festival Services"; Url = "http://localhost:3003/health"; Port = 3003 }
)

foreach ($api in $apis) {
    try {
        $response = Invoke-WebRequest -Uri $api.Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "$($api.Name): Respondiendo correctamente"
        } else {
            Write-Error "$($api.Name): Respuesta inesperada ($($response.StatusCode))"
        }
    } catch {
        Write-Error "$($api.Name): No responde (puerto $($api.Port))"
    }
}

# Verificar Frontend
Write-ColorOutput "🌐 Frontend Angular:" "Blue"
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:4200" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Success "Frontend: Disponible en http://localhost:4200"
    } else {
        Write-Error "Frontend: Respuesta inesperada"
    }
} catch {
    Write-Error "Frontend: No disponible en puerto 4200"
}

# Verificación detallada (opcional)
if ($Detailed) {
    Write-Header "VERIFICACIÓN DETALLADA"
    
    Write-ColorOutput "📋 Últimos eventos creados:" "Blue"
    try {
        $latestEvents = docker exec ticketing-postgres psql -U ticketing_user -d ticketing -c "SELECT title, date, created_at FROM public.\"Event\" ORDER BY created_at DESC LIMIT 5;" 2>$null
        Write-Host $latestEvents
    } catch {
        Write-Error "Error obteniendo eventos recientes"
    }
    
    Write-ColorOutput "📋 Administradores registrados:" "Blue"
    try {
        $adminsList = docker exec ticketing-postgres psql -U ticketing_user -d ticketing -c "SELECT email, first_name, last_name, role FROM public.admins;" 2>$null
        Write-Host $adminsList
    } catch {
        Write-Error "Error obteniendo lista de administradores"
    }
}

# Resumen final
Write-Header "RESUMEN DE VERIFICACIÓN"

# Calcular totales
try {
    $totalEvents = [int](docker exec ticketing-postgres psql -U ticketing_user -d ticketing -t -c "SELECT COUNT(*) FROM public.\"Event\";" 2>$null).Trim()
    $totalEventsAdmin = [int](docker exec ticketing-postgres psql -U ticketing_user -d ticketing_admin -t -c "SELECT COUNT(*) FROM public.\"Event\";" 2>$null).Trim()
    $totalVenues = [int](docker exec ticketing-postgres psql -U ticketing_user -d ticketing -t -c "SELECT COUNT(*) FROM public.\"Venue\";" 2>$null).Trim()
    $totalVenuesAdmin = [int](docker exec ticketing-postgres psql -U ticketing_user -d ticketing_admin -t -c "SELECT COUNT(*) FROM public.\"Venue\";" 2>$null).Trim()
    
    Write-ColorOutput "📊 DATOS RESTAURADOS:" "Green"
    Write-Host "   • Total eventos: $($totalEvents + $totalEventsAdmin)"
    Write-Host "   • Total venues: $($totalVenues + $totalVenuesAdmin)"
    Write-Host "   • Eventos principales: $totalEvents"
    Write-Host "   • Eventos admin: $totalEventsAdmin"
    Write-Host "   • Venues principales: $totalVenues"
    Write-Host "   • Venues admin: $totalVenuesAdmin"
} catch {
    Write-Error "Error calculando totales"
}

Write-ColorOutput "🔗 ENLACES DEL SISTEMA:" "Blue"
Write-Host "   • Frontend: http://localhost:4200"
Write-Host "   • Admin API: http://localhost:3001"
Write-Host "   • User API: http://localhost:3002"
Write-Host "   • Festival API: http://localhost:3003"

Write-Host ""
Write-ColorOutput "✅ Verificación completada" "Green"
Write-Host ""