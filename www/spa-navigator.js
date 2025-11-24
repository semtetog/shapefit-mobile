/**
 * SPA Navigator - Versão Segura (Anti-Loop)
 * 
 * Responsabilidades:
 * 1. Interceptar navegação.
 * 2. Carregar HTML via fetch.
 * 3. LIMPAR todos os scripts do HTML carregado (evita loops e requisições duplicadas).
 * 4. Injetar HTML limpo no container.
 * 5. Disparar evento para que o controlador da página saiba que deve agir.
 */

(function() {
    'use strict';

    const SPA = {
        container: document.getElementById('spa-container'),
        
        init() {
            if (!this.container) {
            return;
        }

        // Interceptar links
        document.addEventListener('click', (e) => this.handleLinkClick(e));
        
        // History
        window.addEventListener('popstate', () => this.loadPage(window.location.pathname, false));
        
        // Iniciar com página inicial (main_app se token, senão login)
        this.loadInitialPage();
        },

        handleLinkClick(e) {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('#')) return;

            e.preventDefault();
            this.navigate(href);
        },

        async navigate(url) {
            window.history.pushState({}, '', url);
            await this.loadPage(url);
        },

        async loadPage(url) {
            // Loading
            this.container.style.opacity = '0.5';
            const loader = document.getElementById('spa-loader');
            if (loader) loader.style.display = 'flex';

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Erro ao carregar');
                const html = await response.text();

                // Parse e extrair conteúdo (body ou .app-container)
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                let content = doc.body.innerHTML;

                // Se tem .app-container, usar ele
                const appContainer = doc.querySelector('.app-container');
                if (appContainer) {
                    content = appContainer.outerHTML;
                }

                // Injetar com fade
                this.container.innerHTML = content;
                this.container.style.opacity = '1';

                // Scroll top
                window.scrollTo(0, 0);

                // Disparar evento para inicializar página
                window.dispatchEvent(new CustomEvent('spa:page-loaded', { detail: { url } }));

                // Atualizar bottom nav
                this.updateBottomNav(url);

            } catch (error) {
                console.error('SPA erro:', error);
                // Fallback: reload
                window.location.href = url;
            } finally {
                if (loader) loader.style.display = 'none';
            }
        },

        updateBottomNav(url) {
            const nav = document.querySelector('.bottom-nav');
            if (nav) {
                nav.querySelectorAll('a').forEach(a => {
                    a.classList.toggle('active', a.href.includes(url));
                });
            }
        },

        loadInitialPage() {
            // Se há token, main_app, senão login
            if (getAuthToken()) {
                this.navigate('./main_app.html');
            } else {
                this.navigate('./login.html');
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => SPA.init());
})();

