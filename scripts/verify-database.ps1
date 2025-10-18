# ========================================
# SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
# Muestra totales de todas las colecciones
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICACIÓN DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📊 POSTGRESQL - Eventos y Venues" -ForegroundColor Yellow
Write-Host "===================================`n" -ForegroundColor Yellow

# Eventos
$events = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Event";' 2>$null
if ($events) { Write-Host "  📅 Eventos:           $($events.Trim())" -ForegroundColor Green } else { Write-Host "  📅 Eventos:           0" -ForegroundColor Yellow }

# Venues
$venues = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Venue";' 2>$null
if ($venues) { Write-Host "  🏟️  Venues:            $($venues.Trim())" -ForegroundColor Green } else { Write-Host "  🏟️  Venues:            0" -ForegroundColor Yellow }

# Categorías
$categories = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "EventCategory";' 2>$null
if ($categories) { Write-Host "  📁 Categorías:        $($categories.Trim())" -ForegroundColor Green } else { Write-Host "  📁 Categorías:        0" -ForegroundColor Yellow }

# Subcategorías
$subcategories = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "EventSubcategory";' 2>$null
if ($subcategories) { Write-Host "  📂 Subcategorías:     $($subcategories.Trim())" -ForegroundColor Green } else { Write-Host "  📂 Subcategorías:     0" -ForegroundColor Yellow }

# Orders
$orders = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Order";' 2>$null
if ($orders) { Write-Host "  🛒 Órdenes:           $($orders.Trim())" -ForegroundColor Green } else { Write-Host "  🛒 Órdenes:           0" -ForegroundColor Yellow }

# Tickets
$tickets = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM "Ticket";' 2>$null
if ($tickets) { Write-Host "  🎫 Tickets:           $($tickets.Trim())" -ForegroundColor Green } else { Write-Host "  🎫 Tickets:           0" -ForegroundColor Yellow }

Write-Host "`n📊 POSTGRESQL - Administración" -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

# Admins
$admins = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM admins;' 2>$null
if ($admins) { Write-Host "  👤 Administradores:   $($admins.Trim())" -ForegroundColor Green } else { Write-Host "  👤 Administradores:   0" -ForegroundColor Yellow }

# Companies
$companies = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM companies;' 2>$null
if ($companies) { Write-Host "  🏢 Compañías:         $($companies.Trim())" -ForegroundColor Green } else { Write-Host "  🏢 Compañías:         0" -ForegroundColor Yellow }

# Company Admins
$companyAdmins = docker exec ticketing-postgres psql -U admin -d ticketing -t -c 'SELECT COUNT(*) FROM company_admins;' 2>$null
if ($companyAdmins) { Write-Host "  👔 Company Admins:    $($companyAdmins.Trim())" -ForegroundColor Green } else { Write-Host "  👔 Company Admins:    0" -ForegroundColor Yellow }

Write-Host "`n📊 MONGODB - Base de datos: ticketing (Usuarios)" -ForegroundColor Yellow
Write-Host "=================================================`n" -ForegroundColor Yellow

# Users
$users = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.users.countDocuments()" --quiet 2>$null
Write-Host "  👥 Usuarios:          $($users.Trim())" -ForegroundColor Green

# Likes
$likes = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.likes.countDocuments()" --quiet 2>$null
Write-Host "  ❤️  Likes:             $($likes.Trim())" -ForegroundColor Green

# Event Likes
$eventLikes = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.eventlikes.countDocuments()" --quiet 2>$null
Write-Host "  💚 Event Likes:       $($eventLikes.Trim())" -ForegroundColor Green

# Comments
$comments = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.eventcomments.countDocuments()" --quiet 2>$null
Write-Host "  💬 Comentarios:       $($comments.Trim())" -ForegroundColor Green

# User Follows
$follows = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.userfollows.countDocuments()" --quiet 2>$null
Write-Host "  👫 Seguidores:        $($follows.Trim())" -ForegroundColor Green

# Tickets
$userTickets = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('ticketing'); db.tickets.countDocuments()" --quiet 2>$null
Write-Host "  🎫 Tickets Usuario:   $($userTickets.Trim())" -ForegroundColor Green

