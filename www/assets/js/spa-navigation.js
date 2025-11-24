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
    
    // Limpar elementos duplicados antes de inserir novo conteúdo
    function cleanupPageElements() {
        // Remover bottom-navs duplicados (manter apenas um)
        const bottomNavs = document.querySelectorAll('.bottom-nav');
        if (bottomNavs.length > 1) {
            // Manter apenas o primeiro, remover os outros
            for (let i = 1; i < bottomNavs.length; i++) {
                bottomNavs[i].remove();
            }
        }
        
        // Remover scripts duplicados do bottom-nav
        const bottomNavScripts = document.querySelectorAll('script[src*="bottom-nav.js"]');
        if (bottomNavScripts.length > 1) {
            for (let i = 1; i < bottomNavScripts.length; i++) {
                bottomNavScripts[i].remove();
            }
        }
        
        // Limpar carrossel de banners duplicados
        const carousels = document.querySelectorAll('.main-carousel');
        if (carousels.length > 1) {
            // Manter apenas o primeiro, remover os outros
            for (let i = 1; i < carousels.length; i++) {
                carousels[i].remove();
            }
        }
        
        // Limpar slides duplicados dentro do carrossel
        const carousel = document.querySelector('.main-carousel');
        if (carousel) {
            const slides = carousel.querySelectorAll('.lottie-slide');
            const expectedSlides = 4; // Número esperado de slides
            if (slides.length > expectedSlides) {
                // Remover slides extras (manter apenas os primeiros 4)
                for (let i = expectedSlides; i < slides.length; i++) {
                    slides[i].remove();
                }
            }
            
            // Limpar animações Lottie antigas dentro dos containers
            const lottieContainers = carousel.querySelectorAll('.lottie-animation-container');
            lottieContainers.forEach(container => {
                // Limpar conteúdo mas manter o container
                container.innerHTML = '';
            });
        }
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
    
    // Cache global de scripts já executados (persiste entre navegações)
    if (!window.__spaExecutedScripts) {
        window.__spaExecutedScripts = new Set();
    }
    
    // Executar scripts da nova página
    function executeScripts(scripts) {
        const scriptPromises = [];
        
        scripts.forEach((script, index) => {
            if (script.src) {
                // Script externo - verificar se já foi carregado
                const existing = document.querySelector(`script[src="${script.src}"]`);
                // NÃO recarregar scripts que já estão no DOM (especialmente auth.js, bottom-nav.js, etc)
                if (existing) {
                    // Script já existe, resolver imediatamente
                    scriptPromises.push(Promise.resolve());
                } else if (!window.__spaExecutedScripts.has(script.src)) {
                    // Normalizar src para evitar duplicatas (remover query strings para comparação)
                    const normalizedSrc = script.src.split('?')[0];
                    if (!window.__spaExecutedScripts.has(normalizedSrc)) {
                        window.__spaExecutedScripts.add(normalizedSrc);
                        window.__spaExecutedScripts.add(script.src); // Adicionar também a versão com query
                        
                        const promise = new Promise((resolve, reject) => {
                            const newScript = document.createElement('script');
                            newScript.src = script.src;
                            newScript.async = false;
                            newScript.onload = resolve;
                            newScript.onerror = reject;
                            document.head.appendChild(newScript);
                        });
                        scriptPromises.push(promise);
                    } else {
                        scriptPromises.push(Promise.resolve());
                    }
                } else {
                    scriptPromises.push(Promise.resolve());
                }
            } else {
                // Script inline - criar hash mais robusto
                const scriptText = script.textContent.trim();
                const scriptHash = btoa(scriptText.substring(0, Math.min(200, scriptText.length))).substring(0, 50);
                
                if (!window.__spaExecutedScripts.has(scriptHash)) {
                    window.__spaExecutedScripts.add(scriptHash);
                    
                    try {
                        // Envolver em IIFE para evitar conflitos de escopo e re-declarações
                        const wrappedCode = `
                            (function() {
                                try {
                                    ${scriptText}
                                } catch(e) {
                                    console.error('[SPA] Erro ao executar script inline:', e);
                                }
                            })();
                        `;
                        
                        const newScript = document.createElement('script');
                        newScript.textContent = wrappedCode;
                        document.body.appendChild(newScript);
                        setTimeout(() => {
                            if (newScript.parentNode) {
                                newScript.parentNode.removeChild(newScript);
                            }
                        }, 100);
                    } catch (e) {
                        console.error('[SPA] Erro ao executar script inline:', e);
                    }
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
        
        // Limpar elementos duplicados antes de navegar
        cleanupPageElements();
        
        isNavigating = true;
        
        try {
            // Adicionar classe de transição (apenas para desabilitar cliques)
            document.body.classList.add('page-transitioning');
            
            // Scroll para o topo instantaneamente (sem animação)
            let currentContainer = document.querySelector('.app-container, .container');
            if (!currentContainer) {
                throw new Error('Container não encontrado');
            }
            currentContainer.scrollTop = 0;
            
            // Fazer fetch da nova página
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const html = await response.text();
            const { content, scripts, title, inlineStyles } = extractPageContent(html);
            
            // Preservar bottom-nav (não remover durante navegação)
            const bottomNav = document.querySelector('.bottom-nav');
            
            // TÉCNICA DOUBLE BUFFERING - evitar "piscar" (estilo framework)
            // Criar container temporário invisível para novo conteúdo
            const newContainer = document.createElement('div');
            newContainer.className = currentContainer.className;
            newContainer.style.cssText = currentContainer.style.cssText;
            newContainer.style.position = 'absolute';
            newContainer.style.top = '0';
            newContainer.style.left = '0';
            newContainer.style.width = '100%';
            newContainer.style.height = '100%';
            newContainer.style.opacity = '0';
            newContainer.style.pointerEvents = 'none';
            newContainer.style.visibility = 'hidden';
            
            // Inserir novo container no mesmo pai do container atual
            const parent = currentContainer.parentNode;
            parent.appendChild(newContainer);
            
            // Limpar elementos duplicados ANTES de inserir conteúdo
            cleanupPageElements();
            
            // Se está voltando para main_app, limpar completamente o carrossel ANTES de inserir novo conteúdo
            const pageName = url.split('/').pop().split('?')[0];
            if (pageName === 'main_app.html' || pageName === 'dashboard.html') {
                const existingCarousel = newContainer.querySelector('.main-carousel');
                if (existingCarousel) {
                    console.log('[SPA] Removendo carrossel antigo antes de inserir novo conteúdo');
                    existingCarousel.remove();
                }
            }
            
            // Armazenar pageName para uso posterior
            
            // Inserir novo conteúdo no container temporário
            newContainer.innerHTML = content;
            
            // Scroll para o topo no novo container
            newContainer.scrollTop = 0;
            
            // Limpar novamente após inserir conteúdo (pode ter criado duplicatas)
            cleanupPageElements();
            
            // Forçar reflow para garantir que novo conteúdo está renderizado
            newContainer.offsetHeight;
            
            // Executar scripts inline MAS apenas uma vez (usando hash)
            // Isso garante que funções sejam definidas, mas evita re-declarações
            // IMPORTANTE: buscar scripts no novo container, não no antigo
            const inlineScripts = Array.from(newContainer.querySelectorAll('script:not([src])'));
            inlineScripts.forEach(script => {
                const scriptText = script.textContent.trim();
                if (scriptText) {
                    // Criar hash robusto do script (usar mais caracteres para melhor unicidade)
                    const scriptHash = btoa(scriptText.substring(0, Math.min(500, scriptText.length))).substring(0, 80);
                    
                    // Verificar se script já foi executado
                    if (window.__spaExecutedScripts.has(scriptHash)) {
                        console.log('[SPA] Script inline já executado, pulando');
                        script.remove();
                        return;
                    }
                    
                    // Verificar se funções principais já existem (para scripts do main_app)
                    // Se já existem, não executar novamente
                    const hasMainAppFunctions = typeof window.showCurrentMission !== 'undefined' && 
                                                typeof window.initializeMissionsCarousel !== 'undefined';
                    if (hasMainAppFunctions && scriptText.includes('showCurrentMission') && scriptText.includes('initializeMissionsCarousel')) {
                        console.log('[SPA] Funções do main_app já existem, pulando script');
                        script.remove();
                        return;
                    }
                    
                    // Marcar como executado ANTES de executar
                    window.__spaExecutedScripts.add(scriptHash);
                    
                    try {
                        // Executar script diretamente para que funções fiquem no escopo global
                        const scriptElement = document.createElement('script');
                        scriptElement.textContent = scriptText;
                        document.body.appendChild(scriptElement);
                        
                        // Remover após execução (pequeno delay para garantir execução)
                        setTimeout(() => {
                            if (scriptElement.parentNode) {
                                scriptElement.parentNode.removeChild(scriptElement);
                            }
                        }, 100);
                    } catch (e) {
                        console.error('[SPA] Erro ao executar script inline:', e);
                        // Remover do cache se deu erro
                        window.__spaExecutedScripts.delete(scriptHash);
                    }
                }
                // Remover script do DOM original
                script.remove();
            });
            
            // Executar APENAS scripts externos (scripts inline serão ignorados para evitar re-declarações)
            // Scripts inline devem usar event listeners (spa-page-loaded) para inicialização
            const externalScriptsOnly = scripts.filter(script => script.src);
            await executeScripts(externalScriptsOnly);
            
            // Pequeno delay para garantir que scripts externos carregaram e conteúdo está renderizado
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // SWAP INSTANTÂNEO - trocar containers sem "piscar"
            // REMOVER TODOS OS CONTAINERS ANTIGOS PRIMEIRO (garantir que não há acumulação)
            const allOldContainers = document.querySelectorAll('.app-container, .container');
            allOldContainers.forEach((container, index) => {
                // Manter apenas o currentContainer por enquanto, remover os outros
                if (container !== currentContainer && container !== newContainer) {
                    console.log('[SPA] Removendo container órfão:', container);
                    container.remove();
                }
            });
            
            // Usar requestAnimationFrame para garantir que está no próximo frame
            requestAnimationFrame(() => {
                // Tornar novo container visível
                newContainer.style.opacity = '1';
                newContainer.style.visibility = 'visible';
                newContainer.style.pointerEvents = 'auto';
                newContainer.style.position = 'relative';
                
                // Remover container antigo (garantir que é o correto)
                if (currentContainer && currentContainer.parentNode && currentContainer !== newContainer) {
                    currentContainer.parentNode.removeChild(currentContainer);
                }
                
                // Atualizar referência
                currentContainer = newContainer;
                
                // Verificação final: garantir que há apenas um container
                const finalContainers = document.querySelectorAll('.app-container, .container');
                if (finalContainers.length > 1) {
                    console.warn(`[SPA] Ainda há ${finalContainers.length} containers após swap!`);
                    finalContainers.forEach((container, index) => {
                        if (index > 0 && container !== newContainer) {
                            container.remove();
                        }
                    });
                }
            });
            
            // Garantir que bottom-nav ainda está no body (caso tenha sido removido)
            if (bottomNav && !document.body.contains(bottomNav)) {
                document.body.appendChild(bottomNav);
            }
            
            // Adicionar estilos inline
            addInlineStyles(inlineStyles);
            
            // Atualizar título
            document.title = title;
            
            // Disparar eventos para que as páginas saibam que foram carregadas
            // AGUARDAR o swap do container antes de disparar eventos
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Primeiro DOMContentLoaded (para compatibilidade)
                    const domContentLoadedEvent = new Event('DOMContentLoaded', { bubbles: true, cancelable: true });
                    document.dispatchEvent(domContentLoadedEvent);
                    
                    // Depois o evento customizado SPA
                    window.dispatchEvent(new CustomEvent('spa-page-loaded', { 
                        detail: { url, isSPANavigation: true } 
                    }));
                });
            });
            
            // Forçar re-execução de códigos de inicialização para páginas específicas
            // pageName já foi declarado acima
            // AGUARDAR o swap do container antes de executar
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
            /* Sem transição de opacity - troca instantânea (estilo PWA) */
            will-change: contents;
            /* Garantir que container sempre está visível durante swap */
            transition: none !important;
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

