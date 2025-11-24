# Script para parar o desenvolvimento e voltar ao modo produção
# Uso: .\stop-dev.ps1

Write-Host "🛑 Desativando Live Reload..." -ForegroundColor Yellow
Write-Host ""

# Atualizar capacitor.config.json para remover server.url
$configPath = "capacitor.config.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json

if ($config.server) {
    $config.server.PSObject.Properties.Remove('url')
    $config.server.PSObject.Properties.Remove('cleartext')
}

$json = $config | ConvertTo-Json -Depth 10
$json | Set-Content $configPath -Encoding UTF8

Write-Host "✅ capacitor.config.json atualizado para modo produção" -ForegroundColor Green
Write-Host ""

# Sincronizar
Write-Host "🔄 Sincronizando Capacitor..." -ForegroundColor Cyan
npx cap sync
Write-Host "✅ Pronto! App voltou ao modo produção (arquivos locais)" -ForegroundColor Green

