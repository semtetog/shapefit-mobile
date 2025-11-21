# Script para atualizar ícones e splash screen do app
# Coloque seus arquivos na pasta 'assets-to-update' e execute este script

Write-Host "=== Atualizando Ícones e Splash Screen ===" -ForegroundColor Green
Write-Host ""

$assetsDir = "assets-to-update"
$resDir = "android\app\src\main\res"

# Verificar se a pasta existe
if (-not (Test-Path $assetsDir)) {
    Write-Host "Criando pasta '$assetsDir'..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $assetsDir | Out-Null
    Write-Host ""
    Write-Host "Por favor, coloque seus arquivos na pasta '$assetsDir':" -ForegroundColor Cyan
    Write-Host "  - Ícones: ic_launcher.png, ic_launcher_round.png, ic_launcher_foreground.png" -ForegroundColor Cyan
    Write-Host "  - Splash: splash.png" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Tamanhos necessários:" -ForegroundColor Yellow
    Write-Host "  Ícones:" -ForegroundColor Yellow
    Write-Host "    - mdpi: 48x48px" -ForegroundColor Gray
    Write-Host "    - hdpi: 72x72px" -ForegroundColor Gray
    Write-Host "    - xhdpi: 96x96px" -ForegroundColor Gray
    Write-Host "    - xxhdpi: 144x144px" -ForegroundColor Gray
    Write-Host "    - xxxhdpi: 192x192px" -ForegroundColor Gray
    Write-Host "  Splash:" -ForegroundColor Yellow
    Write-Host "    - Recomendado: 1080x1920px (portrait) ou 1920x1080px (landscape)" -ForegroundColor Gray
    Write-Host ""
    exit
}

# Atualizar ícones
Write-Host "Atualizando ícones..." -ForegroundColor Green
$mipmapDirs = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
$iconFiles = @("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png")

foreach ($mipmap in $mipmapDirs) {
    $targetDir = Join-Path $resDir $mipmap
    if (Test-Path $targetDir) {
        foreach ($iconFile in $iconFiles) {
            $sourceFile = Join-Path $assetsDir $iconFile
            $targetFile = Join-Path $targetDir $iconFile
            if (Test-Path $sourceFile) {
                Copy-Item -Path $sourceFile -Destination $targetFile -Force
                Write-Host "  ✓ Copiado: $iconFile -> $mipmap/" -ForegroundColor Gray
            }
        }
    }
}

# Atualizar splash screen
Write-Host ""
Write-Host "Atualizando splash screen..." -ForegroundColor Green
$splashSource = Join-Path $assetsDir "splash.png"

if (Test-Path $splashSource) {
    # Copiar para drawable principal
    $drawableDirs = @(
        "drawable",
        "drawable-port-mdpi",
        "drawable-port-hdpi",
        "drawable-port-xhdpi",
        "drawable-port-xxhdpi",
        "drawable-port-xxxhdpi",
        "drawable-land-mdpi",
        "drawable-land-hdpi",
        "drawable-land-xhdpi",
        "drawable-land-xxhdpi",
        "drawable-land-xxxhdpi"
    )
    
    foreach ($drawable in $drawableDirs) {
        $targetDir = Join-Path $resDir $drawable
        if (Test-Path $targetDir) {
            $targetFile = Join-Path $targetDir "splash.png"
            Copy-Item -Path $splashSource -Destination $targetFile -Force
            Write-Host "  ✓ Copiado: splash.png -> $drawable/" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  ⚠ splash.png não encontrado em $assetsDir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Concluído! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Execute 'npx cap sync' para sincronizar as mudanças." -ForegroundColor Cyan


