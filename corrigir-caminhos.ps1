# Script para corrigir caminhos do www-config.js

Write-Host "Corrigindo caminhos do www-config.js..." -ForegroundColor Yellow

# Arquivos em subdiretórios que precisam usar ../
$files = @(
    "www\auth\login.html",
    "www\auth\register.html",
    "www\onboarding\onboarding.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = $content -replace 'src="\./www-config\.js"', 'src="../www-config.js"'
        $content = $content -replace "src='\./www-config\.js'", "src='../www-config.js'"
        Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  Corrigido: $file" -ForegroundColor Gray
    }
}

Write-Host "Caminhos corrigidos!" -ForegroundColor Green


