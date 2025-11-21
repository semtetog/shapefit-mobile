// Configuração para o app mobile Capacitor
(function() {
    // Verificar se está rodando no Capacitor
    if (window.Capacitor || window.CapacitorWeb) {
        // App mobile - usar URL do servidor
        window.BASE_APP_URL = 'https://appshapefit.com';
        console.log('[Mobile App] Configurado para usar servidor remoto:', window.BASE_APP_URL);
    } else {
        // Web - usar URL local dinâmica
        window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        if (window.BASE_APP_URL.endsWith('/')) {
            window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
        }
        console.log('[Web App] Configurado para usar URL local:', window.BASE_APP_URL);
    }
    
    // Definir também para compatibilidade
    if (!window.BASE_URL) {
        window.BASE_URL = window.BASE_APP_URL;
    }
})();


