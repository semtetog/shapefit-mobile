// bottom-nav.js - Navegação Inferior 100% compatível com SPA

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
    if (window.SPANavigator && window.SPANavigator.currentPage) {
        const pageId = window.SPANavigator.currentPage;
        if (pageId === 'page-main-app') return 'home';
        if (pageId === 'page-progress') return 'stats';
        if (pageId === 'page-diary') return 'diary';
        if (pageId === 'page-explore-recipes') return 'explore';
        if (pageId === 'page-more-options') return 'settings';
    }

    const currentPage = window.location.pathname.split('/').pop() || 'main_app.html';
    return bottomNavMap[currentPage] || 'home';
}

const bottomNavCSS = `
<style>
.bottom-nav {
    position: fixed !important;
    bottom: 0 !important;
    width: 100% !important;
    padding-top: 10px !important;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
    background: rgba(24, 24, 24, 0.85) !important;
    backdrop-filter: blur(15px);
    border-top: 1px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 9999;
}

.nav-item {
    flex: 1;
    text-align: center;
    text-decoration: none;
    color: var(--text-secondary);
}

.nav-item.active {
    color: var(--accent-orange);
}
</style>
`;

function buildBottomNavHTML() {
    const activeItem = getBottomNavActiveItem();

    const create = (href, icon, key) => {
        const active = activeItem === key ? "active" : "";
        return `
            <a href="${href}" class="nav-item ${active}">
                <i class="${icon}"></i>
            </a>
        `;
    };

    return `
        <nav class="bottom-nav">
            ${create('./main_app.html', 'fas fa-home', 'home')}
            ${create('./progress.html', 'fas fa-chart-line', 'stats')}
            ${create('./diary.html', 'fas fa-book', 'diary')}
            ${create('./explore_recipes.html', 'fas fa-utensils', 'explore')}
            ${create('./more_options.html', 'fas fa-cog', 'settings')}
        </nav>
    `;
}

function ensureBottomNavCSS() {
    if (!document.querySelector('style[data-bottom-nav]')) {
        const wrap = document.createElement('div');
        wrap.innerHTML = bottomNavCSS;
        const style = wrap.querySelector('style');
        style.setAttribute('data-bottom-nav', 'true');
        document.head.appendChild(style);
    }
}

function renderBottomNav() {
    ensureBottomNavCSS();

    let nav = document.querySelector('.bottom-nav');
    if (!nav) {
        const wrap = document.createElement('div');
        wrap.innerHTML = buildBottomNavHTML();
        nav = wrap.querySelector('nav');
        document.body.appendChild(nav);
    } else {
        const activeItem = getBottomNavActiveItem();
        nav.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href') || "";
            let key = Object.keys(bottomNavMap).find(k => href.includes(k));
            if (!key) key = 'home';
            const navKey = bottomNavMap[key];
            item.classList.toggle('active', navKey === activeItem);
        });
    }
}

document.addEventListener('DOMContentLoaded', renderBottomNav);
window.addEventListener('spa:page-changed', renderBottomNav);
