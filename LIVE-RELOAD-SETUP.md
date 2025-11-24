# 🔥 Live Reload - Ver Mudanças em Tempo Real no iPhone

## ⚠️ Importante
**Expo Go NÃO funciona** - Este projeto é **Capacitor**, não React Native/Expo.

## ✅ Solução: Capacitor Live Reload (Windows + iPhone)

**SIM, funciona no Windows!** O servidor roda no seu PC e o iPhone acessa via WiFi.

## 🚀 Como Usar (SUPER SIMPLES)

### Método Rápido (Recomendado)

1. **Iniciar modo desenvolvimento:**
   ```powershell
   npm run dev
   ```
   
   Ou:
   ```powershell
   .\start-dev.ps1
   ```

2. **Abrir Xcode e rodar no iPhone:**
   - Abra o projeto iOS no Xcode
   - Conecte seu iPhone
   - Clique em Run (▶️)
   - **Pronto!** As mudanças aparecem automaticamente

3. **Quando terminar, voltar ao modo produção:**
   ```powershell
   npm run dev:stop
   ```
   
   Ou:
   ```powershell
   .\stop-dev.ps1
   ```

### O que o script faz automaticamente:

✅ Detecta seu IP local  
✅ Atualiza `capacitor.config.json`  
✅ Sincroniza o Capacitor  
✅ Inicia o servidor HTTP na porta 8100  

### Requisitos:

- ✅ iPhone e PC na **mesma rede WiFi**
- ✅ Firewall do Windows permitindo porta 8100 (geralmente já permite)
- ✅ Xcode instalado (para rodar no iPhone)

## 📱 Como Funciona

1. **Servidor local** roda na porta 8100
2. **Capacitor** aponta para esse servidor
3. **Mudanças nos arquivos** são detectadas automaticamente
4. **App recarrega** automaticamente no iPhone

## 🔧 Comandos Úteis

```powershell
# Iniciar servidor de desenvolvimento
npm run serve

# Sincronizar após mudanças
npm run sync

# Rodar no iOS com live reload
npm run dev

# Rodar no Android com live reload
npm run dev:android
```

## ⚠️ Problemas Comuns

### "Não consegue conectar"
- ✅ Verifique se iPhone e PC estão na mesma WiFi
- ✅ Verifique se o firewall permite porta 8100
- ✅ Confirme que o IP no capacitor.config.json está correto

### "Mudanças não aparecem"
- ✅ Certifique-se de que o servidor está rodando
- ✅ Execute `npx cap sync` após mudanças
- ✅ Feche e reabra o app no iPhone

### "Erro de CORS"
- ✅ O servidor já está configurado com `--cors`
- ✅ Se persistir, verifique o capacitor.config.json

## 🎯 Dica Pro

Crie um script que detecta seu IP automaticamente e atualiza o capacitor.config.json:

```powershell
# Auto-detect IP e atualiza config
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" } | Select-Object -First 1).IPAddress
$config = Get-Content capacitor.config.json | ConvertFrom-Json
$config.server.url = "http://$ip:8100"
$config | ConvertTo-Json -Depth 10 | Set-Content capacitor.config.json
```

## 📝 Nota

Para **produção**, remova ou comente a seção `server` do `capacitor.config.json` para usar arquivos locais.

