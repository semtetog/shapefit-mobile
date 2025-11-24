// Sistema profissional de transições entre páginas
// Previne o "piscar" e cria transições suaves

(function() {
    'use strict';
    
    // Função para interceptar navegação e adicionar transição
    function handleNavigation(event, targetUrl) {
        // Se já está em transição, ignorar
        if (document.body.classList.contains('page-transitioning')) {
            return;
        }
        
        // Prevenir navegação padrão se for um link interno
        if (event) {
            event.preventDefault();
        }
        
        // Adicionar classe de transição
        document.body.classList.add('page-transitioning');
        
        // Aguardar um frame para garantir que a classe foi aplicada
        requestAnimationFrame(() => {
            // Navegar após pequeno delay para transição visual
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 150);
        });
    }
    
    // Interceptar cliques em links internos
    document.addEventListener('DOMContentLoaded', function() {
        // Interceptar todos os links
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;
            
            // Verificar se é um link interno (não começa com http://, https://, mailto:, tel:, etc)
            if (href.startsWith('http://') || 
                href.startsWith('https://') || 
                href.startsWith('mailto:') || 
                href.startsWith('tel:') ||
                href.startsWith('#') ||
                href.startsWith('javascript:') ||
                link.hasAttribute('target') ||
                link.hasAttribute('download')) {
                return; // Deixar navegação padrão
            }
            
            // É um link interno - adicionar transição
            handleNavigation(e, href);
        }, true); // Usar capture phase para pegar antes de outros handlers
        
        // Remover classe de transição quando a página carregar
        window.addEventListener('pageshow', function(e) {
            // Se a página foi carregada do cache (back/forward ou voltando do segundo plano), não animar
            if (e.persisted) {
                document.body.classList.remove('page-transitioning', 'page-entering');
                // Página foi restaurada do cache - não recarregar dados desnecessariamente
                return;
            }
            
            // Página nova - animar entrada (mas mais rápido para evitar piscar)
            document.body.classList.add('page-entering');
            requestAnimationFrame(() => {
                setTimeout(() => {
                    document.body.classList.remove('page-entering');
                }, 200); // Reduzido de 300 para 200ms
            });
        });
        
        // Prevenir recarregamento quando voltar do segundo plano
        let isPageVisible = true;
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                isPageVisible = false;
            } else {
                isPageVisible = true;
                // Quando voltar, não recarregar - o WebView mantém o estado
                document.body.classList.remove('page-transitioning', 'page-entering');
            }
        });
        
        // Remover classe quando a página estiver totalmente carregada
        if (document.readyState === 'complete') {
            document.body.classList.remove('page-entering');
        } else {
            window.addEventListener('load', function() {
                setTimeout(() => {
                    document.body.classList.remove('page-entering');
                }, 100);
            });
        }
    });
    
    // Interceptar navegação programática usando uma abordagem diferente
    // Não podemos redefinir window.location, então vamos interceptar apenas cliques
    // Para window.location.href, vamos criar uma função wrapper
    
    // Exportar função para uso manual se necessário
    window.smoothNavigate = function(url) {
        handleNavigation(null, url);
    };
})();

