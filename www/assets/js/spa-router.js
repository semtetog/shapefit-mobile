(function () {
    'use strict';

    /**
     * Router SPA simples para páginas HTML locais.
     * - Intercepta navegação interna e carrega o novo conteúdo via fetch
     * - Reaproveita o shell atual (body, fundo, bottom-nav etc.)
     * - Executa os <script> específicos de cada página após o carregamento
     * - Mantém funcionamento normal se algo der errado (fallback para full reload)
     */

    const SpaRouter = {
        isNavigating: false,

        isInternalUrl(url) {
            try {
                const target = new URL(url, window.location.href);
                const current = new URL(window.location.href);
                if (target.origin !== current.origin) return false;
                // Ignorar âncoras, mailto, tel, javascript:
                if (target.protocol === 'mailto:' || target.protocol === 'tel:') return false;
                return true;
            } catch {
                return false;
            }
        },

        normalizePath(url) {
            const u = new URL(url, window.location.href);
            // Usar caminho relativo a partir da raiz do app (sem domínio)
            return u.pathname.replace(/^\//, '') + u.search + u.hash;
        },

        async navigate(url) {
            if (this.isNavigating) return;
            if (!this.isInternalUrl(url)) {
                window.location.href = url;
                return;
            }

            this.isNavigating = true;
            const target = new URL(url, window.location.href);
            const relativePath = this.normalizePath(target.href);

            try {
                await this.loadPage(relativePath);
                // Atualizar URL no histórico (sem recarregar)
                window.history.pushState({ spa: true }, '', target.pathname + target.search + target.hash);

                // Atualizar bottom nav, se disponível
                if (window.BottomNav && typeof window.BottomNav.render === 'function') {
                    window.BottomNav.render();
                }
            } catch (err) {
                console.error('[SpaRouter] Erro ao navegar, fazendo fallback para reload:', err);
                window.location.href = url;
            } finally {
                this.isNavigating = false;
                document.body.classList.remove('page-transitioning');
                document.body.classList.add('page-entering');
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        document.body.classList.remove('page-entering');
                    }, 200);
                });
            }
        },

        async loadPage(path) {
            console.log('[SpaRouter] Carregando página SPA:', path);

            const response = await fetch(path, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ao carregar ${path}`);
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Atualizar título
            const newTitle = doc.querySelector('title');
            if (newTitle) {
                document.title = newTitle.textContent;
            }

            // === PAGE-SPECIFIC CSS ===
            // Remover estilos antigos marcados como de página
            Array.from(document.head.querySelectorAll('style[data-page-style],link[data-page-style]'))
                .forEach(el => el.remove());

            // Copiar <style> da nova página
            const pageStyles = Array.from(doc.head.querySelectorAll('style'));
            pageStyles.forEach(styleEl => {
                if (!styleEl.textContent || !styleEl.textContent.trim()) return;
                const newStyle = document.createElement('style');
                newStyle.textContent = styleEl.textContent;
                newStyle.setAttribute('data-page-style', 'true');
                document.head.appendChild(newStyle);
            });

            // Copiar <link rel="stylesheet"> que não sejam globais e ainda não existam
            const existingHrefs = new Set(
                Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
                    .map(l => l.getAttribute('href'))
            );
            const pageLinks = Array.from(doc.head.querySelectorAll('link[rel="stylesheet"]'));
            pageLinks.forEach(linkEl => {
                const href = linkEl.getAttribute('href');
                if (!href) return;
                if (existingHrefs.has(href)) return; // já carregado (ex.: style.css)

                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = href;
                newLink.setAttribute('data-page-style', 'true');
                document.head.appendChild(newLink);
            });

            // === CONTEÚDO PRINCIPAL ===
            const newAppContainer = doc.querySelector('.app-container') || doc.body;
            const currentAppContainer = document.querySelector('.app-container') || document.body;

            currentAppContainer.innerHTML = newAppContainer.innerHTML;

            // === SCRIPTS ESPECÍFICOS DA PÁGINA ===
            const pageScripts = Array.from(doc.querySelectorAll('script'));

            const isGlobalScript = (src = '') => {
                return src.includes('www-config.js')
                    || src.includes('auth.js')
                    || src.includes('page-transitions.js')
                    || src.includes('bottom-nav.js')
                    || src.includes('spa-router.js');
            };

            for (const oldScript of pageScripts) {
                const src = oldScript.getAttribute('src');

                // Pular scripts globais; eles já estão carregados no shell
                if (src && isGlobalScript(src)) continue;

                const newScript = document.createElement('script');
                if (src) {
                    newScript.src = src;
                } else if (oldScript.textContent && oldScript.textContent.trim().length > 0) {
                    newScript.textContent = oldScript.textContent;
                } else {
                    continue;
                }
                // Manter atributos importantes (type, async, etc.)
                if (oldScript.type) newScript.type = oldScript.type;
                document.body.appendChild(newScript);
            }
        },

        handlePopState() {
            // Quando o usuário usa back/forward, recarregar o conteúdo da URL atual via SPA
            if (!this.isInternalUrl(window.location.href)) return;
            const path = this.normalizePath(window.location.href);
            this.loadPage(path).catch(err => {
                console.error('[SpaRouter] Erro no popstate, fallback para reload:', err);
                window.location.reload();
            });
        }
    };

    window.SpaRouter = SpaRouter;

    // Inicializar listener de popstate
    window.addEventListener('popstate', function () {
        SpaRouter.handlePopState();
    });

})();


