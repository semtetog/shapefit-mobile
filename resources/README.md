# Recursos do App

Coloque aqui suas imagens base para gerar automaticamente os ícones e splash screens:

## Arquivos necessários:

1. **icon.png** - Ícone do aplicativo
   - Tamanho mínimo: **1024x1024 pixels**
   - Formato: PNG
   - Fundo transparente recomendado

2. **splash.png** - Splash screen
   - Tamanho mínimo: **2732x2732 pixels**
   - Formato: PNG
   - O logo deve estar centralizado

## Como usar:

1. Coloque os arquivos `icon.png` e `splash.png` nesta pasta (`resources/`)

2. Execute o comando para gerar automaticamente todos os tamanhos:
   ```bash
   npm run generate:assets
   ```
   ou
   ```bash
   npx capacitor-assets generate
   ```

3. Sincronize com o projeto:
   ```bash
   npm run sync
   ```
   ou
   ```bash
   npx cap sync
   ```

O Capacitor irá gerar automaticamente todos os tamanhos necessários para Android (e iOS se configurado) e colocá-los nos diretórios corretos!


