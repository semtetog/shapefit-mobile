// Sistema de navegação SPA para eliminar o "piscar" (white flash)
// Transforma a navegação MPA em SPA interceptando cliques e carregando via AJAX

(function() {
    'use strict';

    // Cache de páginas para navegação instantânea (opcional)
    const pageCache = {};
    
    // Estado da navegação
    let isNavigating = false;

    // Inicializar
    function init() {
        // Evitar inicialização múltipla
        if (window.spaNavigationInitialized) return;
        window.spaNavigationInitialized = true;

        console.log('[SPA] Sistema de navegação iniciado');
        
        // Interceptar cliques em links
        document.addEventListener('click', handleClick);
        
        // Interceptar botão voltar do navegador/celular
        window.addEventListener('popstate', handlePopState);
    }

    // Manipular clique em links
    function handleClick(e) {
        // Encontrar o link mais próximo
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        
        // Ignorar links externos, âncoras, javascript, etc
        if (!href || 
            href.startsWith('http') || 
            href.startsWith('//') || 
            href.startsWith('#') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') || 
            href.startsWith('javascript:') ||
            link.hasAttribute('target') ||
            link.hasAttribute('download')) {
            return;
        }

        // Navegação interna
        e.preventDefault();
        navigateTo(href);
    }

    // Manipular botão voltar
    function handlePopState(e) {
        loadPage(window.location.href, false);
    }

    // Navegar para uma URL
    async function navigateTo(url) {
        if (isNavigating) return;
        
        const targetUrl = new URL(url, window.location.href).href;
        
        if (targetUrl === window.location.href) return;

        window.history.pushState({}, '', targetUrl);
        await loadPage(targetUrl, true);
    }

    // Carregar e renderizar página
    async function loadPage(url, isForward) {
        isNavigating = true;
        
        // Indicador de carregamento sutil (opcional)
        document.body.classList.add('page-loading');

        try {
            let html;
            
            // Tentar carregar do fetch
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro ao carregar ${url}: ${response.status}`);
            html = await response.text();

            // Parsear o HTML recebido
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');

            // Estratégia de Atualização Inteligente
            // 1. Identificar se podemos trocar apenas o conteúdo principal
            const currentContainer = document.querySelector('.app-container');
            const newContainer = newDoc.querySelector('.app-container');
            
            // Verificar se deve remover o Bottom Nav (se a nova página não o tiver)
            const newHasBottomNav = Array.from(newDoc.querySelectorAll('script')).some(s => s.src && s.src.includes('bottom-nav.js'));
            if (!newHasBottomNav) {
                const existingNav = document.querySelector('.bottom-nav');
                if (existingNav) existingNav.remove();
            }

            // Se ambos têm container, faz a troca suave do miolo
            if (currentContainer && newContainer) {
                console.log('[SPA] Trocando apenas .app-container');
                
                // Animação de saída do container atual
                currentContainer.style.opacity = '0';
                currentContainer.style.transform = 'translateY(10px)';
                currentContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                
                await new Promise(r => setTimeout(r, 200));

                // Atualizar atributos do Body (classes, background)
                document.body.className = newDoc.body.className;
                document.body.style.cssText = newDoc.body.style.cssText;
                
                // Trocar conteúdo do container
                currentContainer.innerHTML = newContainer.innerHTML;
                
                // Resetar estilos de animação
                currentContainer.style.opacity = '0';
                currentContainer.style.transform = 'translateY(10px)';
                
                // Forçar reflow
                void currentContainer.offsetWidth;
                
                // Animação de entrada
                currentContainer.style.opacity = '1';
                currentContainer.style.transform = 'translateY(0)';

            } else {
                // Fallback: Troca o Body inteiro (para páginas sem container, ex: scanner)
                console.log('[SPA] Trocando BODY inteiro');
                document.body.classList.add('page-transition-exit');
                await new Promise(r => setTimeout(r, 200));
                document.body.innerHTML = newDoc.body.innerHTML;
                document.body.className = newDoc.body.className;
            }

            // 2. Atualizar Meta Tags e Título
            document.title = newDoc.title;
            updateMetaTags(newDoc);
            updateStyles(newDoc);

            // 3. Executar Scripts (CRUCIAL)
            // Precisamos executar scripts que estão no novo body ou container
            await runScripts(newDoc);

            // 4. Finalização
            document.body.classList.remove('page-loading', 'page-transition-exit');
            window.scrollTo(0, 0);
            
            // Disparar eventos
            document.dispatchEvent(new Event('DOMContentLoaded'));
            window.dispatchEvent(new Event('load'));

        } catch (error) {
            console.error('[SPA] Erro na navegação:', error);
            window.location.href = url; // Fallback
        } finally {
            isNavigating = false;
        }
    }

    function updateMetaTags(newDoc) {
        const newThemeColor = newDoc.querySelector('meta[name="theme-color"]');
        const currentThemeColor = document.querySelector('meta[name="theme-color"]');
        if (newThemeColor && currentThemeColor) {
            currentThemeColor.setAttribute('content', newThemeColor.getAttribute('content'));
        }
    }

    function updateStyles(newDoc) {
        const currentLinks = Array.from(document.querySelectorAll('head link[rel="stylesheet"]'));
        const newLinks = Array.from(newDoc.querySelectorAll('head link[rel="stylesheet"]'));
        const currentHrefs = currentLinks.map(link => link.getAttribute('href'));

        newLinks.forEach(link => {
            if (!currentHrefs.includes(link.getAttribute('href'))) {
                document.head.appendChild(link.cloneNode(true));
            }
        });
    }

    async function runScripts(newDoc) {
        // Coletar scripts do novo documento
        // Filtrar scripts que já estão carregados (para evitar duplicação de libs globais)
        const scripts = Array.from(newDoc.querySelectorAll('script'));
        
        // Lista de scripts que não devem ser re-executados se já estiverem presentes
        const globalScripts = ['jquery', 'auth.js', 'page-transitions.js', 'app-state.js', 'www-config.js'];

        for (const script of scripts) {
            const src = script.getAttribute('src');
            
            // Verificar se é um script global já carregado
            if (src && globalScripts.some(gs => src.includes(gs))) {
                // Se for bottom-nav.js, queremos executar para atualizar o estado
                if (!src.includes('bottom-nav.js')) {
                    continue; 
                }
            }

            const newScript = document.createElement('script');
            Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            
            if (script.src) {
                await new Promise((resolve) => {
                    newScript.onload = resolve;
                    newScript.onerror = resolve;
                    document.body.appendChild(newScript);
                });
            } else {
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
            }
            // Remove after execution to keep DOM clean? No, some scripts might attach events.
        }
    }

    window.smoothNavigate = function(url) {
        navigateTo(url);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
