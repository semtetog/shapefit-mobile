# Script para iniciar servidor de desenvolvimento com Live Reload
# Para usar: .\dev-server.ps1

Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Green

# Obter IP local
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" } | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    Write-Host "❌ Não foi possível detectar o IP local. Configure manualmente no capacitor.config.json" -ForegroundColor Red
    exit 1
}

Write-Host "📱 IP detectado: $ipAddress" -ForegroundColor Cyan
Write-Host "🌐 Servidor será iniciado em: http://$ipAddress:8100" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "1. Atualize o capacitor.config.json com o IP acima" -ForegroundColor Yellow
Write-Host "2. Execute: npx cap sync" -ForegroundColor Yellow
Write-Host "3. Execute: npx cap run ios --livereload --external" -ForegroundColor Yellow
Write-Host ""

# Verificar se http-server está instalado
$httpServerInstalled = Get-Command npx -ErrorAction SilentlyContinue
if (-not $httpServerInstalled) {
    Write-Host "📦 Instalando http-server..." -ForegroundColor Yellow
    npm install -g http-server
}

# Iniciar servidor
Write-Host "✅ Iniciando servidor HTTP na porta 8100..." -ForegroundColor Green
Write-Host "   Pressione Ctrl+C para parar" -ForegroundColor Gray
Write-Host ""

npx http-server www -p 8100 -c-1 --cors

