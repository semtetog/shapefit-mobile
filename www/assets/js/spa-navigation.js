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
        
        // Extrair scripts que precisam ser executados
        const scripts = Array.from(doc.querySelectorAll('script[src], script:not([src])'));
        
        // Extrair título
        const title = doc.querySelector('title')?.textContent || document.title;
        
        // Extrair estilos inline específicos da página
        const inlineStyles = Array.from(doc.querySelectorAll('style'));
        
        return {
            content,
            scripts,
            title,
            inlineStyles
        };
    }
    
    // Executar scripts da nova página
    function executeScripts(scripts) {
        scripts.forEach(script => {
            if (script.src) {
                // Script externo - verificar se já foi carregado
                const existing = document.querySelector(`script[src="${script.src}"]`);
                if (!existing) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    newScript.async = false;
                    document.head.appendChild(newScript);
                }
            } else {
                // Script inline - executar
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
            }
        });
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
            
            // Fade out rápido
            currentContainer.style.opacity = '0';
            currentContainer.style.transition = 'opacity 0.15s ease';
            
            await new Promise(resolve => setTimeout(resolve, 150));
            
            // Preservar bottom-nav (não remover durante navegação)
            const bottomNav = document.querySelector('.bottom-nav');
            
            // Substituir conteúdo
            currentContainer.innerHTML = content;
            
            // Garantir que bottom-nav ainda está no body (caso tenha sido removido)
            if (bottomNav && !document.body.contains(bottomNav)) {
                document.body.appendChild(bottomNav);
            }
            
            // Adicionar estilos inline
            addInlineStyles(inlineStyles);
            
            // Atualizar título
            document.title = title;
            
            // Scroll para o topo
            currentContainer.scrollTop = 0;
            
            // Fade in
            currentContainer.style.opacity = '1';
            
            // Executar scripts após um pequeno delay para garantir que o DOM está pronto
            setTimeout(() => {
                executeScripts(scripts);
                
                // Disparar evento customizado para scripts que dependem dele
                window.dispatchEvent(new CustomEvent('spa-page-loaded', { 
                    detail: { url } 
                }));
                
                // Remover classe de transição
                setTimeout(() => {
                    document.body.classList.remove('page-transitioning');
                    isNavigating = false;
                }, 100);
            }, 50);
            
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
    
    // Adicionar CSS para transições suaves
    const style = document.createElement('style');
    style.textContent = `
        .page-transitioning .app-container,
        .page-transitioning .container {
            transition: opacity 0.15s ease;
        }
        
        body.page-transitioning {
            pointer-events: none;
        }
        
        body.page-transitioning .bottom-nav {
            pointer-events: auto;
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

