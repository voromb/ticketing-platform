# Script para limpiar archivos temporales
Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Yellow
Write-Host ""

# Lista de archivos temporales a eliminar
$tempFiles = @(
    "src\server-minimal.ts",
    "src\index-minimal.ts",
    "fix-project.ps1",
    "fix-index.ps1",
    "fix-logger.ps1",
    "fix-env.ps1",
    "fix-auth-middleware.ps1",
    "fix-emojis.ps1"
)

$deletedCount = 0

foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Eliminado: $file" -ForegroundColor Green
        $deletedCount++
    } else {
        Write-Host "  - No existe: $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Limpieza completada!" -ForegroundColor Green
Write-Host "   $deletedCount archivos eliminados" -ForegroundColor Cyan

# Opcional: Mostrar estructura actual
Write-Host ""
Write-Host "📁 Estructura actual de src/:" -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -File | Select-Object -ExpandProperty FullName | ForEach-Object {
    $relativePath = $_.Replace((Get-Location).Path + "\", "")
    Write-Host "   $relativePath" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Tu proyecto está limpio y organizado!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Archivos importantes que conservamos:" -ForegroundColor Yellow
Write-Host "   - src/server.ts (servidor principal)" -ForegroundColor White
Write-Host "   - src/index.ts (punto de entrada)" -ForegroundColor White
Write-Host "   - src/config/env.ts (configuración)" -ForegroundColor White
Write-Host "   - src/routes/* (todas las rutas)" -ForegroundColor White
Write-Host "   - src/middlewares/* (auth y audit)" -ForegroundColor White
Write-Host "   - src/controllers/* (controladores)" -ForegroundColor White
Write-Host "   - src/services/* (RabbitMQ)" -ForegroundColor White
Write-Host "   - .env (variables de entorno)" -ForegroundColor White