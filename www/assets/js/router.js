// router.js - Sistema de roteamento SPA para o aplicativo
// Gerencia navegação entre páginas sem recarregar a página
// Carrega fragmentos HTML de screens/ e dispara eventos SPA

class SPARouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.currentView = null;
        this.currentPageName = null;
        this.container = null;
        this.loadedStyles = new Set(); // Rastrear CSS carregados
        this.loadedScripts = new Set(); // Rastrear JS carregados
        this.init();
    }

    init() {
        // Container onde as views serão renderizadas (spa-container)
        this.container = document.getElementById('spa-container') || document.getElementById('app-container') || document.body;
        
        // Registrar rotas padrão
        this.registerRoutes();
        
        // Interceptar cliques em links
        this.interceptLinks();
        
        // Escutar mudanças no hash/URL
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Carregar rota inicial
        this.handleRoute();
    }

    registerRoutes() {
        // Mapear rotas para fragmentos HTML em screens/
        // Formato: rota -> { fragment: 'screens/nome.html', pageName: 'nome' }
        const routeMap = {
            '/': { fragment: 'screens/main_app.html', pageName: 'main_app' },
            '/home': { fragment: 'screens/main_app.html', pageName: 'main_app' },
            '/main_app': { fragment: 'screens/main_app.html', pageName: 'main_app' },
            '/dashboard': { fragment: 'screens/dashboard.html', pageName: 'dashboard' },
            '/diary': { fragment: 'screens/diary.html', pageName: 'diary' },
            '/progress': { fragment: 'screens/progress.html', pageName: 'progress' },
            '/routine': { fragment: 'screens/routine.html', pageName: 'routine' },
            '/explore_recipes': { fragment: 'screens/explore_recipes.html', pageName: 'explore_recipes' },
            '/favorite_recipes': { fragment: 'screens/favorite_recipes.html', pageName: 'favorite_recipes' },
            '/view_recipe': { fragment: 'screens/view_recipe.html', pageName: 'view_recipe' },
            '/add_food_to_diary': { fragment: 'screens/add_food_to_diary.html', pageName: 'add_food_to_diary' },
            '/create_custom_food': { fragment: 'screens/create_custom_food.html', pageName: 'create_custom_food' },
            '/edit_meal': { fragment: 'screens/edit_meal.html', pageName: 'edit_meal' },
            '/edit_profile': { fragment: 'screens/edit_profile.html', pageName: 'edit_profile' },
            '/edit_exercises': { fragment: 'screens/edit_exercises.html', pageName: 'edit_exercises' },
            '/measurements_progress': { fragment: 'screens/measurements_progress.html', pageName: 'measurements_progress' },
            '/more_options': { fragment: 'screens/more_options.html', pageName: 'more_options' },
            '/points_history': { fragment: 'screens/points_history.html', pageName: 'points_history' },
            '/ranking': { fragment: 'screens/ranking.html', pageName: 'ranking' },
            '/content': { fragment: 'screens/content.html', pageName: 'content' },
            '/view_content': { fragment: 'screens/view_content.html', pageName: 'view_content' },
            '/scan_barcode': { fragment: 'screens/scan_barcode.html', pageName: 'scan_barcode' },
            '/onboarding': { fragment: 'screens/onboarding.html', pageName: 'onboarding' },
            '/main_app': { fragment: 'screens/main_app.html', pageName: 'main_app' },
            '/login': { fragment: 'screens/login.html', pageName: 'login' },
            '/register': { fragment: 'screens/register.html', pageName: 'register' }
        };

        // Registrar cada rota
        Object.entries(routeMap).forEach(([route, config]) => {
            this.routes.set(route, config);
        });
    }

    interceptLinks() {
        // Interceptar todos os cliques em links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            
            // Ignorar links externos, âncoras, e links com target="_blank"
            if (href.startsWith('http') || 
                href.startsWith('mailto:') || 
                href.startsWith('tel:') ||
                href.startsWith('#') ||
                link.getAttribute('target') === '_blank' ||
                link.hasAttribute('download')) {
                return;
            }

            // Ignorar links para arquivos PHP (requerem navegação real)
            if (href.includes('.php')) {
                return;
            }

            // Interceptar navegação
            e.preventDefault();
            this.navigate(href);
        });
    }

    navigate(path, replace = false) {
        // Limpar query string e hash do path
        const cleanPath = path.split('?')[0].split('#')[0];
        
        // Obter query string e hash se existirem
        const url = new URL(path, window.location.origin);
        const queryString = url.search;
        const hash = url.hash;

        // Atualizar URL sem recarregar página
        const fullPath = cleanPath + queryString + hash;
        
        if (replace) {
            window.history.replaceState(null, '', fullPath);
        } else {
            window.history.pushState(null, '', fullPath);
        }

        // Carregar rota
        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        const queryString = window.location.search;
        const hash = window.location.hash;

        // Normalizar path (remover base path se necessário)
        let normalizedPath = path;
        if (normalizedPath.endsWith('/') && normalizedPath !== '/') {
            normalizedPath = normalizedPath.slice(0, -1);
        }

        // Tentar encontrar rota exata
        let routeConfig = this.routes.get(normalizedPath);
        
        // Se não encontrar, tentar encontrar por nome de arquivo
        if (!routeConfig) {
            const fileName = normalizedPath.split('/').pop();
            for (const [route, config] of this.routes.entries()) {
                if (config.pageName === fileName) {
                    routeConfig = config;
                    break;
                }
            }
        }

        // Se ainda não encontrou, usar rota padrão
        if (!routeConfig) {
            routeConfig = this.routes.get('/') || { fragment: 'screens/main_app.html', pageName: 'main_app' };
        }

        // Carregar view
        await this.loadView(routeConfig, queryString, hash);
    }

    async loadView(routeConfig, queryString = '', hash = '') {
        try {
            const { fragment, pageName } = routeConfig;
            
            // Disparar evento de saída da página anterior
            if (this.currentPageName) {
                window.dispatchEvent(new CustomEvent(`spa:leave-${this.currentPageName}`, {
                    detail: { pageName: this.currentPageName }
                }));
            }

            // Limpar view anterior
            if (this.container) {
                this.container.innerHTML = '';
            }
            this.currentView = null;

            // Construir URL completa do fragmento
            // Para desenvolvimento local (npm run serve), usar caminho relativo a partir de www/
            // Para produção, usar BASE_APP_URL se definido
            let fullUrl;
            if (fragment.startsWith('http')) {
                fullUrl = `${fragment}${queryString}${hash}`;
            } else {
                // Em desenvolvimento local, usar caminho relativo a partir da raiz do servidor (www/)
                // Em produção, usar BASE_APP_URL se disponível
                const isLocalDev = window.location.hostname === 'localhost' || 
                                   window.location.hostname === '127.0.0.1' ||
                                   window.location.port === '8100';
                
                if (isLocalDev || !window.BASE_APP_URL) {
                    // Desenvolvimento local - caminho relativo a partir de www/
                    // screens/ já está dentro de www/, então usar ./screens/
                    fullUrl = `./${fragment}${queryString}${hash}`;
                } else {
                    // Produção - usar BASE_APP_URL
                    fullUrl = `${window.BASE_APP_URL}/${fragment}${queryString}${hash}`;
                }
            }

            // Carregar HTML do fragmento
            const response = await fetch(fullUrl);
            if (!response.ok) {
                throw new Error(`Erro ao carregar ${fragment}: ${response.status}`);
            }

            const html = await response.text();
            
            // O fragmento deve ser apenas HTML puro (sem <html>, <head>, <body>)
            // Inserir diretamente no container
            if (this.container) {
                this.container.innerHTML = html;
                this.currentView = this.container;
            } else {
                // Fallback: criar container temporário
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                this.currentView = tempDiv;
                document.body.appendChild(tempDiv);
            }

            // Carregar CSS específico da página (se existir)
            await this.loadPageCSS(pageName);

            // Carregar JS específico da página (se existir)
            await this.loadPageJS(pageName);

            // Atualizar estado
            this.currentRoute = fragment;
            this.currentPageName = pageName;

            // Disparar evento de entrada da nova página
            window.dispatchEvent(new CustomEvent(`spa:enter-${pageName}`, {
                detail: { pageName, queryString, hash }
            }));

            // Disparar evento genérico de mudança de rota
            window.dispatchEvent(new CustomEvent('routeChanged', {
                detail: { route: fragment, pageName, queryString, hash }
            }));

            // Scroll para o topo
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Erro ao carregar view:', error);
            this.showError(`Erro ao carregar página: ${error.message}`);
        }
    }

    async loadPageCSS(pageName) {
        // Mapear nomes de páginas para arquivos CSS (pode ter múltiplos CSS por página)
        const cssMap = {
            'main_app': [
                'assets/css/main_app_specific.css',
                'assets/css/main_app_glass_theme.css',
                'assets/css/pages/_dashboard.css'
            ],
            'dashboard': [
                'assets/css/dashboard_page.css',
                'assets/css/pages/_dashboard.css'
            ],
            'diary': [
                'assets/css/diary_page_specific.css',
                'assets/css/diary.css'
            ],
            'progress': [
                'assets/css/progress_page_specific.css',
                'assets/css/progress_page.css'
            ],
            'routine': [
                'assets/css/routine_page_specific.css',
                'assets/css/routine_page.css'
            ],
            'more_options': [
                'assets/css/more_options_page_specific.css',
                'assets/css/more_options.css'
            ],
            'points_history': [
                'assets/css/points_history_page_specific.css',
                'assets/css/points_history.css'
            ],
            'ranking': [
                'assets/css/ranking_page_specific.css',
                'assets/css/ranking_page.css'
            ],
            'content': [
                'assets/css/content_page_specific.css'
            ],
            'scan_barcode': [
                'assets/css/scan_barcode_page_specific.css'
            ],
            'edit_profile': [
                'assets/css/edit_profile_page_specific.css',
                'assets/css/edit_profile.css',
                'assets/css/profile_overview.css'
            ],
            'add_food_to_diary': [
                'assets/css/add-food-page.css'
            ],
            'explore_recipes': [
                'assets/css/recipe_list_specific.css'
            ],
            'favorite_recipes': [
                'assets/css/recipe_list_specific.css'
            ],
            'view_recipe': [
                'assets/css/recipe_detail_page.css'
            ],
            'create_custom_food': [
                'assets/css/add-food-page.css'
            ],
            'edit_meal': [
                'assets/css/add-food-page.css'
            ],
            'measurements_progress': [
                'assets/css/measurements.css'
            ],
            'login': [
                'assets/css/auth_login_page.css'
            ],
            'register': [
                'assets/css/auth_register_page.css'
            ],
            'onboarding': [
                'assets/css/pages/_onboarding.css'
            ]
        };

        const cssPaths = cssMap[pageName];
        if (!cssPaths || cssPaths.length === 0) return;
        
        // Carregar todos os CSS da página
        const loadPromises = cssPaths.map(cssPath => this.loadSingleCSS(cssPath));
        await Promise.all(loadPromises);
    }
    
    async loadSingleCSS(cssPath) {

        // Para desenvolvimento local, usar caminho relativo a partir de www/
        const isLocalDev = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.port === '8100';
        
        let fullCssPath;
        if (cssPath.startsWith('http')) {
            fullCssPath = cssPath;
        } else if (isLocalDev || !window.BASE_APP_URL) {
            // assets/ está dentro de www/, então usar ./assets/
            fullCssPath = `./${cssPath}`;
        } else {
            fullCssPath = `${window.BASE_APP_URL}/${cssPath}`;
        }

        // Verificar se já foi carregado
        if (this.loadedStyles.has(fullCssPath)) {
            return Promise.resolve();
        }

        // Carregar CSS dinamicamente
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fullCssPath;
            link.onload = () => {
                this.loadedStyles.add(fullCssPath);
                resolve();
            };
            link.onerror = () => {
                console.warn(`[Router] CSS não encontrado: ${fullCssPath}`);
                resolve(); // Resolver mesmo com erro para não bloquear
            };
            document.head.appendChild(link);
        });
    }

    async loadPageJS(pageName) {
        // Mapear nomes de páginas para arquivos JS
        const jsMap = {
            'dashboard': 'assets/js/dashboard_logic.js',
            'diary': 'assets/js/diary_page_logic.js',
            'progress': 'assets/js/progress_page_logic.js',
            'routine': 'assets/js/routine_page_logic.js',
            'more_options': 'assets/js/more_options_logic.js',
            'points_history': 'assets/js/points_history_logic.js',
            'ranking': 'assets/js/ranking_page_logic.js',
            'content': 'assets/js/content_page_logic.js',
            'scan_barcode': 'assets/js/scan_barcode_logic.js',
            'edit_profile': 'assets/js/edit_profile_logic.js',
            'login': 'assets/js/auth_login_logic.js',
            'register': 'assets/js/auth_register_logic.js',
            'view_content': 'assets/js/view_content_logic.js',
            'favorite_recipes': 'assets/js/favorite_recipes_logic.js',
            'explore_recipes': 'assets/js/explore_recipes_logic.js',
            'view_recipe': 'assets/js/view_recipe_logic.js',
            'create_custom_food': 'assets/js/create_custom_food_logic.js',
            'edit_meal': 'assets/js/edit_meal_logic.js',
            'edit_exercises': 'assets/js/edit_exercises_logic.js',
            'add_food_to_diary': 'assets/js/add_food_logic.js',
            'measurements_progress': 'assets/js/measurements_logic.js',
            'onboarding': 'assets/js/onboarding_logic.js',
            'main_app': ['assets/js/main_app_logic.js', 'assets/js/script.js']
        };

        const jsPaths = jsMap[pageName];
        if (!jsPaths) return;
        
        // Se for array, carregar todos os JS
        const jsPathArray = Array.isArray(jsPaths) ? jsPaths : [jsPaths];
        
        // Carregar todos os JS da página
        const loadPromises = jsPathArray.map(jsPath => {
            // Para desenvolvimento local, usar caminho relativo a partir de www/
            const isLocalDev = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' ||
                               window.location.port === '8100';
            
            let fullJsPath;
            if (jsPath.startsWith('http')) {
                fullJsPath = jsPath;
            } else if (isLocalDev || !window.BASE_APP_URL) {
                // assets/ está dentro de www/, então usar ./assets/
                fullJsPath = `./${jsPath}`;
            } else {
                fullJsPath = `${window.BASE_APP_URL}/${jsPath}`;
            }

            // Verificar se já foi carregado
            if (this.loadedScripts.has(fullJsPath)) {
                return Promise.resolve();
            }

            // Carregar JS dinamicamente
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = fullJsPath;
                script.onload = () => {
                    this.loadedScripts.add(fullJsPath);
                    resolve();
                };
                script.onerror = (e) => {
                    console.warn(`[Router] Erro ao carregar JS: ${fullJsPath}`, e);
                    resolve(); // Não rejeitar para não bloquear outros JS
                };
                document.head.appendChild(script);
            });
        });
        
        return Promise.all(loadPromises);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'spa-error';
        errorDiv.style.cssText = `
            padding: 20px;
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.3);
            border-radius: 8px;
            color: var(--text-primary, #fff);
            text-align: center;
            margin: 20px;
        `;
        errorDiv.textContent = message;
        
        if (this.container) {
            this.container.innerHTML = '';
            this.container.appendChild(errorDiv);
        }
    }
}

// Inicializar router quando DOM estiver pronto
let router;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        router = new SPARouter();
        window.router = router;
    });
} else {
    router = new SPARouter();
    window.router = router;
}

// Função helper para navegação programática
window.navigateTo = function(path, replace = false) {
    if (router) {
        router.navigate(path, replace);
    } else {
        window.location.href = path;
    }
};
