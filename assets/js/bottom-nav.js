// bottom-nav.js - Componente de navegação inferior para páginas HTML
// Funciona como um "include" - usado em todas as páginas HTML

// Mapeamento de páginas para itens ativos
const bottomNavMap = {
    'main_app.html': 'home',
    'progress.html': 'stats',
    'diary.html': 'diary',
    'add_food_to_diary.html': 'diary',
    'meal_types_overview.html': 'diary',
    'explore_recipes.html': 'explore',
    'favorite_recipes.html': 'explore',
    'view_recipe.html': 'explore',
    'profile_overview.html': 'settings',
    'more_options.html': 'settings',
    'more_options.php': 'settings',
    'ranking.html': 'home'
};

// Detectar página atual (compatível com SPA e navegação tradicional)
const bottomNavCurrentPage = window.location.pathname.split('/').pop() || 'main_app.html';
// Para SPA, verificar também a rota atual
let bottomNavActiveItem = bottomNavMap[bottomNavCurrentPage] || 'home';

// Atualizar item ativo quando rota mudar (SPA)
if (window.addEventListener) {
    window.addEventListener('routeChanged', function(e) {
        const pageName = e.detail?.pageName || '';
        const route = e.detail?.route || '';
        
        // Tentar mapear pelo pageName primeiro (mais confiável)
        let mappedItem = null;
        if (pageName) {
            // Tentar com .html
            mappedItem = bottomNavMap[`${pageName}.html`];
            // Se não encontrar, tentar sem extensão
            if (!mappedItem) {
                mappedItem = bottomNavMap[pageName];
            }
        }
        
        // Se ainda não encontrou, tentar pela rota
        if (!mappedItem && route) {
            const routeName = route.split('/').pop() || route;
            mappedItem = bottomNavMap[routeName] || bottomNavMap[route];
        }
        
        // Atualizar item ativo
        bottomNavActiveItem = mappedItem || 'home';
        
        // Atualizar visualmente
        updateActiveNavItem();
        
        console.log('[Bottom Nav] Rota mudou:', { pageName, route, activeItem: bottomNavActiveItem });
    });
}

function updateActiveNavItem() {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        const route = item.getAttribute('data-route') || item.getAttribute('href') || '';
        // Extrair o nome da rota (sem /)
        const routeName = route.replace(/^\//, '').split('/')[0] || '';
        
        // Mapear rota para item
        let itemType = '';
        if (routeName === 'main_app' || routeName === 'dashboard' || routeName === '') {
            itemType = 'home';
        } else if (routeName === 'progress') {
            itemType = 'stats';
        } else if (routeName === 'diary' || routeName === 'add_food_to_diary') {
            itemType = 'diary';
        } else if (routeName === 'explore_recipes' || routeName === 'favorite_recipes' || routeName === 'view_recipe') {
            itemType = 'explore';
        } else if (routeName === 'more_options' || routeName === 'profile_overview' || routeName === 'edit_profile') {
            itemType = 'settings';
        }
        
        // Atualizar classe active
        if (itemType === bottomNavActiveItem) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Base URL para os links
const bottomNavBaseURL = window.BASE_APP_URL || '';

// CSS do bottom nav
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
        padding-top: 12px !important;
        padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;
        padding-left: calc(10px + env(safe-area-inset-left, 0px)) !important;
        padding-right: calc(10px + env(safe-area-inset-right, 0px)) !important;
        min-height: calc(60px + env(safe-area-inset-bottom, 0px)) !important;
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

// HTML do bottom nav
const bottomNavHTML = `
    <nav class="bottom-nav">
        <a href="/main_app" class="nav-item ${bottomNavActiveItem === 'home' ? 'active' : ''}" data-route="/main_app">
            <i class="fas fa-home"></i>
        </a>
        <a href="/progress" class="nav-item ${bottomNavActiveItem === 'stats' ? 'active' : ''}" data-route="/progress">
            <i class="fas fa-chart-line"></i>
        </a>
        <a href="/diary" class="nav-item ${bottomNavActiveItem === 'diary' ? 'active' : ''}" data-route="/diary">
            <i class="fas fa-book"></i>
        </a>
        <a href="/explore_recipes" class="nav-item ${bottomNavActiveItem === 'explore' ? 'active' : ''}" data-route="/explore_recipes">
            <i class="fas fa-utensils"></i>
        </a>
        <a href="/more_options" class="nav-item ${bottomNavActiveItem === 'settings' ? 'active' : ''}" data-route="/more_options">
            <i class="fas fa-cog"></i>
        </a>
    </nav>
`;

// Função para renderizar o bottom nav
function renderBottomNav() {
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
    navDiv.innerHTML = bottomNavHTML;
    const navElement = navDiv.querySelector('nav');
    if (navElement) {
        document.body.appendChild(navElement);
    }
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
