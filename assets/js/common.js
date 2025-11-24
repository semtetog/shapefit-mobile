// common.js - Funções comuns para todas as páginas HTML

// Inicialização comum
(function() {
    // Definir BASE_APP_URL se não estiver definido
    if (!window.BASE_APP_URL) {
        window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        if (window.BASE_APP_URL.endsWith('/')) {
            window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
        }
    }
    
    // Verificar autenticação em todas as páginas (exceto login/register)
    const publicPages = ['login.html', 'register.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!publicPages.includes(currentPage) && typeof requireAuth === 'function') {
        requireAuth().then(authenticated => {
            if (!authenticated) {
                // Já redirecionou para login
                return;
            }
        });
    }
})();

// Função helper para fazer requisições autenticadas
async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            clearAuthToken();
            window.location.href = `${window.BASE_APP_URL}/auth/login.php`;
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Função helper para escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para obter data local no formato YYYY-MM-DD (não UTC)
function getLocalDateString(date = null) {
    const d = date ? new Date(date) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Função para adicionar/subtrair dias (local)
function addDaysLocal(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return getLocalDateString(d);
}

// Função helper para formatar data
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = getLocalDateString();
    const yesterdayStr = addDaysLocal(todayStr, -1);
    
    if (dateStr === todayStr) {
        return 'Hoje';
    } else if (dateStr === yesterdayStr) {
        return 'Ontem';
    } else {
        return date.toLocaleDateString('pt-BR');
    }
}

// Exportar funções globais
window.apiRequest = apiRequest;
window.escapeHtml = escapeHtml;
window.formatDate = formatDate;
window.getLocalDateString = getLocalDateString;
window.addDaysLocal = addDaysLocal;

