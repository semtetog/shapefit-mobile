// bottom-nav.js - Navegação Inferior 100% SPA (sem fallback, sem duplicação)

(function() {
    'use strict';

    const BottomNav = {
        initialized: false,
        
        pageMap: {
            'page-main-app': 'home',
            'page-progress': 'stats',
            'page-diary': 'diary',
            'page-add-food': 'diary',
            'page-edit-meal': 'diary',
            'page-explore-recipes': 'explore',
            'page-favorite-recipes': 'explore',
            'page-view-recipe': 'explore',
            'page-more-options': 'settings',
            'page-edit-profile': 'settings'
        },

        getActiveItem() {
            if (window.SPANavigator && window.SPANavigator.currentPage) {
                return this.pageMap[window.SPANavigator.currentPage] || 'home';
            }
            return 'home';
        },

        CSS: `
<style data-bottom-nav="true">
.bottom-nav {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    padding-top: 12px !important;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;
    padding-left: calc(10px + env(safe-area-inset-left, 0px)) !important;
    padding-right: calc(10px + env(safe-area-inset-right, 0px)) !important;
    min-height: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
    background: rgba(24, 24, 24, 0.85) !important;
    backdrop-filter: blur(15px) !important;
    -webkit-backdrop-filter: blur(15px) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    display: flex !important;
    justify-content: space-around !important;
    align-items: center !important;
    z-index: 9999 !important;
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
    padding: 8px;
}

.nav-item i {
    font-size: 1.5rem;
}

.nav-item.active {
    color: var(--accent-orange, #ff6b00);
}
</style>
`,

        buildHTML() {
            const active = this.getActiveItem();
            
            const create = (href, icon, key) => {
                const isActive = active === key ? 'active' : '';
                return `<a href="${href}" class="nav-item ${isActive}"><i class="${icon}"></i></a>`;
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
        },

        ensureCSS() {
            if (!document.querySelector('style[data-bottom-nav="true"]')) {
                const div = document.createElement('div');
                div.innerHTML = this.CSS;
                document.head.appendChild(div.querySelector('style'));
            }
        },

        render() {
            this.ensureCSS();

            let nav = document.querySelector('.bottom-nav');
            const active = this.getActiveItem();

            if (!nav) {
                const div = document.createElement('div');
                div.innerHTML = this.buildHTML();
                nav = div.querySelector('nav');
                if (nav && document.body) {
                    document.body.appendChild(nav);
                }
            } else {
                nav.querySelectorAll('.nav-item').forEach(item => {
                    const href = item.getAttribute('href') || '';
                    let key = 'home';
                    if (href.includes('progress.html')) key = 'stats';
                    else if (href.includes('diary.html')) key = 'diary';
                    else if (href.includes('explore_recipes.html')) key = 'explore';
                    else if (href.includes('more_options.html')) key = 'settings';
                    
                    item.classList.toggle('active', key === active);
                });
            }
        },

        init() {
            if (this.initialized) return;
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.render());
            } else {
                this.render();
            }
            
            window.addEventListener('spa:page-changed', () => this.render());
            this.initialized = true;
        }
    };

    BottomNav.init();
    
    window.BottomNav = BottomNav;
})();
