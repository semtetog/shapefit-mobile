# 🔧 Inicialização de Páginas no SPA

## ⚠️ IMPORTANTE

O sistema SPA agora carrega **APENAS fragmentos HTML** (sem scripts). As páginas precisam ser inicializadas via **eventos customizados**.

## 📋 Como Funciona

Quando uma página é carregada via SPA, um evento customizado é disparado:

```javascript
// Para a página main_app.html (page-main-app)
window.dispatchEvent(new CustomEvent('spa:enter-main-app', {
    detail: { pageId: 'page-main-app', url: './main_app.html' }
}));
```

## 🎯 Como Inicializar Sua Página

### Opção 1: Escutar Evento Customizado (RECOMENDADO)

```javascript
// No arquivo dashboard_logic.js ou similar
window.addEventListener('spa:enter-main-app', function(event) {
    // Inicializar lógica da página dashboard
    initDashboard();
    loadDashboardData();
});

function initDashboard() {
    // Sua lógica de inicialização aqui
}
```

### Opção 2: Usar Função Global

```javascript
// Criar função global que será chamada quando a página entrar
window.initMainApp = function() {
    // Inicializar dashboard
    initDashboard();
    loadDashboardData();
};

// Escutar evento
window.addEventListener('spa:enter-main-app', window.initMainApp);
```

## 📝 Eventos Disponíveis

Cada página tem seu próprio evento baseado no pageId:

- `spa:enter-main-app` - Dashboard
- `spa:enter-progress` - Progresso
- `spa:enter-diary` - Diário
- `spa:enter-explore-recipes` - Explorar Receitas
- `spa:enter-favorite-recipes` - Receitas Favoritas
- `spa:enter-view-recipe` - Ver Receita
- `spa:enter-more-options` - Mais Opções
- `spa:enter-edit-profile` - Editar Perfil
- `spa:enter-add-food` - Adicionar Comida
- `spa:enter-create-food` - Criar Comida Customizada
- `spa:enter-edit-meal` - Editar Refeição
- `spa:enter-scan-barcode` - Escanear Código de Barras
- `spa:enter-points-history` - Histórico de Pontos
- `spa:enter-measurements` - Medidas
- `spa:enter-routine` - Rotina
- `spa:enter-ranking` - Ranking
- `spa:enter-content` - Conteúdo
- `spa:enter-view-content` - Ver Conteúdo
- `spa:enter-login` - Login
- `spa:enter-register` - Registro
- `spa:enter-onboarding` - Onboarding

## 🔄 Evento Genérico

Também há um evento genérico que dispara para todas as páginas:

```javascript
window.addEventListener('spa:page-changed', function(event) {
    console.log('Página mudou para:', event.detail.pageId);
    console.log('URL:', event.detail.url);
});
```

## ⚠️ O que NÃO fazer

❌ **NÃO** usar `DOMContentLoaded` para inicialização
❌ **NÃO** executar código no top-level do script
❌ **NÃO** usar `window.location.href` - use `window.SPANavigator.navigate()`
❌ **NÃO** assumir que a página está carregada quando o script roda

## ✅ O que fazer

✅ Escutar eventos customizados `spa:enter-*`
✅ Usar `window.SPANavigator.navigate()` para navegação
✅ Limpar event listeners quando a página sair (opcional)
✅ Verificar se elementos existem antes de manipulá-los

## 📦 Exemplo Completo

```javascript
// dashboard_logic.js

let dashboardInitialized = false;

function initDashboard() {
    if (dashboardInitialized) return;
    
    // Carregar dados
    loadDashboardData();
    
    // Configurar event listeners
    setupDashboardEvents();
    
    dashboardInitialized = true;
}

function loadDashboardData() {
    // Sua lógica de carregamento
}

function setupDashboardEvents() {
    // Event listeners específicos da página
}

// Escutar evento SPA
window.addEventListener('spa:enter-main-app', function(event) {
    initDashboard();
});

// Limpar quando sair (opcional)
window.addEventListener('spa:page-changed', function(event) {
    if (event.detail.pageId !== 'page-main-app' && dashboardInitialized) {
        // Limpar recursos se necessário
        dashboardInitialized = false;
    }
});
```

## 🚀 Migração de Páginas Existentes

Para migrar uma página existente:

1. **Mover código de inicialização** do script inline para um arquivo JS
2. **Adicionar listener** para o evento `spa:enter-*` correspondente
3. **Substituir `window.location.href`** por `window.SPANavigator.navigate()`
4. **Testar** que a página inicializa corretamente

## 📌 Notas Importantes

- Os eventos são disparados **após** o HTML ser injetado
- A página já está visível quando o evento dispara
- Não há necessidade de esperar `DOMContentLoaded`
- O evento dispara toda vez que a página é mostrada (não apenas na primeira vez)

