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
        // Cache de páginas para evitar requisições repetidas na mesma sessão
        pageCache: new Map(),
        loadedScripts: new Set(),
        pageScripts: {
            '/login.html': './assets/js/pages/login.js',
            '/register.html': './assets/js/pages/register.js'
            // Adicionar outros mapeamentos conforme forem externalizados
        },
        
        // Container principal
        container: null,
        
        // Estado atual
        currentUrl: null,

        init() {
            this.container = document.getElementById('spa-container');
            if (!this.container) return;

            // Interceptar cliques em links
            document.addEventListener('click', (e) => this.handleLinkClick(e));
            
            // Interceptar botões de voltar do navegador
            window.addEventListener('popstate', () => this.handlePopState());
            
            // Expor API global
            window.SPANavigator = this;
            
            // Carregar página inicial baseada na URL atual
            this.loadInitialPage();
        },

        handleLinkClick(e) {
            // Encontrar o link mais próximo
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            
            // Ignorar links externos, âncoras ou vazios
            if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) return;

            // Prevenir navegação padrão
            e.preventDefault();
            
            // Navegar via SPA
            this.navigate(href);
        },

        handlePopState() {
            // Navegar para a URL atual do histórico
            this.loadPage(window.location.pathname + window.location.search, false);
        },

        async navigate(url, pushToHistory = true) {
            if (pushToHistory) {
                window.history.pushState({}, '', url);
            }
            await this.loadPage(url);
        },

        async loadPage(url) {
            const normalizedUrl = this.normalizeUrl(url);
            const fetchPath = this.getFetchPath(normalizedUrl);
            
            console.log('[SPA] Carregando:', normalizedUrl);

            // Mostrar loading se demorar mais que 200ms
            const loadingTimeout = setTimeout(() => this.showLoader(), 200);

            try {
                let htmlContent;

                // Verificar cache
                if (this.pageCache.has(normalizedUrl)) {
                    htmlContent = this.pageCache.get(normalizedUrl);
                } else {
                    const response = await fetch(fetchPath);
                    if (!response.ok) throw new Error('Erro ao carregar página');
                    const text = await response.text();
                    
                    // PROCESSAMENTO CRÍTICO: Limpar scripts para evitar loops
                    htmlContent = this.cleanHTML(text);
                    
                    // Salvar no cache
                    this.pageCache.set(normalizedUrl, htmlContent);
                }

                clearTimeout(loadingTimeout);
                this.hideLoader();

                // Injetar conteúdo
                await this.render(htmlContent, normalizedUrl);

            } catch (error) {
                clearTimeout(loadingTimeout);
                console.error('[SPA] Erro:', error);
                // Fallback: se falhar, deixa o navegador carregar normalmente (segurança)
                window.location.href = url;
            }
        },

        cleanHTML(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 1. Remover todos os scripts (evita loops e re-execução)
            doc.querySelectorAll('script').forEach(el => el.remove());
            
            // 2. Tentar pegar apenas o container principal se existir
            const appContainer = doc.querySelector('.app-container') || doc.querySelector('.container');
            
            if (appContainer) {
                // Se achou container, retorna ele (preservando a tag container e classes)
                return appContainer.outerHTML;
            } else {
                // Se não, retorna o body inteiro (mas sem scripts)
                return doc.body.innerHTML;
            }
        },

        async render(html, url) {
            if (!this.container) return;

            // Efeito visual simples de fade
            this.container.style.opacity = '0';
            await this.sleep(120);
            
            this.container.innerHTML = html;
            this.container.style.opacity = '1';
            
            // Scroll para o topo
            window.scrollTo(0, 0);
            
            // Garantir que os scripts específicos da página estejam carregados
            await this.ensurePageScript(url);
            
            // Disparar evento para inicializar a lógica da página (uma vez só)
            this.dispatchPageEvent(url);
            
            // Atualizar menu inferior
            this.updateBottomNav(url);
        },

        dispatchPageEvent(url) {
            const event = new CustomEvent('spa:page-loaded', { 
                detail: { url: url } 
            });
            window.dispatchEvent(event);
        },

        updateBottomNav(url) {
            // Simples highlight do menu
            const navItems = document.querySelectorAll('.bottom-nav a');
            if (!navItems.length) return;

            navItems.forEach(link => {
                const href = link.getAttribute('href');
                if (!href) return;
                link.classList.toggle('active', url.includes(href.replace('./', '/')));
            });
        },

        showLoader() {
            const loader = document.getElementById('spa-loader');
            if (loader) loader.style.display = 'flex';
            document.body.classList.add('spa-loading');
        },

        hideLoader() {
            const loader = document.getElementById('spa-loader');
            if (loader) loader.style.display = 'none';
            document.body.classList.remove('spa-loading');
        },

        normalizeUrl(url) {
            if (!url) return '/';
            try {
                const parsed = new URL(url, window.location.origin);
                return parsed.pathname + parsed.search;
            } catch (err) {
                let clean = url.replace(window.location.origin, '');
                if (!clean.startsWith('/')) {
                    clean = clean.startsWith('./') ? clean.slice(1) : `/${clean}`;
                }
                return clean;
            }
        },

        getFetchPath(normalizedUrl) {
            if (!normalizedUrl || normalizedUrl === '/' || normalizedUrl === '/index.html') {
                return './';
            }
            return normalizedUrl.startsWith('/') ? `.${normalizedUrl}` : normalizedUrl;
        },

        async ensurePageScript(url) {
            const path = this.normalizeUrl(url).split('?')[0];
            const scriptPath = this.pageScripts[path];
            if (!scriptPath || this.loadedScripts.has(scriptPath)) {
                return;
            }

            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = scriptPath;
                script.async = true;
                script.onload = () => {
                    this.loadedScripts.add(scriptPath);
                    resolve();
                };
                script.onerror = (err) => {
                    console.error('[SPA] Erro ao carregar script da página:', scriptPath, err);
                    resolve(); // Continua mesmo assim para não travar
                };
                document.body.appendChild(script);
            });
        },

        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },

        loadInitialPage() {
            // Carregar a página atual via SPA ou redirecionar para dashboard/login
            const currentPath = this.normalizeUrl(window.location.pathname);
            if (currentPath !== '/' && currentPath !== '/index.html') {
                return;
            }

            let target = './login.html';
            if (typeof window.getAuthToken === 'function' && window.getAuthToken()) {
                target = './main_app.html';
            }

            window.history.replaceState({}, '', target);
            this.loadPage(target);
        }
    };

    // Iniciar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => SPA.init());

})();

