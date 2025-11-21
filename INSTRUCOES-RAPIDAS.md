# 🚀 Instruções Rápidas - ShapeFit Android App

## ✅ Setup Completo (Já Feito!)

O projeto já está configurado e pronto para usar!

## 📋 Próximos Passos

### 1. Abrir no Android Studio

```bash
npm run open:android
```

### 2. Configurar JDK no Android Studio

1. **File > Settings** (ou `Ctrl+Alt+S`)
2. **Build, Execution, Deployment > Build Tools > Gradle**
3. No campo **"Gradle JDK"**, selecione:
   - **"JAVA_HOME Oracle OpenJDK 17"** (recomendado)
   - Ou **"jbr-17"** se disponível
4. Clique em **Apply** e **OK**

### 3. Sincronizar o Projeto

- Clique em **"Sync Now"** se aparecer um banner
- Ou: **File > Sync Project with Gradle Files**

### 4. Resolver Erro de Espaço no Emulador

O erro que você teve era de **espaço insuficiente no emulador**. Para resolver:

**Opção A: Limpar espaço no emulador**
1. No emulador, vá em **Settings > Storage**
2. Limpe cache e dados não utilizados
3. Ou delete apps desnecessários

**Opção B: Criar novo emulador com mais espaço**
1. **Tools > Device Manager**
2. Clique no **ícone de lápis** (Edit) no emulador
3. **Show Advanced Settings**
4. Aumente o **Internal Storage** para pelo menos **4GB**
5. Salve e reinicie o emulador

**Opção C: Usar dispositivo físico**
- Conecte seu celular via USB
- Ative **Depuração USB** nas opções de desenvolvedor
- Selecione o dispositivo no Android Studio

### 5. Fazer o Build

1. Selecione o dispositivo/emulador no topo
2. Clique no botão **▶️ Run** (ou `Shift+F10`)
3. Aguarde o build e instalação

## 🔄 Comandos Úteis

```bash
# Copiar arquivos e sincronizar
npm run build

# Apenas sincronizar (após mudanças)
npm run sync

# Abrir no Android Studio
npm run open:android

# Limpar tudo e começar do zero
npm run clean
```

## ⚠️ Importante

- **URL Base**: O app está configurado para usar `https://appshapefit.com`
- **Arquivos**: Todos os arquivos necessários já foram copiados para `www/`
- **Permissões**: Câmera e Internet já estão configuradas

## 🐛 Problemas Comuns

### Erro de JDK
- Configure o JDK 17 no Android Studio (passo 2 acima)

### Erro de espaço
- Siga as opções do passo 4 acima

### Erro de sincronização
- **File > Invalidate Caches / Restart**
- Aguarde o Gradle sincronizar novamente

## 📱 Estrutura do Projeto

```
shapefit-android-app/
├── www/                    # Arquivos web (HTML, CSS, JS, imagens)
├── android/                # Projeto Android nativo
├── capacitor.config.json   # Configuração do Capacitor
└── package.json           # Dependências
```

Tudo pronto! 🎉


