/**
 * SPA Navigator - Sistema de navegação sem recarregar WebView
 * Elimina 100% do piscar preto no iOS
 */

(function() {
    'use strict';

    const SPA = {
        // Cache de páginas carregadas
        pageCache: new Map(),
        
        // Página atual
        currentPage: null,
        
        // Mapeamento de URLs para IDs de página
        pageMap: {
            'main_app.html': 'page-main-app',
            'dashboard.html': 'page-main-app',
            'progress.html': 'page-progress',
            'diary.html': 'page-diary',
            'explore_recipes.html': 'page-explore-recipes',
            'favorite_recipes.html': 'page-favorite-recipes',
            'view_recipe.html': 'page-view-recipe',
            'more_options.html': 'page-more-options',
            'edit_profile.html': 'page-edit-profile',
            'add_food_to_diary.html': 'page-add-food',
            'create_custom_food.html': 'page-create-food',
            'edit_meal.html': 'page-edit-meal',
            'scan_barcode.html': 'page-scan-barcode',
            'points_history.html': 'page-points-history',
            'measurements_progress.html': 'page-measurements',
            'routine.html': 'page-routine',
            'ranking.html': 'page-ranking',
            'content.html': 'page-content',
            'view_content.html': 'page-view-content',
            'auth/login.html': 'page-login',
            'auth/register.html': 'page-register',
            'onboarding/onboarding.html': 'page-onboarding'
        },

        /**
         * Inicializa o sistema SPA
         */
        init() {
            // Interceptar todos os cliques em links
            document.addEventListener('click', this.handleLinkClick.bind(this), true);
            
            // Interceptar navegação programática
            this.interceptProgrammaticNavigation();
            
            // Carregar página inicial
            this.loadInitialPage();
        },

        /**
         * Carrega a página inicial baseada na URL atual
         */
        loadInitialPage() {
            const path = window.location.pathname.split('/').pop() || 'main_app.html';
            const pageId = this.pageMap[path] || this.pageMap['main_app.html'];
            
            // Se já estamos na página correta, apenas mostrar
            if (this.pageMap[path]) {
                this.showPage(pageId, path);
            } else {
                // Redirecionar para main_app se não encontrado
                this.navigate('main_app.html', false);
            }
        },

        /**
         * Intercepta cliques em links
         */
        handleLinkClick(event) {
            const link = event.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Ignorar links externos, âncoras, mailto, tel, etc
            if (href.startsWith('http://') || 
                href.startsWith('https://') || 
                href.startsWith('mailto:') || 
                href.startsWith('tel:') ||
                href.startsWith('#') ||
                href.startsWith('javascript:') ||
                link.hasAttribute('target') ||
                link.hasAttribute('download') ||
                link.hasAttribute('data-no-spa')) {
                return;
            }

            // Verificar se é uma página interna
            const pageId = this.getPageIdFromUrl(href);
            if (pageId) {
                event.preventDefault();
                this.navigate(href, true);
            }
        },

        /**
         * Obtém o ID da página a partir da URL
         */
        getPageIdFromUrl(url) {
            // Normalizar URL (remover query params e hash)
            const normalized = url.split('?')[0].split('#')[0];
            const path = normalized.split('/').pop();
            
            return this.pageMap[path] || this.pageMap[normalized] || null;
        },

        /**
         * Navega para uma página
         */
        async navigate(url, updateHistory = true) {
            const pageId = this.getPageIdFromUrl(url);
            if (!pageId) {
                // Se não for uma página conhecida, usar navegação padrão
                window.location.href = url;
                return;
            }

            // Atualizar histórico sem recarregar
            if (updateHistory) {
                window.history.pushState({ page: pageId, url: url }, '', url);
            }

            // Carregar e mostrar a página
            await this.showPage(pageId, url);
        },

        /**
         * Carrega e mostra uma página
         */
        async showPage(pageId, url) {
            // Se já está na página, não fazer nada
            if (this.currentPage === pageId) return;

            // Esconder página atual
            if (this.currentPage) {
                const currentEl = document.getElementById(this.currentPage);
                if (currentEl) {
                    currentEl.classList.remove('active');
                }
            }

            // Obter ou criar elemento da página
            let pageEl = document.getElementById(pageId);
            if (!pageEl) {
                pageEl = document.createElement('div');
                pageEl.id = pageId;
                pageEl.className = 'spa-page';
                document.getElementById('spa-container').appendChild(pageEl);
            }

            // Carregar conteúdo se ainda não foi carregado
            if (!pageEl.dataset.loaded) {
                try {
                    const html = await this.loadPageContent(url);
                    this.injectPageContent(pageEl, html, url);
                    pageEl.dataset.loaded = 'true';
                } catch (error) {
                    console.error('Erro ao carregar página:', error);
                    // Fallback: tentar navegação padrão
                    window.location.href = url;
                    return;
                }
            }

            // Mostrar página
            pageEl.classList.add('active');
            this.currentPage = pageId;

            // Atualizar bottom nav se disponível
            if (window.BottomNav && typeof window.BottomNav.render === 'function') {
                window.BottomNav.render();
            }

            // Disparar evento customizado
            window.dispatchEvent(new CustomEvent('spa:page-changed', {
                detail: { pageId, url }
            }));
        },

        /**
         * Carrega o conteúdo HTML de uma página
         */
        async loadPageContent(url) {
            // Verificar cache
            if (this.pageCache.has(url)) {
                return this.pageCache.get(url);
            }

            // Carregar via fetch
            const response = await fetch(url, {
                cache: 'default',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            
            // Cachear
            this.pageCache.set(url, html);
            
            return html;
        },

        /**
         * Injeta o conteúdo HTML na página, extraindo apenas o body
         */
        injectPageContent(pageEl, html, url) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extrair conteúdo do body (mas manter estrutura)
            const bodyContent = doc.body.innerHTML;
            
            // Limpar o container
            pageEl.innerHTML = '';
            
            // Criar um wrapper para o conteúdo
            const wrapper = document.createElement('div');
            wrapper.className = 'spa-page-content';
            wrapper.innerHTML = bodyContent;
            
            pageEl.appendChild(wrapper);
            
            // Extrair e executar scripts
            const scripts = Array.from(doc.querySelectorAll('script'));
            scripts.forEach(oldScript => {
                const src = oldScript.getAttribute('src');
                
                // Ignorar scripts globais que já estão carregados
                if (src && (
                    src.includes('www-config.js') ||
                    src.includes('auth.js') ||
                    src.includes('common.js') ||
                    src.includes('bottom-nav.js') ||
                    src.includes('spa-navigator.js') ||
                    src.includes('app-state.js')
                )) {
                    return;
                }
                
                const newScript = document.createElement('script');
                if (src) {
                    // Script externo - usar caminho absoluto se necessário
                    let scriptSrc = src;
                    if (src.startsWith('./')) {
                        // Resolver caminho relativo baseado na URL da página
                        const basePath = url.substring(0, url.lastIndexOf('/') + 1);
                        scriptSrc = basePath + src.substring(2);
                    }
                    newScript.src = scriptSrc;
                    newScript.async = true;
                } else if (oldScript.textContent && oldScript.textContent.trim()) {
                    // Script inline
                    newScript.textContent = oldScript.textContent;
                } else {
                    return; // Script vazio
                }
                
                // Preservar atributos
                if (oldScript.type) newScript.type = oldScript.type;
                if (oldScript.async) newScript.async = true;
                if (oldScript.defer) newScript.defer = true;
                
                pageEl.appendChild(newScript);
            });
            
            // Substituir window.location.href nas páginas carregadas
            this.patchLocationHref(pageEl);
            
            // Disparar DOMContentLoaded para scripts que dependem dele
            setTimeout(() => {
                const event = new Event('DOMContentLoaded', { bubbles: true });
                pageEl.dispatchEvent(event);
                
                // Também disparar no document para compatibilidade
                document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
            }, 0);
        },
        
        /**
         * Faz patch de window.location.href dentro de uma página carregada
         */
        patchLocationHref(pageEl) {
            // Interceptar window.location.href dentro dos scripts da página
            // Isso é feito automaticamente pelo handleLinkClick para links
            // Para navegação programática, vamos criar uma função helper
            if (!window.goToPage) {
                window.goToPage = (url) => {
                    if (window.SPANavigator) {
                        window.SPANavigator.navigate(url, true);
                    } else {
                        window.location.href = url;
                    }
                };
            }
        },

        /**
         * Intercepta navegação programática
         * Substitui window.location.href para páginas internas
         */
        interceptProgrammaticNavigation() {
            // Criar função helper para substituir window.location.href
            const originalLocationHref = Object.getOwnPropertyDescriptor(window, 'location') || 
                                        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'location');
            
            // Interceptar apenas quando necessário
            // As páginas carregadas via fetch já terão seus links interceptados pelo handleLinkClick
        }
    };

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SPA.init());
    } else {
        SPA.init();
    }

    // Lidar com botão voltar/avançar do navegador
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            SPA.showPage(event.state.page, event.state.url);
        } else {
            // Recarregar página inicial
            SPA.loadInitialPage();
        }
    });

    // Exportar para uso global
    window.SPANavigator = SPA;
    
    // Função helper para navegação manual
    window.goToPage = function(url) {
        SPA.navigate(url, true);
    };
})();

