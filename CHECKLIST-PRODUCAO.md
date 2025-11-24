# ✅ Checklist Final - Pronto para Produção

## 🎯 Passos ANTES de Gerar o APK/AAB

### 1. ✅ Gerar Ícones e Splash Screen
```bash
npm run generate:assets
```
**Status:** Você já tem os arquivos em `resources/`, só precisa executar o comando acima.

### 2. ⚠️ Atualizar Versão do App (Opcional mas Recomendado)
No arquivo `android/app/build.gradle`, linha 10-11:
```gradle
versionCode 1        // Incrementar para cada release (1, 2, 3...)
versionName "1.0"    // Versão visível (1.0, 1.1, 2.0...)
```

### 3. ✅ Build Otimizado
**Status:** ✅ Já configurado! Minificação e shrinkResources habilitados para release.

### 4. ⚠️ Desabilitar Debug (Opcional)
No `capacitor.config.json`, linha 11:
```json
"webContentsDebuggingEnabled": false  // Mude para false em produção
```
**Nota:** Deixe `true` se ainda estiver testando/debugando.

---

## 🚀 Como Gerar o APK/AAB para Produção

### Opção 1: Android Studio (Recomendado)

1. **Abrir o projeto:**
   ```bash
   npm run open:android
   ```

2. **Build > Generate Signed Bundle / APK**
   - Selecione **Android App Bundle (AAB)** para Play Store
   - Ou **APK** para distribuição direta

3. **Criar/Carregar Keystore:**
   - Se não tiver, crie um novo keystore
   - **GUARDE AS SENHAS E O KEYSTORE EM LUGAR SEGURO!**
   - Você precisará dele para todas as atualizações futuras

4. **Selecionar Build Variant:**
   - Escolha **release** (não debug)

5. **Assinar e Gerar:**
   - Clique em **Finish**
   - O arquivo será gerado em `android/app/release/`

### Opção 2: Linha de Comando

```bash
cd android
./gradlew bundleRelease  # Para AAB (Play Store)
# ou
./gradlew assembleRelease  # Para APK
```

**Nota:** Você precisará configurar o keystore no `build.gradle` primeiro.

---

## 📋 Checklist Final

- [ ] Ícones e splash screen gerados (`npm run generate:assets`)
- [ ] Versão do app atualizada (se necessário)
- [ ] Testado em dispositivo físico
- [ ] Todas as funcionalidades testadas
- [ ] Keystore criado/configurado
- [ ] APK/AAB gerado e testado
- [ ] Debug desabilitado (opcional, mas recomendado)

---

## ⚠️ IMPORTANTE

1. **Keystore:** Se você perder o keystore, NUNCA mais poderá atualizar o app na Play Store. Guarde em lugar seguro!

2. **Versão:** A cada atualização, incremente o `versionCode` (obrigatório) e `versionName` (recomendado).

3. **Teste:** Sempre teste o APK/AAB gerado antes de publicar!

---

## 🎉 Status Atual

✅ **App funcional e pronto!**
✅ **Build otimizado para release**
✅ **Ícones e splash screen prontos (só precisa gerar)**
⚠️ **Versão ainda em 1.0** (atualize se quiser)
⚠️ **Debug ainda habilitado** (ok para testes, desabilite para produção)

**Você pode gerar o APK/AAB agora mesmo!** 🚀


