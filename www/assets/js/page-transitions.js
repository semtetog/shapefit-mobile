// Sistema profissional de transições entre páginas
// Previne o "piscar" e cria transições suaves

(function() {
    'use strict';
    
    // Navegação sem transições visuais (sem classes, sem delay)
    function handleNavigation(event, targetUrl) {
        if (event) {
            event.preventDefault();
        }
        if (window.SpaRouter && typeof window.SpaRouter.navigate === 'function') {
            window.SpaRouter.navigate(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
    }
    
    // Interceptar cliques em links internos
    document.addEventListener('DOMContentLoaded', function() {
        // Interceptar todos os links internos
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
        
        // Não usamos mais classes de transição; mantemos apenas a navegação suave via SPA
    });
    
    // Exportar função para uso manual se necessário
    window.smoothNavigate = function(url) {
        handleNavigation(null, url);
    };
})();

