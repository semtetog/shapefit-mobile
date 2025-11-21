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

function getBottomNavActiveItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'main_app.html';
    return bottomNavMap[currentPage] || 'home';
}

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
function buildBottomNavHTML() {
    const activeItem = getBottomNavActiveItem();
    return `
        <nav class="bottom-nav">
            <a href="./main_app.html" class="nav-item ${activeItem === 'home' ? 'active' : ''}">
                <i class="fas fa-home"></i>
            </a>
            <a href="./progress.html" class="nav-item ${activeItem === 'stats' ? 'active' : ''}">
                <i class="fas fa-chart-line"></i>
            </a>
            <a href="./diary.html" class="nav-item ${activeItem === 'diary' ? 'active' : ''}">
                <i class="fas fa-book"></i>
            </a>
            <a href="./explore_recipes.html" class="nav-item ${activeItem === 'explore' ? 'active' : ''}">
                <i class="fas fa-utensils"></i>
            </a>
            <a href="./more_options.html" class="nav-item ${activeItem === 'settings' ? 'active' : ''}">
                <i class="fas fa-cog"></i>
            </a>
        </nav>
    `;
}

// Função para garantir que o CSS está aplicado
function ensureBottomNavCSS() {
    if (document.querySelector('style[data-bottom-nav]')) return;
    const styleDiv = document.createElement('div');
    styleDiv.innerHTML = bottomNavCSS;
    const styleElement = styleDiv.querySelector('style');
    if (styleElement) {
        styleElement.setAttribute('data-bottom-nav', 'true');
        document.head.appendChild(styleElement);
    }
}

// Função para renderizar/atualizar o bottom nav sem recriar desnecessariamente
function renderBottomNav() {
    if (!document.body) return;

    ensureBottomNavCSS();

    let navElement = document.querySelector('.bottom-nav');
    const activeItem = getBottomNavActiveItem();

    if (!navElement) {
        // Criar nav uma única vez
        const navDiv = document.createElement('div');
        navDiv.innerHTML = buildBottomNavHTML();
        navElement = navDiv.querySelector('nav');
        if (navElement) {
            document.body.appendChild(navElement);
        }
    } else {
        // Apenas atualizar classes "active" para evitar flicker
        const items = navElement.querySelectorAll('.nav-item');
        items.forEach(item => {
            const href = item.getAttribute('href') || '';
            let key = 'home';
            if (href.includes('progress.html')) key = 'stats';
            else if (href.includes('diary.html') || href.includes('add_food_to_diary.html') || href.includes('meal_types_overview.html')) key = 'diary';
            else if (href.includes('explore_recipes.html') || href.includes('favorite_recipes.html') || href.includes('view_recipe.html')) key = 'explore';
            else if (href.includes('more_options.html') || href.includes('profile_overview.html')) key = 'settings';

            if (key === activeItem) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
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
