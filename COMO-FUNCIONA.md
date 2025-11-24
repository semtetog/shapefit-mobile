# 📱 Como o App Funciona

## ✅ O que o app faz:

1. **Arquivos HTML locais**: Todos os arquivos HTML, CSS, JS e imagens ficam **dentro do app** (em `www/`)
2. **APIs remotas**: Todas as requisições de API vão para **https://appshapefit.com**

## 🔄 Fluxo do App:

### 1. Ao abrir o app:
- `index.html` é carregado
- Verifica se o usuário está logado (token no localStorage)
- Se **NÃO** estiver logado → redireciona para `auth/login.html`
- Se **ESTIVER** logado → redireciona para `main_app.html`

### 2. Login (`auth/login.html`):
- Usuário digita email/senha
- Faz requisição para: `https://appshapefit.com/api/login.php`
- Salva o token no localStorage
- Redireciona para `main_app.html`

### 3. App Principal (`main_app.html`):
- Carrega os dados do dashboard
- Faz requisições para: `https://appshapefit.com/api/get_dashboard_data.php`
- Mostra as informações na tela

## ⚙️ Configuração:

### `www-config.js`:
- Detecta se está rodando no Capacitor (app mobile)
- Se SIM → `BASE_APP_URL = 'https://appshapefit.com'`
- Se NÃO → `BASE_APP_URL = URL local` (para desenvolvimento web)

### `capacitor.config.json`:
- **NÃO** tem `server.url` configurado
- Isso significa que os arquivos HTML são servidos **localmente** pelo app
- As requisições de API vão para o servidor remoto

## 🚫 O que NÃO deve acontecer:

- ❌ Abrir o navegador do celular
- ❌ Carregar HTML do servidor
- ❌ Usar `localhost` para APIs

## ✅ O que DEVE acontecer:

- ✅ Usar arquivos HTML locais (dentro do app)
- ✅ Fazer requisições para `https://appshapefit.com/api/...`
- ✅ Funcionar offline (pelo menos a interface)

## 🔧 Se algo estiver errado:

1. Verifique o console do Android Studio (Logcat)
2. Procure por mensagens que começam com `[Mobile App]` ou `[Web App]`
3. Verifique se `BASE_APP_URL` está correto: `https://appshapefit.com`


