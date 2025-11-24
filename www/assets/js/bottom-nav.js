// bottom-nav.js - Componente de navegação inferior para páginas HTML
// Funciona como um "include" - usado em todas as páginas HTML

// Evitar re-declaração em navegação SPA
if (typeof window.__bottomNavInitialized !== 'undefined') {
    // Já foi inicializado, apenas atualizar item ativo se necessário
    if (typeof updateActiveItem === 'function') {
        updateActiveItem();
    }
} else {
    window.__bottomNavInitialized = true;

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

// Detectar página atual
const bottomNavCurrentPage = window.location.pathname.split('/').pop() || 'main_app.html';
const bottomNavActiveItem = bottomNavMap[bottomNavCurrentPage] || 'home';

// Usar caminhos relativos para manter navegação dentro do app
// BASE_APP_URL é apenas para APIs, não para navegação

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

// HTML do bottom nav - usando caminhos relativos
// main_app.html sempre faz reload completo (não SPA)
const bottomNavHTML = `
    <nav class="bottom-nav">
        <a href="./main_app.html" class="nav-item ${bottomNavActiveItem === 'home' ? 'active' : ''}" data-no-spa="true">
            <i class="fas fa-home"></i>
        </a>
        <a href="./progress.html" class="nav-item ${bottomNavActiveItem === 'stats' ? 'active' : ''}">
            <i class="fas fa-chart-line"></i>
        </a>
        <a href="./diary.html" class="nav-item ${bottomNavActiveItem === 'diary' ? 'active' : ''}">
            <i class="fas fa-book"></i>
        </a>
        <a href="./explore_recipes.html" class="nav-item ${bottomNavActiveItem === 'explore' ? 'active' : ''}">
            <i class="fas fa-utensils"></i>
        </a>
        <a href="./more_options.html" class="nav-item ${bottomNavActiveItem === 'settings' ? 'active' : ''}">
            <i class="fas fa-cog"></i>
        </a>
    </nav>
`;

// Função para renderizar o bottom nav
function renderBottomNav() {
    // Verificar se já existe (evitar duplicatas)
    const existingNavs = document.querySelectorAll('.bottom-nav');
    
    // Se existem múltiplos, remover todos e criar um novo
    if (existingNavs.length > 1) {
        existingNavs.forEach(nav => nav.remove());
    } else if (existingNavs.length === 1) {
        // Se já existe apenas um, apenas atualizar o item ativo
        updateActiveItem();
        return;
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

// Função para atualizar apenas o item ativo (usado durante navegação SPA)
function updateActiveItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'main_app.html';
    const activeItem = bottomNavMap[currentPage] || 'home';
    
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href) {
            const itemPage = href.split('/').pop().split('?')[0];
            if (bottomNavMap[itemPage] === activeItem) {
                item.classList.add('active');
            }
        }
    });
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

} // Fim do bloco de verificação de inicialização
