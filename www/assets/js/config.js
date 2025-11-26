// www/assets/js/config.js

(function() {
    // 1. Definição da URL Base (para redirecionamentos internos)
    // IMPORTANTE: Não sobrescrever se já foi definido por common.js
    if (!window.BASE_APP_URL) {
        window.BASE_APP_URL = "https://appshapefit.com";
    }
    
    // 2. API_BASE_URL - SEMPRE usar appshapefit.com/api diretamente
    // Nunca usar proxy local, sempre chamar a API remota
    if (!window.API_BASE_URL) {
        window.API_BASE_URL = 'https://appshapefit.com/api';
    }
    
    console.log('🔧 [Config] BASE_APP_URL:', window.BASE_APP_URL);
    console.log('🔧 [Config] API_BASE_URL:', window.API_BASE_URL);

    // 3. INTERCEPTADOR DE FETCH (A Mágica)
    // Isso conserta todos os scripts antigos que chamam '/api/...'
    const originalFetch = window.fetch;

    window.fetch = async function(input, init) {
        let url = input;

        // Se a URL já é completa (https://), usar diretamente sem interceptar
        if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
            // URL já está completa, usar como está
            console.log(`🔀 [Fetch] URL completa, usando diretamente: ${url}`);
            try {
                return await originalFetch(url, init);
            } catch (error) {
                console.error(`❌ [Fetch] Erro ao fazer requisição para ${url}:`, error);
                throw error;
            }
        }

        // Se a URL for uma string e começar com /api
        // Em desenvolvimento (localhost), deixar passar para o proxy Node.js
        // Em produção, redirecionar para appshapefit.com/api
        if (typeof url === 'string' && url.startsWith('/api')) {
            const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            if (isDevelopment) {
                // Em desenvolvimento, deixar passar para o proxy (não redirecionar)
                // O proxy em serve.js vai interceptar e fazer o proxy para appshapefit.com/api
                console.log(`🔀 [API] Desenvolvimento: usando proxy local para ${url}`);
            } else {
                // Em produção, redirecionar para appshapefit.com/api
                url = window.API_BASE_URL + url.replace('/api', '');
                console.log(`🔀 [API] Produção: redirecionando ${input} -> ${url}`);
            }
        }

        // Se a URL for relativa ./api, corrigir para /api
        if (typeof url === 'string' && url.startsWith('./api')) {
            url = '/api' + url.replace('./api', '');
            // Será tratado acima
        }

        try {
            return await originalFetch(url, init);
        } catch (error) {
            console.error(`❌ [Fetch] Erro ao fazer requisição para ${url}:`, error);
            throw error;
        }
    };
})();