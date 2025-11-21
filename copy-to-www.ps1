# Script para copiar arquivos necessários para www

Write-Host "=== Copiando arquivos para www ===" -ForegroundColor Cyan
Write-Host ""

# Criar diretório www
Write-Host "[1/5] Criando diretorio www..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "www" | Out-Null
Write-Host "Diretorio criado" -ForegroundColor Green
Write-Host ""

# Copiar arquivos HTML principais
Write-Host "[2/5] Copiando arquivos HTML..." -ForegroundColor Yellow
$sourceDir = "..\"
$htmlFiles = @(
    "main_app.html",
    "auth\login.html",
    "auth\register.html",
    "diary.html",
    "add_food_to_diary.html",
    "scan_barcode.html",
    "create_custom_food.html",
    "edit_profile.html",
    "edit_meal.html",
    "explore_recipes.html",
    "favorite_recipes.html",
    "view_recipe.html",
    "progress.html",
    "routine.html",
    "ranking.html",
    "points_history.html",
    "measurements_progress.html",
    "more_options.html",
    "onboarding\onboarding.html"
)

foreach ($file in $htmlFiles) {
    $sourcePath = Join-Path $sourceDir $file
    $destPath = Join-Path "www" $file
    $destDir = Split-Path $destPath -Parent
    
    if (Test-Path $sourcePath) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
        Copy-Item $sourcePath -Destination $destPath -Force
        Write-Host "  Copiado: $file" -ForegroundColor Gray
    }
}
Write-Host "HTML copiado" -ForegroundColor Green
Write-Host ""

# Copiar assets (excluindo imagens grandes que devem ser carregadas do servidor)
Write-Host "[3/5] Copiando assets (CSS, JS, imagens)..." -ForegroundColor Yellow
if (Test-Path "$sourceDir\assets") {
    # Criar estrutura de diretórios
    New-Item -ItemType Directory -Force -Path "www\assets" | Out-Null
    
    # Copiar tudo exceto recipes e progress
    Get-ChildItem -Path "$sourceDir\assets" -Exclude "recipes","progress" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "www\assets\$($_.Name)" -Recurse -Force
    }
    
    # Copiar images mas excluir recipes e progress
    if (Test-Path "$sourceDir\assets\images") {
        New-Item -ItemType Directory -Force -Path "www\assets\images" | Out-Null
        Get-ChildItem -Path "$sourceDir\assets\images" -Exclude "recipes","progress" | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination "www\assets\images\$($_.Name)" -Recurse -Force
        }
        Write-Host "  Imagens copiadas (recipes e progress excluídas - serão carregadas do servidor)" -ForegroundColor Gray
    }
    
    Write-Host "Assets copiados (imagens grandes excluídas)" -ForegroundColor Green
}
Write-Host ""

# Copiar arquivos JSON de banner
Write-Host "[4/5] Copiando arquivos JSON de banner..." -ForegroundColor Yellow
$bannerFiles = @("banner_receitas.json", "banner2.json", "banner3.json", "banner4.json")
foreach ($banner in $bannerFiles) {
    $sourcePath = Join-Path $sourceDir $banner
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath -Destination "www\$banner" -Force
        Write-Host "  Copiado: $banner" -ForegroundColor Gray
    }
}
Write-Host "Banners copiados" -ForegroundColor Green
Write-Host ""

# Copiar manifest e service worker
Write-Host "[5/5] Copiando manifest e service worker..." -ForegroundColor Yellow
if (Test-Path "$sourceDir\manifest.json") {
    Copy-Item "$sourceDir\manifest.json" -Destination "www\manifest.json" -Force
}
if (Test-Path "$sourceDir\sw.js") {
    Copy-Item "$sourceDir\sw.js" -Destination "www\sw.js" -Force
}
Write-Host "Manifest e SW copiados" -ForegroundColor Green
Write-Host ""

# Criar index.html
Write-Host "Criando index.html..." -ForegroundColor Yellow
$indexContent = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShapeFit</title>
    <script src="./www-config.js"></script>
    <script>
        // Redirecionar para main_app.html
        window.location.href = './main_app.html';
    </script>
</head>
<body>
    <p>Carregando...</p>
</body>
</html>
"@
Set-Content -Path "www\index.html" -Value $indexContent -Encoding UTF8
Write-Host "index.html criado" -ForegroundColor Green
Write-Host ""

# Adicionar www-config.js em todos os HTML
Write-Host "Adicionando config mobile nos arquivos HTML..." -ForegroundColor Yellow
$htmlFilesInWww = Get-ChildItem -Path "www" -Filter "*.html" -Recurse
$configScript = '    <script src="./www-config.js"></script>'

foreach ($file in $htmlFilesInWww) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -notmatch "www-config\.js") {
        # Adicionar após <head>
        if ($content -match "(<head[^>]*>)") {
            $newContent = $content -replace "(<head[^>]*>)", "`$1`n$configScript"
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        }
    }
}
Write-Host "Config adicionado" -ForegroundColor Green
Write-Host ""

Write-Host "=== Concluido ===" -ForegroundColor Green
Write-Host ""
Write-Host "Arquivos copiados para www/" -ForegroundColor Cyan
Write-Host "Execute: npm install" -ForegroundColor Yellow
Write-Host "Depois: npm run build" -ForegroundColor Yellow

