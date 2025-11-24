// app-state.js - Gerencia o estado do app para evitar recarregamentos desnecessários

(function() {
    'use strict';
    
    // Cache de dados carregados para evitar recarregar quando voltar do segundo plano
    const dataCache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    
    // Função para salvar dados no cache
    window.cachePageData = function(pageKey, data) {
        dataCache.set(pageKey, {
            data: data,
            timestamp: Date.now()
        });
    };
    
    // Função para obter dados do cache
    window.getCachedPageData = function(pageKey) {
        const cached = dataCache.get(pageKey);
        if (!cached) return null;
        
        // Verificar se o cache ainda é válido
        const age = Date.now() - cached.timestamp;
        if (age > CACHE_DURATION) {
            dataCache.delete(pageKey);
            return null;
        }
        
        return cached.data;
    };
    
    // Limpar cache quando necessário
    window.clearPageCache = function(pageKey) {
        if (pageKey) {
            dataCache.delete(pageKey);
        } else {
            dataCache.clear();
        }
    };
    
    // Prevenir recarregamento automático quando voltar do segundo plano
    let wasHidden = false;
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            wasHidden = true;
        } else if (wasHidden) {
            // App voltou do segundo plano
            wasHidden = false;
            // Não fazer nada - deixar o WebView manter o estado
            // As páginas podem verificar se precisam atualizar dados
        }
    });
    
    // Prevenir recarregamento quando a página é restaurada do cache
    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            // Página foi restaurada do cache - não recarregar automaticamente
            console.log('[App State] Página restaurada do cache - mantendo estado');
        }
    });
    
    // Função helper para verificar se deve recarregar dados
    window.shouldReloadData = function(pageKey) {
        const cached = getCachedPageData(pageKey);
        if (!cached) return true;
        
        // Se o cache é recente (menos de 30 segundos), não recarregar
        const age = Date.now() - cached.timestamp;
        return age > 30000; // 30 segundos
    };
})();


