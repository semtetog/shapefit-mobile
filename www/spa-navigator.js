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
            // Usar capture phase (true) para pegar ANTES de outros handlers
            document.addEventListener('click', this.handleLinkClick.bind(this), true);
            
            // Interceptar também antesunload para prevenir navegação acidental
            window.addEventListener('beforeunload', (e) => {
                // Se estamos em SPA, não permitir navegação padrão
                if (this.currentPage) {
                    // Não fazer nada - deixar SPA gerenciar
                }
            });
            
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
         * USA CAPTURE PHASE para pegar ANTES de qualquer outro handler
         */
        handleLinkClick(event) {
            // Se já foi prevenido, não fazer nada
            if (event.defaultPrevented) return;
            
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
                if (href && this.getPageIdFromUrl(href)) {
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
         * OTIMIZADO: Zero piscar, transição instantânea
         */
        async showPage(pageId, url) {
            // Se já está na página, não fazer nada
            if (this.currentPage === pageId) return;

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
                    const pageData = await this.loadPageFragment(url);
                    // INJETAR HTML PRIMEIRO
                    this.injectPageFragment(pageEl, pageData, url);
                    pageEl.dataset.loaded = 'true';
                    
                    // AGUARDAR scripts carregarem antes de mostrar página
                    await this.waitForPageScripts(pageEl);
                } catch (error) {
                    console.error('Erro ao carregar página:', error);
                    throw error;
                }
            }

            // TROCAR PÁGINAS INSTANTANEAMENTE (sem transição para evitar piscar)
            // Usar requestAnimationFrame para garantir renderização suave
            requestAnimationFrame(() => {
                // Esconder página atual
                if (this.currentPage) {
                    const currentEl = document.getElementById(this.currentPage);
                    if (currentEl) {
                        currentEl.classList.remove('active');
                    }
                }

                // Mostrar nova página IMEDIATAMENTE
                pageEl.classList.add('active');
                this.currentPage = pageId;

                // Disparar eventos após renderização
                requestAnimationFrame(() => {
                    const eventName = `spa:enter-${pageId.replace('page-', '')}`;
                    window.dispatchEvent(new CustomEvent(eventName, {
                        detail: { pageId, url }
                    }));

                    window.dispatchEvent(new CustomEvent('spa:page-changed', {
                        detail: { pageId, url }
                    }));
                    
                    // Executar verificação de autenticação após mudança de página
                    if (typeof window.requireAuth === 'function') {
                        // Verificar se não é página pública
                        const publicPages = ['login.html', 'register.html', 'index.html'];
                        const pageName = url.split('/').pop() || '';
                        if (!publicPages.includes(pageName)) {
                            window.requireAuth().catch(err => console.error('Erro na autenticação:', err));
                        }
                    }
                });
            });
        },

        /**
         * Carrega o FRAGMENTO HTML + ESTILOS + SCRIPTS da página
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
            
            // Extrair conteúdo do .app-container ou .container
            let fragment = '';
            const appContainer = doc.querySelector('.app-container');
            const container = doc.querySelector('.container');
            const target = appContainer || container;
            
            if (target) {
                fragment = target.innerHTML;
            } else {
                // Fallback: extrair body mas sem scripts globais
                const body = doc.body;
                if (body) {
                    // Remover scripts globais do body antes de extrair
                    const scripts = body.querySelectorAll('script');
                    scripts.forEach(script => {
                        const src = script.getAttribute('src');
                        // Remover apenas scripts globais
                        if (src && (
                            src.includes('www-config.js') ||
                            src.includes('auth.js') ||
                            src.includes('common.js') ||
                            src.includes('bottom-nav.js') ||
                            src.includes('spa-navigator.js') ||
                            src.includes('app-state.js')
                        )) {
                            script.remove();
                        }
                    });
                    fragment = body.innerHTML;
                }
            }
            
            // Extrair estilos do head (CSS específicos da página)
            const pageStyles = {
                links: [],
                inline: []
            };
            
            // Links para CSS específicos
            const styleLinks = doc.head.querySelectorAll('link[rel="stylesheet"]');
            styleLinks.forEach(link => {
                const href = link.getAttribute('href');
                // Carregar TODOS os CSS, exceto os que já estão no index.html
                // O index.html já tem: style.css, spa-pages.css, font-awesome, fonts
                if (href && 
                    !href.includes('spa-pages.css') &&
                    !href.includes('font-awesome') &&
                    !href.includes('fonts.googleapis.com') &&
                    !href.includes('fonts.gstatic.com')) {
                    // Incluir style.css se for específico de página (ex: pages/_dashboard.css)
                    // Mas verificar se não é o style.css principal
                    if (href.includes('style.css') && !href.includes('pages/') && !href.includes('base/') && !href.includes('components/') && !href.includes('layout/')) {
                        // É o style.css principal, já está carregado
                        return;
                    }
                    pageStyles.links.push(href);
                }
            });
            
            // Estilos inline
            const inlineStyles = doc.head.querySelectorAll('style');
            inlineStyles.forEach(style => {
                if (style.textContent && style.textContent.trim()) {
                    pageStyles.inline.push(style.textContent);
                }
            });
            
            // Extrair scripts específicos da página (do body)
            const pageScripts = [];
            const bodyScripts = doc.body.querySelectorAll('script');
            bodyScripts.forEach(script => {
                const src = script.getAttribute('src');
                // Ignorar scripts globais
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
                
                if (src) {
                    pageScripts.push({ type: 'external', src: src });
                } else if (script.textContent && script.textContent.trim()) {
                    pageScripts.push({ type: 'inline', code: script.textContent });
                }
            });
            
            // Cachear tudo
            const cached = {
                fragment: fragment,
                styles: pageStyles,
                scripts: pageScripts
            };
            
            this.fragmentCache.set(url, cached);
            
            return cached;
        },

        /**
         * Injeta o fragmento HTML na página + estilos + scripts
         */
        injectPageFragment(pageEl, pageData, url) {
            // Limpar o container
            pageEl.innerHTML = '';
            
            // 1. CARREGAR ESTILOS ESPECÍFICOS DA PÁGINA
            this.loadPageStyles(pageEl, pageData.styles, url);
            
            // 2. INJETAR HTML
            const wrapper = document.createElement('div');
            wrapper.className = 'spa-page-content';
            wrapper.innerHTML = pageData.fragment;
            pageEl.appendChild(wrapper);
            
            // 3. CONVERTER LINKS PARA SPA (antes de scripts)
            this.convertLinksToSPA(wrapper);
            
            // 4. EXECUTAR SCRIPTS ESPECÍFICOS DA PÁGINA
            // IMPORTANTE: Executar scripts ANTES de observar elementos
            this.executePageScripts(pageEl, pageData.scripts, url);
            
            // 5. OBSERVAR ELEMENTOS DINÂMICOS
            this.observeDynamicElements(wrapper);
        },
        
        /**
         * Carrega estilos específicos da página
         */
        loadPageStyles(pageEl, styles, baseUrl) {
            const pageId = pageEl.id;
            const styleContainerId = `${pageId}-styles`;
            
            // Remover estilos antigos desta página
            const oldContainer = document.getElementById(styleContainerId);
            if (oldContainer) {
                oldContainer.remove();
            }
            
            // Remover estilos antigos desta página
            document.querySelectorAll(`[data-page-style="${pageId}"]`).forEach(el => {
                el.remove();
            });
            
            // Carregar links CSS
            styles.links.forEach(href => {
                // Verificar se já existe
                const existing = document.querySelector(`link[href="${href}"][data-page-style]`);
                if (existing) {
                    existing.setAttribute('data-page-style', pageId);
                    return;
                }
                
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                // Resolver caminho relativo
                let resolvedHref = href;
                if (href.startsWith('./')) {
                    const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
                    resolvedHref = basePath + href.substring(2);
                } else if (!href.startsWith('http') && !href.startsWith('/')) {
                    // Caminho relativo sem ./
                    const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
                    resolvedHref = basePath + href;
                }
                link.href = resolvedHref;
                link.setAttribute('data-page-style', pageId);
                document.head.appendChild(link);
            });
            
            // Adicionar estilos inline
            if (styles.inline.length > 0) {
                const styleEl = document.createElement('style');
                styleEl.setAttribute('data-page-style', pageId);
                styleEl.textContent = styles.inline.join('\n');
                document.head.appendChild(styleEl);
            }
        },
        
        /**
         * Executa scripts específicos da página
         */
        executePageScripts(pageEl, scripts, baseUrl) {
            const externalScripts = [];
            const inlineScripts = [];
            
            // Separar scripts externos e inline
            scripts.forEach((scriptData) => {
                if (scriptData.type === 'external') {
                    externalScripts.push(scriptData);
                } else {
                    inlineScripts.push(scriptData);
                }
            });
            
            // Executar scripts inline PRIMEIRO (sincronamente)
            // IMPORTANTE: Executar no contexto global, não isolado
            inlineScripts.forEach((scriptData) => {
                try {
                    // Executar diretamente no contexto global usando eval
                    // Isso garante que window, document, etc. estejam disponíveis
                    (function() {
                        eval(scriptData.code);
                    })();
                } catch (error) {
                    console.error('Erro ao executar script inline:', error);
                    console.error('Script que falhou:', scriptData.code.substring(0, 200));
                }
            });
            
            // Carregar scripts externos (assincronamente)
            let loadedCount = 0;
            const totalExternal = externalScripts.length;
            
            if (totalExternal === 0) {
                // Se não há scripts externos, disparar DOMContentLoaded imediatamente
                this.triggerPageReady(pageEl);
            } else {
                externalScripts.forEach((scriptData) => {
                    const script = document.createElement('script');
                    script.setAttribute('data-page-script', pageEl.id);
                    
                    let src = scriptData.src;
                    // Resolver caminho relativo
                    if (src.startsWith('./')) {
                        const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
                        src = basePath + src.substring(2);
                    }
                    
                    script.src = src;
                    script.async = false; // Carregar em ordem
                    script.onload = () => {
                        loadedCount++;
                        if (loadedCount === totalExternal) {
                            this.triggerPageReady(pageEl);
                        }
                    };
                    script.onerror = () => {
                        loadedCount++;
                        if (loadedCount === totalExternal) {
                            this.triggerPageReady(pageEl);
                        }
                    };
                    
                    document.head.appendChild(script);
                });
            }
        },
        
        /**
         * Aguarda scripts da página carregarem
         */
        waitForPageScripts(pageEl) {
            return new Promise((resolve) => {
                const scripts = pageEl.querySelectorAll('script[data-page-script]');
                if (scripts.length === 0) {
                    this.triggerPageReady(pageEl);
                    resolve();
                    return;
                }
                
                let loaded = 0;
                const total = scripts.length;
                
                scripts.forEach(script => {
                    if (script.src) {
                        script.onload = () => {
                            loaded++;
                            if (loaded === total) {
                                this.triggerPageReady(pageEl);
                                resolve();
                            }
                        };
                        script.onerror = () => {
                            loaded++;
                            if (loaded === total) {
                                this.triggerPageReady(pageEl);
                                resolve();
                            }
                        };
                    } else {
                        // Script inline já foi executado
                        loaded++;
                        if (loaded === total) {
                            this.triggerPageReady(pageEl);
                            resolve();
                        }
                    }
                });
            });
        },
        
        /**
         * Dispara eventos de ready para a página
         */
        triggerPageReady(pageEl) {
            // Disparar DOMContentLoaded IMEDIATAMENTE
            // Usar CustomEvent para garantir que seja capturado
            const domReadyEvent = new CustomEvent('DOMContentLoaded', { 
                bubbles: true, 
                cancelable: true 
            });
            
            // Disparar no pageEl primeiro
            pageEl.dispatchEvent(domReadyEvent);
            
            // Disparar no document também (para scripts que escutam document)
            document.dispatchEvent(domReadyEvent);
            
            // Disparar evento customizado para inicialização de página
            const pageId = pageEl.id.replace('page-', '');
            const enterEvent = new CustomEvent(`spa:enter-${pageId}`, {
                detail: { pageId: pageEl.id, url: window.location.href }
            });
            window.dispatchEvent(enterEvent);
            
            // Garantir que scripts que dependem de window.load também funcionem
            if (document.readyState === 'complete') {
                const loadEvent = new Event('load', { bubbles: true });
                window.dispatchEvent(loadEvent);
            }
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
                }
            };
            
            window.goToPage = window.navigateTo;
            
            // Interceptar chamadas comuns de navegação via função wrapper
            window.redirectTo = function(url) {
                if (window.SPANavigator) {
                    window.SPANavigator.navigate(url, true);
                }
            };
            
            // Interceptar location.replace
            const originalReplace = window.location.replace;
            window.location.replace = function(url) {
                const pageId = self.getPageIdFromUrl(url);
                if (pageId) {
                    self.navigate(url, true);
                } else {
                    originalReplace.call(window.location, url);
                }
            };
            
            // Interceptar location.reload - NUNCA recarregar no SPA
            const originalReload = window.location.reload;
            const reloadHandler = function(forceReload) {
                // Se for uma página SPA, apenas atualizar a página atual
                if (self.currentPage) {
                    const currentUrl = window.location.pathname.split('/').pop() || 'main_app.html';
                    // Disparar evento de "reload" para páginas que precisam atualizar dados
                    window.dispatchEvent(new CustomEvent('spa:page-reload', {
                        detail: { pageId: self.currentPage, url: currentUrl }
                    }));
                    // Mostrar página novamente (pode recarregar dados)
                    self.showPage(self.currentPage, currentUrl);
                } else {
                    originalReload.call(window.location, forceReload);
                }
            };
            
            window.location.reload = reloadHandler;
            window.reload = reloadHandler;
            
            // Interceptar também document.location.reload se existir
            if (document.location && document.location.reload) {
                document.location.reload = reloadHandler;
            }
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
