# 📱 ShapeFit - App Android

Projeto limpo e organizado para o app Android do ShapeFit.

## 🚀 Setup Inicial

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Copiar arquivos para www:**
   ```bash
   npm run build
   ```

3. **Abrir no Android Studio:**
   ```bash
   npm run open:android
   ```

## 📋 Estrutura

```
shapefit-android-app/
├── www/                    # Arquivos web (gerado pelo build)
├── android/                # Projeto Android nativo (gerado pelo Capacitor)
├── capacitor.config.json   # Configuração do Capacitor
├── package.json           # Dependências
├── www-config.js          # Configuração de URL para mobile
└── copy-to-www.ps1        # Script para copiar arquivos
```

## 🔧 Comandos

- `npm install` - Instalar dependências
- `npm run build` - Copiar arquivos e sincronizar com Capacitor
- `npm run sync` - Sincronizar apenas (após mudanças)
- `npm run open:android` - Abrir no Android Studio
- `npm run clean` - Limpar tudo (www, node_modules, android)

## ⚙️ Configuração

- **URL Base**: `https://appshapefit.com` (configurado em `www-config.js`)
- **App ID**: `com.shapefit.app`
- **App Name**: `ShapeFit`

## 📝 Notas

- Os arquivos HTML, CSS, JS e imagens são copiados do projeto principal
- O app faz requisições para o servidor remoto
- Os arquivos JSON de banner são incluídos no app