Write-Host "`n📊 MONGODB - Base de datos: festival_services" -ForegroundColor Yellow
Write-Host "===============================================`n" -ForegroundColor Yellow

# Restaurantes
$restaurants = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('festival_services'); db.restaurants.countDocuments()" --quiet 2>$null
Write-Host "  🍽️  Restaurantes:      $($restaurants.Trim())" -ForegroundColor Green

# Viajes
$trips = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('festival_services'); db.trips.countDocuments()" --quiet 2>$null
Write-Host "  🚌 Viajes:            $($trips.Trim())" -ForegroundColor Green

# Productos (Merchandising)
$products = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('festival_services'); db.products.countDocuments()" --quiet 2>$null
Write-Host "  👕 Merchandising:     $($products.Trim())" -ForegroundColor Green

# Bookings
$bookings = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('festival_services'); db.bookings.countDocuments()" --quiet 2>$null
Write-Host "  📝 Reservas Viajes:   $($bookings.Trim())" -ForegroundColor Green

# Reservations
$reservations = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('festival_services'); db.reservations.countDocuments()" --quiet 2>$null
Write-Host "  🍴 Reservas Rest.:    $($reservations.Trim())" -ForegroundColor Green

# Orders Merchandising
$merchOrders = docker exec ticketing-mongodb mongosh --username admin --password admin123 --authenticationDatabase admin --eval "db = db.getSiblingDB('festival_services'); db.orders.countDocuments()" --quiet 2>$null
Write-Host "  🛍️  Órdenes Merch:     $($merchOrders.Trim())" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN TOTAL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$eventsCount = if ($events) { [int]($events -join '').Trim() } else { 0 }
$venuesCount = if ($venues) { [int]($venues -join '').Trim() } else { 0 }
$categoriesCount = if ($categories) { [int]($categories -join '').Trim() } else { 0 }
$subcategoriesCount = if ($subcategories) { [int]($subcategories -join '').Trim() } else { 0 }
$adminsCount = if ($admins) { [int]($admins -join '').Trim() } else { 0 }
$ordersCount = if ($orders) { [int]($orders -join '').Trim() } else { 0 }
$ticketsCount = if ($tickets) { [int]($tickets -join '').Trim() } else { 0 }
$companiesCount = if ($companies) { [int]($companies -join '').Trim() } else { 0 }
$companyAdminsCount = if ($companyAdmins) { [int]($companyAdmins -join '').Trim() } else { 0 }

$totalPostgres = $eventsCount + $venuesCount + $categoriesCount + $subcategoriesCount + $adminsCount + $ordersCount + $ticketsCount + $companiesCount + $companyAdminsCount

$usersCount = if ($users) { [int]$users.Trim() } else { 0 }
$likesCount = if ($likes) { [int]$likes.Trim() } else { 0 }
$eventLikesCount = if ($eventLikes) { [int]$eventLikes.Trim() } else { 0 }
$commentsCount = if ($comments) { [int]$comments.Trim() } else { 0 }
$followsCount = if ($follows) { [int]$follows.Trim() } else { 0 }
$userTicketsCount = if ($userTickets) { [int]$userTickets.Trim() } else { 0 }
$restaurantsCount = if ($restaurants) { [int]$restaurants.Trim() } else { 0 }
$tripsCount = if ($trips) { [int]$trips.Trim() } else { 0 }
$productsCount = if ($products) { [int]$products.Trim() } else { 0 }
$bookingsCount = if ($bookings) { [int]$bookings.Trim() } else { 0 }
$reservationsCount = if ($reservations) { [int]$reservations.Trim() } else { 0 }
$merchOrdersCount = if ($merchOrders) { [int]$merchOrders.Trim() } else { 0 }

$totalMongo = $usersCount + $likesCount + $eventLikesCount + $commentsCount + $followsCount + $userTicketsCount + $restaurantsCount + $tripsCount + $productsCount + $bookingsCount + $reservationsCount + $merchOrdersCount
$totalGeneral = $totalPostgres + $totalMongo

Write-Host "  📊 Total PostgreSQL:  $totalPostgres registros" -ForegroundColor Cyan
Write-Host "  📊 Total MongoDB:     $totalMongo documentos" -ForegroundColor Cyan
Write-Host "  📊 TOTAL GENERAL:     $totalGeneral" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Verificación completada" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
