# Script para reiniciar todo el sistema limpiamente

Write-Host "🔄 REINICIANDO SISTEMA COMPLETO..." -ForegroundColor Cyan
Write-Host ""

# 1. Parar todos los servicios
Write-Host "1️⃣ Parando servicios..." -ForegroundColor Yellow
docker-compose down
Start-Sleep -Seconds 2

# 2. Levantar Docker
Write-Host ""
Write-Host "2️⃣ Levantando Docker..." -ForegroundColor Yellow
docker-compose up -d
Start-Sleep -Seconds 5

# 3. Regenerar Prisma Client
Write-Host ""
Write-Host "3️⃣ Regenerando Prisma Client..." -ForegroundColor Yellow
Set-Location backend\admin
npx prisma generate
Set-Location ..\..

# 4. Iniciar Admin Service
Write-Host ""
Write-Host "4️⃣ Iniciando Admin Service..." -ForegroundColor Yellow
Write-Host "   Ejecuta en otra terminal: cd backend\admin && npm run dev" -ForegroundColor Cyan

# 5. Iniciar User Service
Write-Host ""
Write-Host "5️⃣ Iniciando User Service..." -ForegroundColor Yellow
Write-Host "   Ejecuta en otra terminal: cd backend\users && npm run dev" -ForegroundColor Cyan

# 6. Iniciar Frontend
Write-Host ""
Write-Host "6️⃣ Iniciando Frontend..." -ForegroundColor Yellow
Write-Host "   Ejecuta en otra terminal: cd frontend\ticketing-app && npm start" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Docker levantado y Prisma regenerado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor White
Write-Host "   1. Abre 3 terminales nuevas" -ForegroundColor White
Write-Host "   2. Terminal 1: cd backend\admin && npm run dev" -ForegroundColor White
Write-Host "   3. Terminal 2: cd backend\users && npm run dev" -ForegroundColor White
Write-Host "   4. Terminal 3: cd frontend\ticketing-app && npm start" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Cuando todo esté corriendo, recarga el navegador (F5)" -ForegroundColor Green
