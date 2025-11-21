# Script para limpar build e cache

Write-Host "Limpando build e cache..." -ForegroundColor Yellow

# Limpar www
if (Test-Path "www") {
    Remove-Item -Recurse -Force "www" -ErrorAction SilentlyContinue
}

# Limpar node_modules
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

# Limpar android
if (Test-Path "android") {
    Remove-Item -Recurse -Force "android" -ErrorAction SilentlyContinue
}

Write-Host "Limpeza concluida!" -ForegroundColor Green


