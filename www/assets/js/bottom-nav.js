// bottom-nav.js - Componente de navegação inferior para páginas HTML
// Funciona como um "include" - usado em todas as páginas HTML

// Mapeamento de páginas para itens ativos (suporta com e sem .html)
const bottomNavMap = {
    'main_app': 'home',
    'main_app.html': 'home',
    'dashboard': 'home',
    'dashboard.html': 'home',
    'progress': 'stats',
    'progress.html': 'stats',
    'diary': 'diary',
    'diary.html': 'diary',
    'add_food_to_diary': 'diary',
    'add_food_to_diary.html': 'diary',
    'meal_types_overview': 'diary',
    'meal_types_overview.html': 'diary',
    'explore_recipes': 'explore',
    'explore_recipes.html': 'explore',
    'favorite_recipes': 'explore',
    'favorite_recipes.html': 'explore',
    'view_recipe': 'explore',
    'view_recipe.html': 'explore',
    'profile_overview': 'settings',
    'profile_overview.html': 'settings',
    'more_options': 'settings',
    'more_options.html': 'settings',
    'more_options.php': 'settings',
    'edit_profile': 'settings',
    'edit_profile.html': 'settings',
    'ranking': 'home',
    'ranking.html': 'home'
};

// Detectar página atual (compatível com SPA e navegação tradicional)
const getCurrentPageName = () => {
    const path = window.location.pathname;
    const pageName = path.split('/').pop() || 'main_app';
    return pageName.replace('.html', '');
};

let bottomNavActiveItem = 'home';

// Função para atualizar item ativo baseado no pageName
function updateActiveItemFromPageName(pageName) {
    if (!pageName) return;
    
    // Remover .html se existir
    const cleanPageName = pageName.replace('.html', '');
    
    // Tentar mapear
    let mappedItem = bottomNavMap[cleanPageName] || bottomNavMap[`${cleanPageName}.html`];
    
    if (mappedItem) {
        bottomNavActiveItem = mappedItem;
        updateActiveNavItem();
        console.log('[Bottom Nav] Item ativo atualizado:', { pageName: cleanPageName, activeItem: bottomNavActiveItem });
    }
}

// Atualizar item ativo quando rota mudar (SPA)
if (window.addEventListener) {
    window.addEventListener('routeChanged', function(e) {
        const pageName = e.detail?.pageName || '';
        const route = e.detail?.route || '';
        
        // Usar pageName primeiro (mais confiável)
        if (pageName) {
            updateActiveItemFromPageName(pageName);
        } else if (route) {
            // Se não tiver pageName, tentar extrair da rota
            const routeName = route.split('/').pop() || route;
            updateActiveItemFromPageName(routeName);
        }
    });
    
    // Atualizar na carga inicial também
    window.addEventListener('DOMContentLoaded', function() {
        const currentPage = getCurrentPageName();
        updateActiveItemFromPageName(currentPage);
    });
    
    // Atualizar quando window.load também (fallback)
    window.addEventListener('load', function() {
        const currentPage = getCurrentPageName();
        updateActiveItemFromPageName(currentPage);
    });
}

function updateActiveNavItem() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        const itemType = item.getAttribute('data-item') || '';
        
        // Atualizar classe active baseado no itemType e bottomNavActiveItem
        if (itemType === bottomNavActiveItem) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    console.log('[Bottom Nav] Atualizado - item ativo:', bottomNavActiveItem);
}

// Base URL para os links
const bottomNavBaseURL = window.BASE_APP_URL || '';

