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
         * Captura TODOS os tipos de elementos clicáveis
         */
        handleLinkClick(event) {
            // 1. Verificar se é link com href
            const link = event.target.closest('a[href]');
            if (link) {
                const href = link.getAttribute('href');
                if (href && !this.isExternalLink(href, link)) {
                    const pageId = this.getPageIdFromUrl(href);
                    if (pageId) {
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        this.navigate(href, true);
                        return false;
                    }
                }
            }
            
            // 2. Verificar se tem data-spa-link
            const spaLink = event.target.closest('[data-spa-link]');
            if (spaLink) {
                const href = spaLink.getAttribute('data-spa-link');
                if (href) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    this.navigate(href, true);
                    return false;
                }
            }
            
            // 3. Verificar se tem data-link
            const dataLink = event.target.closest('[data-link]');
            if (dataLink) {
                const href = dataLink.getAttribute('data-link');
                if (href && this.getPageIdFromUrl(href)) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    this.navigate(href, true);
                    return false;
                }
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
                console.warn('Página não mapeada:', url);
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
                    throw error;
                }
            }

            // Mostrar página
            pageEl.classList.add('active');
            this.currentPage = pageId;

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
            
            // Converter TODOS os elementos de navegação para usar SPA
            // Isso deve ser feito ANTES de qualquer script rodar
            this.convertLinksToSPA(wrapper);
            
            // Usar MutationObserver para capturar elementos adicionados dinamicamente
            this.observeDynamicElements(wrapper);
        },
        
        /**
         * Observa elementos adicionados dinamicamente e converte para SPA
         */
        observeDynamicElements(container) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            // Converter links em elementos recém-adicionados
                            this.convertLinksToSPA(node);
                        }
                    });
                });
            });
            
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        },

        /**
         * Converte TODOS os elementos de navegação para usar SPA
         * Intercepta: href, onclick, data-spa-link, form actions, etc.
         */
        convertLinksToSPA(container) {
            // 1. Links com href
            const links = container.querySelectorAll('a[href]');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
                
                // Ignorar links externos
                if (this.isExternalLink(href, link)) {
                    return;
                }
                
                // Verificar se é página interna
                const pageId = this.getPageIdFromUrl(href);
                if (pageId) {
                    this.convertElementToSPA(link, href);
                }
            });
            
            // 2. Elementos com data-spa-link
            const dataLinks = container.querySelectorAll('[data-spa-link]');
            dataLinks.forEach(el => {
                const href = el.getAttribute('data-spa-link');
                if (href && this.getPageIdFromUrl(href)) {
                    this.convertElementToSPA(el, href);
                }
            });
            
            // 3. Elementos com onclick que usam location.href
            const onclickElements = container.querySelectorAll('[onclick]');
            onclickElements.forEach(el => {
                const onclickCode = el.getAttribute('onclick');
                if (!onclickCode) return;
                
                // Procurar por location.href, window.location.href, etc.
                const urlMatch = onclickCode.match(/(?:location|window\.location|document\.location)(?:\.href)?\s*=\s*['"]([^'"]+\.html[^'"]*)['"]/i);
                if (urlMatch) {
                    const url = urlMatch[1];
                    if (this.getPageIdFromUrl(url)) {
                        // Remover onclick antigo e substituir
                        el.removeAttribute('onclick');
                        this.convertElementToSPA(el, url);
                    }
                }
            });
            
            // 4. Forms com action
            const forms = container.querySelectorAll('form[action]');
            forms.forEach(form => {
                const action = form.getAttribute('action');
                if (action && this.getPageIdFromUrl(action)) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        // Processar form normalmente, depois navegar
                        const formData = new FormData(form);
                        // Se houver lógica de submit, executar aqui
                        // Depois navegar
                        this.navigate(action, true);
                    }, true);
                }
            });
            
            // 5. Botões com formaction
            const formButtons = container.querySelectorAll('button[formaction], input[formaction]');
            formButtons.forEach(btn => {
                const action = btn.getAttribute('formaction');
                if (action && this.getPageIdFromUrl(action)) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.navigate(action, true);
                    }, true);
                }
            });
            
            // 6. Elementos com data-link (outro padrão comum)
            const dataLinkElements = container.querySelectorAll('[data-link]');
            dataLinkElements.forEach(el => {
                const href = el.getAttribute('data-link');
                if (href && this.getPageIdFromUrl(href)) {
                    this.convertElementToSPA(el, href);
                }
            });
        },
        
        /**
         * Verifica se um link é externo
         */
        isExternalLink(href, element) {
            return href.startsWith('http://') || 
                   href.startsWith('https://') || 
                   href.startsWith('mailto:') || 
                   href.startsWith('tel:') ||
                   href.startsWith('#') ||
                   href.startsWith('javascript:') ||
                   element.hasAttribute('target') ||
                   element.hasAttribute('download') ||
                   element.hasAttribute('data-no-spa');
        },
        
        /**
         * Converte um elemento para usar navegação SPA
         */
        convertElementToSPA(element, url) {
            // Remover href se existir
            if (element.hasAttribute('href')) {
                element.removeAttribute('href');
            }
            
            // Adicionar data-spa-link
            element.setAttribute('data-spa-link', url);
            
            // Adicionar cursor pointer se não tiver
            if (!element.style.cursor) {
                element.style.cursor = 'pointer';
            }
            
            // Adicionar listener (usar capture para pegar antes de outros)
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.navigate(url, true);
                return false;
            }, true);
        },

        /**
         * Faz patch de window.location.href para usar SPA
         * Intercepta TODAS as formas de navegação programática
         */
        patchLocationHref() {
            const self = this;
            
            // Criar função helper global
            window.navigateTo = (url) => {
                const pageId = self.getPageIdFromUrl(url);
                if (pageId) {
                    self.navigate(url, true);
                } else {
                    window.location.href = url;
                }
            };
            
            window.goToPage = window.navigateTo;
            
            // Interceptar window.location.href usando Proxy (quando possível)
            // Criar um objeto proxy para location que intercepta assignments
            try {
                const originalLocation = window.location;
                
                // Interceptar location.href = "..." via Object.defineProperty
                let locationHrefDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
                if (!locationHrefDescriptor) {
                    locationHrefDescriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'location');
                }
                
                // Criar getter/setter customizado para location.href
                Object.defineProperty(window, '_location', {
                    value: originalLocation,
                    writable: false,
                    configurable: false
                });
                
                // Interceptar assignments diretos a location
                // Nota: Não podemos substituir window.location completamente por questões de segurança
                // Mas podemos interceptar através de MutationObserver e event listeners
            } catch (e) {
                console.warn('Não foi possível interceptar window.location completamente:', e);
            }
            
            // Interceptar chamadas comuns de navegação via função wrapper
            window.redirectTo = function(url) {
                if (window.SPANavigator) {
                    window.SPANavigator.navigate(url, true);
                } else {
                    window.location.href = url;
                }
            };
            
            // Interceptar location.replace também
            const originalReplace = window.location.replace;
            window.location.replace = function(url) {
                const pageId = self.getPageIdFromUrl(url);
                if (pageId) {
                    self.navigate(url, true);
                } else {
                    originalReplace.call(window.location, url);
                }
            };
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
