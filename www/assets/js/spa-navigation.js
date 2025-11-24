// Sistema de Navegação SPA (Single Page Application)
// Mantém background e navbar fixos, troca apenas o conteúdo
// Elimina o "piscar" entre páginas

(function() {
    'use strict';
    
    let isNavigating = false;
    let currentPage = window.location.pathname;
    
    // Páginas que devem usar navegação normal (não AJAX)
    const excludedPages = [
        '/auth/login.html',
        '/auth/register.html',
        '/onboarding/onboarding.html'
    ];
    
    // Verificar se a página atual deve ser excluída
    function shouldExcludePage(url) {
        return excludedPages.some(excluded => url.includes(excluded));
    }
    
    // Extrair conteúdo do HTML recebido
    function extractPageContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extrair o conteúdo do app-container
        const appContainer = doc.querySelector('.app-container, .container');
        const content = appContainer ? appContainer.innerHTML : '';
        
        // Extrair TODOS os scripts (incluindo os que estão dentro do app-container)
        // Primeiro pegar scripts do head
        const headScripts = Array.from(doc.head.querySelectorAll('script'));
        // Depois pegar scripts do body (incluindo dentro do app-container)
        const bodyScripts = Array.from(doc.body.querySelectorAll('script'));
        // Combinar todos, removendo duplicatas por src
        const allScripts = [];
        const seenSrcs = new Set();
        
        [...headScripts, ...bodyScripts].forEach(script => {
            if (script.src) {
                if (!seenSrcs.has(script.src)) {
                    seenSrcs.add(script.src);
                    allScripts.push(script);
                }
            } else {
                // Script inline - sempre incluir
                allScripts.push(script);
            }
        });
        
        // Extrair título
        const title = doc.querySelector('title')?.textContent || document.title;
        
        // Extrair estilos inline específicos da página
        const inlineStyles = Array.from(doc.querySelectorAll('style'));
        
        return {
            content,
            scripts: allScripts,
            title,
            inlineStyles
        };
    }
    
    // Executar scripts da nova página
    function executeScripts(scripts) {
        const scriptPromises = [];
        
        scripts.forEach(script => {
            if (script.src) {
                // Script externo - verificar se já foi carregado
                const existing = document.querySelector(`script[src="${script.src}"]`);
                if (!existing) {
                    const promise = new Promise((resolve, reject) => {
                        const newScript = document.createElement('script');
                        newScript.src = script.src;
                        newScript.async = false;
                        newScript.onload = resolve;
                        newScript.onerror = reject;
                        document.head.appendChild(newScript);
                    });
                    scriptPromises.push(promise);
                }
            } else {
                // Script inline - executar diretamente usando eval ou Function
                // Isso garante que IIFEs sejam executados
                try {
                    // Criar script e executar
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    // Adicionar ao body para executar no contexto correto
                    document.body.appendChild(newScript);
                    // Remover após execução para não poluir o DOM
                    setTimeout(() => {
                        if (newScript.parentNode) {
                            newScript.parentNode.removeChild(newScript);
                        }
                    }, 0);
                } catch (e) {
                    console.error('[SPA] Erro ao executar script inline:', e);
                }
            }
        });
        
        return Promise.all(scriptPromises);
    }
    
    // Adicionar estilos inline
    function addInlineStyles(styles) {
        styles.forEach(style => {
            const newStyle = document.createElement('style');
            newStyle.textContent = style.textContent;
            document.head.appendChild(newStyle);
        });
    }
    
    // Navegar para uma nova página via AJAX
    async function navigateToPage(url) {
        if (isNavigating) return;
        if (shouldExcludePage(url)) {
            window.location.href = url;
            return;
        }
        
        isNavigating = true;
        
        try {
            // Adicionar classe de transição
            document.body.classList.add('page-transitioning');
            
            // Fazer fetch da nova página
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const html = await response.text();
            const { content, scripts, title, inlineStyles } = extractPageContent(html);
            
            // Encontrar o container atual
            const currentContainer = document.querySelector('.app-container, .container');
            if (!currentContainer) {
                throw new Error('Container não encontrado');
            }
            
            // Preservar bottom-nav (não remover durante navegação)
            const bottomNav = document.querySelector('.bottom-nav');
            
            // Extrair scripts que estão dentro do conteúdo ANTES de substituir
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = content;
            const inlineScriptsFromContent = Array.from(contentDiv.querySelectorAll('script:not([src])'));
            
            // Fade out muito rápido (quase instantâneo para evitar "arrastar")
            currentContainer.style.opacity = '0';
            currentContainer.style.transition = 'opacity 0.1s ease';
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Substituir conteúdo (scripts inline serão removidos, mas já foram extraídos)
            currentContainer.innerHTML = content;
            
            // Remover scripts inline do conteúdo para evitar duplicação
            currentContainer.querySelectorAll('script:not([src])').forEach(script => {
                script.remove();
            });
            
            // Garantir que bottom-nav ainda está no body (caso tenha sido removido)
            if (bottomNav && !document.body.contains(bottomNav)) {
                document.body.appendChild(bottomNav);
            }
            
            // Adicionar estilos inline
            addInlineStyles(inlineStyles);
            
            // Atualizar título
            document.title = title;
            
            // Scroll para o topo ANTES do fade in para evitar "arrastar"
            currentContainer.scrollTop = 0;
            
            // Executar scripts ANTES do fade in para garantir que tudo está pronto
            // Primeiro scripts externos e do head
            await executeScripts(scripts);
            
            // Depois scripts inline que estavam dentro do conteúdo
            inlineScriptsFromContent.forEach(script => {
                try {
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    document.body.appendChild(newScript);
                    // Remover após execução
                    setTimeout(() => {
                        if (newScript.parentNode) {
                            newScript.parentNode.removeChild(newScript);
                        }
                    }, 0);
                } catch (e) {
                    console.error('[SPA] Erro ao executar script inline do conteúdo:', e);
                }
            });
            
            // Pequeno delay para garantir que todos os scripts executaram
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Disparar eventos para que as páginas saibam que foram carregadas
            // Primeiro DOMContentLoaded (para compatibilidade)
            const domContentLoadedEvent = new Event('DOMContentLoaded', { bubbles: true, cancelable: true });
            document.dispatchEvent(domContentLoadedEvent);
            
            // Depois o evento customizado SPA
            window.dispatchEvent(new CustomEvent('spa-page-loaded', { 
                detail: { url, isSPANavigation: true } 
            }));
            
            // Fade in após eventos serem disparados
            currentContainer.style.opacity = '1';
            
            // Forçar re-execução de códigos de inicialização para páginas específicas
            const pageName = url.split('/').pop().split('?')[0];
            setTimeout(() => {
                // Para main_app.html - forçar re-execução do código de carregamento
                if (pageName === 'main_app.html' || pageName === 'dashboard.html') {
                    const dashboardContainer = document.getElementById('dashboard-container');
                    if (dashboardContainer && dashboardContainer.style.display === 'none') {
                        // Se o container está escondido, significa que os dados não foram carregados
                        // Disparar um evento específico para forçar reload
                        window.dispatchEvent(new CustomEvent('spa-reload-page-data', { 
                            detail: { page: pageName } 
                        }));
                    }
                }
                
                // Para outras páginas que usam loadPageData ou similar
                if (typeof window.loadPageData === 'function') {
                    try {
                        window.loadPageData();
                    } catch (e) {
                        console.error('[SPA] Erro ao chamar loadPageData:', e);
                    }
                }
            }, 200);
            
            // Remover classe de transição
            setTimeout(() => {
                document.body.classList.remove('page-transitioning');
                isNavigating = false;
            }, 150);
            
            // Atualizar URL sem recarregar
            window.history.pushState({ url }, '', url);
            currentPage = url;
            
            // Atualizar bottom-nav se existir
            updateBottomNav(url);
            
        } catch (error) {
            console.error('Erro na navegação AJAX:', error);
            // Fallback para navegação normal
            window.location.href = url;
        }
    }
    
    // Interceptar cliques em links
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Ignorar links externos, âncoras, downloads, etc
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
        const url = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);
        
        // Se for a mesma origem, usar navegação AJAX
        if (url.origin === currentUrl.origin) {
            e.preventDefault();
            navigateToPage(url.pathname + url.search + url.hash);
        }
    }, true);
    
    // Lidar com botões de voltar/avançar do navegador
    window.addEventListener('popstate', function(e) {
        if (e.state && e.state.url) {
            navigateToPage(e.state.url);
        } else {
            // Recarregar a página atual
            window.location.reload();
        }
    });
    
    // Atualizar bottom-nav após navegação
    function updateBottomNav(url) {
        // Usar a função do bottom-nav.js se disponível
        if (typeof updateActiveItem === 'function') {
            updateActiveItem();
        } else {
            // Fallback manual
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
            
            const pageName = url.split('/').pop().split('?')[0];
            const activeItem = bottomNavMap[pageName] || 'home';
            
            // Atualizar classes ativas
            document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
                item.classList.remove('active');
                const href = item.getAttribute('href');
                if (href) {
                    const itemPage = href.split('/').pop().split('?')[0];
                    if (bottomNavMap[itemPage] === activeItem) {
                        item.classList.add('active');
                    }
                }
            });
        }
    }
    
    // Exportar função para uso manual
    window.spaNavigate = function(url) {
        navigateToPage(url);
    };
    
    // Adicionar CSS para transições suaves (sem "arrastar")
    const style = document.createElement('style');
    style.textContent = `
        .app-container,
        .container {
            transition: opacity 0.1s ease !important;
            will-change: opacity;
        }
        
        .page-transitioning .app-container,
        .page-transitioning .container {
            transition: opacity 0.1s ease !important;
        }
        
        body.page-transitioning {
            pointer-events: none;
        }
        
        body.page-transitioning .bottom-nav {
            pointer-events: auto;
        }
        
        /* Prevenir qualquer transformação que cause "arrastar" */
        .app-container,
        .container {
            transform: none !important;
            left: 0 !important;
            right: 0 !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
    `;
    document.head.appendChild(style);
    
    // Atualizar bottom-nav quando página SPA carregar
    window.addEventListener('spa-page-loaded', function(e) {
        if (e.detail && e.detail.url) {
            updateBottomNav(e.detail.url);
        }
    });
    
    // Atualizar bottom-nav na carga inicial também
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => updateBottomNav(window.location.pathname), 100);
        });
    } else {
        setTimeout(() => updateBottomNav(window.location.pathname), 100);
    }
    
    console.log('[SPA Navigation] Sistema de navegação AJAX ativado');
})();