// CSS do bottom nav (EXATAMENTE IGUAL AO WWWANTIGO)
const bottomNavCSS = `
    <style>
    /* === ESTILO FINAL E CLEAN PARA A BARRA DE NAVEGAÇÃO === */
    .bottom-nav {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        /* Removido max-width e margin para ocupar toda a largura da tela */
        /* Padding mínimo sempre presente + safe-area quando disponível */
        /* Reduzido para não ficar com margem gigante, especialmente no iOS nativo */
        padding-top: 10px !important;
        padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
        padding-left: calc(10px + env(safe-area-inset-left, 0px)) !important;
        padding-right: calc(10px + env(safe-area-inset-right, 0px)) !important;
        min-height: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
        background: rgba(24, 24, 24, 0.85) !important;
        backdrop-filter: blur(15px) !important;
        -webkit-backdrop-filter: blur(15px) !important;
        border-top: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1)) !important;
        display: flex !important;
        justify-content: space-around !important;
        align-items: center !important;
        z-index: 1000 !important;
        visibility: visible !important;
        opacity: 1 !important;
    }

    .nav-item {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: var(--text-secondary, #8E8E93);
        transition: color 0.2s ease;
        -webkit-tap-highlight-color: transparent;
    }

    .nav-item i {
        font-size: 1.5rem;
    }

    .nav-item.active {
        color: var(--accent-orange, #ff6b00);
    }
    </style>
`;

// HTML do bottom nav (será gerado dinamicamente para sempre ter o item correto)
function getBottomNavHTML() {
    return `
    <nav class="bottom-nav">
        <a href="/main_app" class="nav-item" data-route="/main_app" data-item="home">
            <i class="fas fa-home"></i>
        </a>
        <a href="/progress" class="nav-item" data-route="/progress" data-item="stats">
            <i class="fas fa-chart-line"></i>
        </a>
        <a href="/diary" class="nav-item" data-route="/diary" data-item="diary">
            <i class="fas fa-book"></i>
        </a>
        <a href="/explore_recipes" class="nav-item" data-route="/explore_recipes" data-item="explore">
            <i class="fas fa-utensils"></i>
        </a>
        <a href="/more_options" class="nav-item" data-route="/more_options" data-item="settings">
            <i class="fas fa-cog"></i>
        </a>
    </nav>
`;
}

// Páginas que NÃO devem ter bottom nav
const pagesWithoutBottomNav = ['login', 'register', 'onboarding'];

// Função para verificar se a página atual deve ter bottom nav
function shouldShowBottomNav() {
    const currentPage = getCurrentPageName();
    const shouldShow = !pagesWithoutBottomNav.includes(currentPage);
    console.log('[Bottom Nav] Verificando se deve mostrar:', { currentPage, shouldShow });
    return shouldShow;
}

// Função para renderizar o bottom nav
function renderBottomNav() {
    // Verificar se deve mostrar o bottom nav
    if (!shouldShowBottomNav()) {
        // Remover bottom nav se existir (caso tenha sido adicionado antes)
        const existingNav = document.querySelector('.bottom-nav');
        if (existingNav) {
            existingNav.remove();
        }
        const existingStyle = document.querySelector('style[data-bottom-nav]');
        if (existingStyle) {
            existingStyle.remove();
        }
        console.log('[Bottom Nav] Página não deve ter bottom nav, removendo se existir');
        return;
    }
    
    // Verificar se já existe (evitar duplicatas)
    const existingNav = document.querySelector('.bottom-nav');
    if (existingNav) {
        existingNav.remove();
    }
    
    const existingStyle = document.querySelector('style[data-bottom-nav]');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Verificar se body existe
    if (!document.body) {
        return;
    }
    
    // Inserir CSS no head
    const styleDiv = document.createElement('div');
    styleDiv.innerHTML = bottomNavCSS;
    const styleElement = styleDiv.querySelector('style');
    if (styleElement) {
        styleElement.setAttribute('data-bottom-nav', 'true');
        document.head.appendChild(styleElement);
    }
    
    // Inserir HTML no body
    const navDiv = document.createElement('div');
    navDiv.innerHTML = getBottomNavHTML();
    const navElement = navDiv.querySelector('nav');
    if (navElement) {
        document.body.appendChild(navElement);
    }
    
    // Atualizar item ativo após renderizar
    updateActiveNavItem();
}

// Renderizar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderBottomNav);
} else {
    renderBottomNav();
}

// Fallback: tentar novamente após window.load
window.addEventListener('load', function() {
    if (!document.querySelector('.bottom-nav')) {
        renderBottomNav();
    }
});
