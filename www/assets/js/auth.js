// auth.js - Sistema de autenticação para páginas HTML
// Este arquivo gerencia tokens e autenticação para o Capacitor

const AUTH_TOKEN_KEY = 'shapefit_auth_token';
// Não declarar BASE_APP_URL aqui - usar window.BASE_APP_URL diretamente

/**
 * Obtém o token de autenticação do localStorage
 */
function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Salva o token de autenticação no localStorage
 */
function setAuthToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove o token de autenticação
 */
function clearAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Verifica se o usuário está autenticado
 */
async function isAuthenticated() {
    const token = getAuthToken();
    if (!token) {
        console.log('isAuthenticated: Nenhum token encontrado');
        return false;
    }
    
    // Se tem token, assumir que está autenticado (verificação será feita nas requisições)
    // Isso evita redirecionamentos desnecessários quando há problemas de rede
    return true;
    
    // Código comentado - verificação no servidor será feita nas requisições individuais
    /*
    // Usar BASE_APP_URL que foi definido pelo www-config.js
    // NÃO usar window.location.origin pois no Capacitor é localhost
    if (!window.BASE_APP_URL) {
        console.error('[auth.js] BASE_APP_URL não foi definido!');
        return false;
    }
    
    const baseUrl = window.BASE_APP_URL;
    
    try {
        console.log('[auth.js] Verificando token em:', `${baseUrl}/api/verify_token.php`);
        const response = await fetch(`${baseUrl}/api/verify_token.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
        
        const result = await response.json();
        console.log('Token verification result:', result);
        return result.success === true;
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return false;
    }
    */
}

/**
 * Requer autenticação - redireciona para login se não estiver autenticado
 */
async function requireAuth() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        // Usar navegação SPA quando possível para evitar tela preta
        console.log('Redirecionando para login');
        // Fallback simples aqui: allow full reload em contextos fora do shell principal
        const targetUrl = './auth/login.html';
        if (window.smoothNavigate) {
            window.smoothNavigate(targetUrl);
        } else if (window.SpaRouter && typeof window.SpaRouter.navigate === 'function') {
            window.SpaRouter.navigate(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
        return false;
    }
    return true;
}

/**
 * Faz uma requisição autenticada para a API
 */
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    // Se é FormData, NÃO definir headers manualmente - deixar o browser fazer
    const isFormData = options.body instanceof FormData;
    
    const headers = {};
    
    // Se não é FormData, copiar headers do options e adicionar JSON se necessário
    if (!isFormData) {
        headers['Content-Type'] = options.headers?.['Content-Type'] || options.headers?.['content-type'] || 'application/json';
        // Copiar outros headers se existirem
        if (options.headers) {
            Object.keys(options.headers).forEach(key => {
                if (key.toLowerCase() !== 'content-type') {
                    headers[key] = options.headers[key];
                }
            });
        }
    } else {
        // Para FormData, NÃO definir Content-Type - o browser precisa fazer isso automaticamente
        // Copiar apenas headers que não são Content-Type
        if (options.headers) {
            Object.keys(options.headers).forEach(key => {
                if (key.toLowerCase() !== 'content-type') {
                    headers[key] = options.headers[key];
                }
            });
        }
    }
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Enviando requisição autenticada para:', url, isFormData ? '(FormData - sem Content-Type)' : '(JSON)');
    } else {
        console.warn('authenticatedFetch: Nenhum token disponível');
    }
    
    // Criar objeto de opções
    const fetchOptions = {
        method: options.method || 'GET',
        body: options.body,
    };
    
    // Para FormData, NÃO definir headers - deixar o browser fazer automaticamente
    // Isso é crítico para que o browser defina o Content-Type correto com boundary
    if (!isFormData) {
        fetchOptions.headers = headers;
    } else {
        // Para FormData, criar headers apenas com Authorization (se houver token)
        // NÃO incluir Content-Type - o browser vai fazer isso automaticamente
        const formDataHeaders = {};
        if (token) {
            formDataHeaders['Authorization'] = `Bearer ${token}`;
        }
        // Copiar outros headers do options (exceto Content-Type)
        if (options.headers) {
            Object.keys(options.headers).forEach(key => {
                const lowerKey = key.toLowerCase();
                if (lowerKey !== 'content-type' && lowerKey !== 'authorization') {
                    formDataHeaders[key] = options.headers[key];
                }
            });
        }
        // Só definir headers se houver algo para adicionar
        if (Object.keys(formDataHeaders).length > 0) {
            fetchOptions.headers = formDataHeaders;
        }
        // Se não houver headers, não definir a propriedade headers - isso permite o browser definir automaticamente
    }
    
    console.log('Fetch options:', {
        method: fetchOptions.method,
        hasBody: !!fetchOptions.body,
        isFormData: isFormData,
        headers: fetchOptions.headers || '(não definido - browser vai definir)'
    });
    
    const response = await fetch(url, fetchOptions);
    
    console.log('Response status:', response.status, 'URL:', url);
    
    // Se receber 401, token inválido - limpar e redirecionar
    if (response.status === 401) {
        console.error('Token inválido (401) - redirecionando para login');
        clearAuthToken();
        // Usar navegação SPA quando possível para evitar tela preta
        const targetUrl = './auth/login.html';
        if (window.smoothNavigate) {
            window.smoothNavigate(targetUrl);
        } else if (window.SpaRouter && typeof window.SpaRouter.navigate === 'function') {
            window.SpaRouter.navigate(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
        return null;
    }
    
    return response;
}

// Exportar funções para uso global
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;
window.clearAuthToken = clearAuthToken;
window.isAuthenticated = isAuthenticated;
window.requireAuth = requireAuth;
window.authenticatedFetch = authenticatedFetch;

// Carregar page-transitions.js automaticamente se disponível
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadPageTransitions();
        });
    } else {
        loadPageTransitions();
    }
    
    function loadPageTransitions() {
        // Verificar se já foi carregado
        if (window.pageTransitionsLoaded) return;
        
        // Tentar carregar o script de transições
        const script = document.createElement('script');
        script.src = './assets/js/page-transitions.js';
        script.onerror = function() {
            // Se falhar, tentar caminho relativo
            const script2 = document.createElement('script');
            script2.src = '../assets/js/page-transitions.js';
            script2.onerror = function() {
                // Se ainda falhar, não fazer nada (página pode não ter o arquivo)
            };
            document.head.appendChild(script2);
        };
        document.head.appendChild(script);
        window.pageTransitionsLoaded = true;
    }
})();

// Carregar network-monitor.js automaticamente
(function() {
    const scriptId = 'network-monitor-script';
    if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = './assets/js/network-monitor.js';
        script.onerror = function() {
            // Se falhar, tentar caminho relativo
            const script2 = document.createElement('script');
            script2.src = '../assets/js/network-monitor.js';
            script2.onerror = function() {
                // Se ainda falhar, não fazer nada (página pode não ter o arquivo)
            };
            document.head.appendChild(script2);
        };
        document.head.appendChild(script);
    }
})();

