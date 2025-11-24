/**
 * SPA Navigator - Sistema de navegação sem recarregar WebView
 * CORRIGIDO: Carrega apenas fragmentos HTML, sem scripts
 */

(function() {
    'use strict';

    const SPA = {
        // Cache de fragmentos HTML carregados
        fragmentCache: new Map(),
        
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
            // Interceptar todos os cliques em links ANTES de qualquer coisa
            document.addEventListener('click', this.handleLinkClick.bind(this), true);
            
            // Substituir window.location.href globalmente
            this.patchLocationHref();
            
            // Carregar página inicial
            this.loadInitialPage();
        },

        /**
         * Carrega a página inicial baseada na URL atual
         */
        loadInitialPage() {
            const path = window.location.pathname.split('/').pop() || 'main_app.html';
            const pageId = this.pageMap[path] || this.pageMap['main_app.html'];
            
            if (this.pageMap[path]) {
                this.showPage(pageId, path);
            } else {
                this.navigate('main_app.html', false);
            }
        },

        /**
         * Intercepta cliques em links - PRIORIDADE MÁXIMA
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
                // PREVENIR NAVEGAÇÃO PADRÃO IMEDIATAMENTE
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                // Navegar via SPA
                this.navigate(href, true);
                return false;
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
                    const fragment = await this.loadPageFragment(url);
                    this.injectPageFragment(pageEl, fragment, url);
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

            // Disparar evento customizado para inicialização da página
            const eventName = `spa:enter-${pageId.replace('page-', '')}`;
            window.dispatchEvent(new CustomEvent(eventName, {
                detail: { pageId, url }
            }));

            // Evento genérico também
            window.dispatchEvent(new CustomEvent('spa:page-changed', {
                detail: { pageId, url }
            }));
        },

        /**
         * Carrega apenas o FRAGMENTO HTML (sem scripts, sem head, sem body)
         */
        async loadPageFragment(url) {
            // Verificar cache
            if (this.fragmentCache.has(url)) {
                return this.fragmentCache.get(url);
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
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extrair APENAS o conteúdo do .app-container ou .container
            let fragment = '';
            const appContainer = doc.querySelector('.app-container');
            const container = doc.querySelector('.container');
            const target = appContainer || container;
            
            if (target) {
                fragment = target.innerHTML;
            } else {
                // Fallback: extrair body mas sem scripts
                const body = doc.body;
                if (body) {
                    // Remover todos os scripts do body antes de extrair
                    const scripts = body.querySelectorAll('script');
                    scripts.forEach(script => script.remove());
                    fragment = body.innerHTML;
                }
            }
            
            // Cachear fragmento
            this.fragmentCache.set(url, fragment);
            
            return fragment;
        },

        /**
         * Injeta o fragmento HTML na página
         * NÃO executa scripts - apenas injeta HTML
         */
        injectPageFragment(pageEl, fragment, url) {
            // Limpar o container
            pageEl.innerHTML = '';
            
            // Criar um wrapper para o conteúdo
            const wrapper = document.createElement('div');
            wrapper.className = 'spa-page-content';
            wrapper.innerHTML = fragment;
            
            pageEl.appendChild(wrapper);
            
            // Converter todos os links para usar SPA
            this.convertLinksToSPA(wrapper);
        },

        /**
         * Converte todos os links dentro de um elemento para usar SPA
         */
        convertLinksToSPA(container) {
            const links = container.querySelectorAll('a[href]');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
                
                // Ignorar links externos
                if (href.startsWith('http://') || 
                    href.startsWith('https://') || 
                    href.startsWith('mailto:') || 
                    href.startsWith('tel:') ||
                    href.startsWith('#') ||
                    link.hasAttribute('target') ||
                    link.hasAttribute('download') ||
                    link.hasAttribute('data-no-spa')) {
                    return;
                }
                
                // Verificar se é página interna
                const pageId = this.getPageIdFromUrl(href);
                if (pageId) {
                    // Remover href e usar onclick
                    link.removeAttribute('href');
                    link.setAttribute('data-spa-link', href);
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.navigate(href, true);
                    }, true);
                }
            });
        },

        /**
         * Faz patch de window.location.href para usar SPA
         */
        patchLocationHref() {
            // Criar função helper global
            window.navigateTo = (url) => {
                const pageId = this.getPageIdFromUrl(url);
                if (pageId) {
                    this.navigate(url, true);
                } else {
                    window.location.href = url;
                }
            };
            
            // Interceptar window.location.href usando uma abordagem diferente
            // Não podemos substituir window.location diretamente, mas podemos
            // criar uma função helper que as páginas devem usar
            window.goToPage = window.navigateTo;
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
