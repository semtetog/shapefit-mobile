// auth.js - Sistema de autenticação para páginas HTML
// Este arquivo gerencia tokens e autenticação para o Capacitor

const AUTH_TOKEN_KEY = 'shapefit_auth_token';
const BASE_APP_URL = window.BASE_APP_URL || '';

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
    
    // Se BASE_APP_URL não está definido, tentar detectar
    const baseUrl = window.BASE_APP_URL || (window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/'));
    
    try {
        console.log('Verificando token em:', `${baseUrl}/api/verify_token.php`);
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
}

/**
 * Requer autenticação - redireciona para login se não estiver autenticado
 */
async function requireAuth() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        console.log('Usuário não autenticado, redirecionando para login');
        
        // Se estiver usando router SPA, usar navegação SPA
        if (window.router && typeof window.router.navigate === 'function') {
            console.log('Usando router SPA para redirecionar para /login');
            window.router.navigate('/login');
            return false;
        }
        
        // Caso contrário, usar window.location.href com domínio local
        // Em desenvolvimento local, usar window.location.origin
        // Em produção, usar BASE_APP_URL apenas se necessário
        const isLocalDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname.includes('192.168.') ||
                          window.location.port === '8100';
        
        let loginUrl;
        if (isLocalDev) {
            // Em desenvolvimento local, usar domínio local
            loginUrl = `${window.location.origin}/login`;
        } else {
            // Em produção, tentar usar BASE_APP_URL, mas se não funcionar, usar origin
            const baseUrl = window.BASE_APP_URL || window.location.origin;
            loginUrl = `${baseUrl}/auth/login.html`;
        }
        
        console.log('Redirecionando para login:', loginUrl);
        window.location.href = loginUrl;
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
        
        // Se estiver usando router SPA, usar navegação SPA
        if (window.router && typeof window.router.navigate === 'function') {
            window.router.navigate('/login');
            return null;
        }
        
        // Caso contrário, usar window.location.href com domínio local
        const isLocalDev = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' ||
                          window.location.hostname.includes('192.168.') ||
                          window.location.port === '8100';
        
        let loginUrl;
        if (isLocalDev) {
            loginUrl = `${window.location.origin}/login`;
        } else {
            const baseUrl = window.BASE_APP_URL || window.location.origin;
            loginUrl = `${baseUrl}/auth/login.html`;
        }
        
        window.location.href = loginUrl;
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

