# Script para iniciar desenvolvimento com Live Reload no iPhone
# Uso: .\start-dev.ps1

Write-Host "🚀 Configurando Live Reload para iPhone..." -ForegroundColor Green
Write-Host ""

# 1. Detectar IP local
Write-Host "📡 Detectando IP local..." -ForegroundColor Cyan
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -like "192.168.*" -or 
    $_.IPAddress -like "10.*" -or 
    $_.IPAddress -like "172.16.*" 
} | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    Write-Host "❌ Não foi possível detectar IP local automaticamente." -ForegroundColor Red
    Write-Host "   Por favor, digite seu IP manualmente:" -ForegroundColor Yellow
    $ipAddress = Read-Host "   IP (ex: 192.168.1.100)"
}

Write-Host "✅ IP detectado: $ipAddress" -ForegroundColor Green
Write-Host ""

# 2. Atualizar capacitor.config.json
Write-Host "⚙️  Atualizando capacitor.config.json..." -ForegroundColor Cyan

$configPath = "capacitor.config.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json

# Remover comentários (JSON não suporta comentários nativos, então vamos fazer diferente)
if (-not $config.server) {
    $config.server = @{}
}

$config.server.url = "http://$ipAddress:8100"
$config.server.cleartext = $true

# Converter de volta para JSON (sem comentários)
$json = $config | ConvertTo-Json -Depth 10
$json | Set-Content $configPath -Encoding UTF8

Write-Host "✅ capacitor.config.json atualizado!" -ForegroundColor Green
Write-Host ""

# 3. Sincronizar Capacitor
Write-Host "🔄 Sincronizando Capacitor..." -ForegroundColor Cyan
npx cap sync
Write-Host "✅ Sincronização concluída!" -ForegroundColor Green
Write-Host ""

# 4. Instruções
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📱 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "OPÇÃO 1: Testar no Navegador (Mais Rápido)" -ForegroundColor Green
Write-Host "   Abra: http://localhost:8100" -ForegroundColor White
Write-Host ""
Write-Host "OPÇÃO 2: Testar no iPhone como PWA" -ForegroundColor Green
Write-Host "   1. Certifique-se de que seu iPhone está na MESMA rede WiFi" -ForegroundColor White
Write-Host "   2. No iPhone (Safari), abra: http://$ipAddress:8100" -ForegroundColor White
Write-Host "   3. Adicione à Tela de Início (compartilhar > adicionar à tela inicial)" -ForegroundColor White
Write-Host "   4. Funciona quase como app nativo!" -ForegroundColor White
Write-Host ""
Write-Host "OPÇÃO 3: Android (Windows)" -ForegroundColor Green
Write-Host "   1. Abra Android Studio" -ForegroundColor White
Write-Host "   2. Rode o app no Android" -ForegroundColor White
Write-Host "   3. As mudanças serão recarregadas automaticamente!" -ForegroundColor White
Write-Host ""
Write-Host "OPÇÃO 4: iOS (Precisa Mac)" -ForegroundColor Yellow
Write-Host "   ⚠️  Xcode só roda no macOS" -ForegroundColor White
Write-Host "   Use Mac na nuvem (MacStadium, AWS Mac, etc)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - Mantenha este terminal aberto" -ForegroundColor White
Write-Host "   - O servidor precisa estar rodando para funcionar" -ForegroundColor White
Write-Host "   - Pressione Ctrl+C para parar o servidor" -ForegroundColor White
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# 5. Iniciar servidor
Write-Host "🌐 Iniciando servidor HTTP na porta 8100..." -ForegroundColor Green
Write-Host "   Pressione Ctrl+C para parar" -ForegroundColor Gray
Write-Host ""

# Verificar se http-server está disponível
try {
    npx http-server www -p 8100 -c-1 --cors
} catch {
    Write-Host "❌ Erro ao iniciar servidor. Instalando http-server..." -ForegroundColor Red
    npm install -g http-server
    http-server www -p 8100 -c-1 --cors
}

