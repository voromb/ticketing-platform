$body = @{
    email = "admin.spain.restaurants@festival.com"
    password = "Admin123!"
} | ConvertTo-Json

Write-Host "Testing login for: admin.spain.restaurants@festival.com" -ForegroundColor Cyan
Write-Host "URL: http://localhost:3003/api/auth/login" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3003/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "`n✅ LOGIN EXITOSO!" -ForegroundColor Green
    Write-Host "`nRespuesta:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`n❌ ERROR EN LOGIN" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
