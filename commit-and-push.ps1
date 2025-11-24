# Script para fazer commit e push automático
param(
    [string]$Message = ""
)

# Se não foi fornecida uma mensagem, usar uma padrão com timestamp
if ([string]::IsNullOrEmpty($Message)) {
    $Message = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

Write-Host "Adicionando arquivos ao staging..." -ForegroundColor Cyan
git add .

$status = git status --porcelain
if ($status) {
    Write-Host "Arquivos modificados encontrados" -ForegroundColor Green
    Write-Host "Fazendo commit: $Message" -ForegroundColor Cyan
    
    # Usar aspas simples para evitar problemas com caracteres especiais
    $commitMessage = $Message -replace "'", "''"
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Fazendo push para origin/main..." -ForegroundColor Cyan
        git push origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Commit e push realizados com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "Erro ao fazer push. Verifique as mensagens acima." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Erro ao fazer commit. Verifique as mensagens acima." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Nenhuma alteracao para commitar." -ForegroundColor Yellow
}
