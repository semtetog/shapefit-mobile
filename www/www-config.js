// Configuração para o app mobile Capacitor
// Este arquivo define a URL base para o app mobile

(function() {
    // Verificar se está rodando no Capacitor (app mobile)
    // Capacitor usa localhost ou capacitor:// protocol
    const isCapacitor = window.Capacitor || 
                       window.CapacitorWeb || 
                       window.location.protocol === 'capacitor:' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '' ||
                       (window.location.hostname === '' && window.location.protocol === 'http:') ||
                       (window.location.hostname === '' && window.location.protocol === 'https:');
    
    if (isCapacitor) {
        // App mobile - usar URL do servidor remoto para APIs
        window.BASE_APP_URL = 'https://appshapefit.com';
        console.log('[Mobile App] Detectado Capacitor - usando servidor remoto para APIs:', window.BASE_APP_URL);
    } else {
        // Web - usar URL local dinâmica
        window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        if (window.BASE_APP_URL.endsWith('/')) {
            window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
        }
        console.log('[Web App] Usando URL local:', window.BASE_APP_URL);
    }
    
    // Definir também para compatibilidade
    if (!window.BASE_URL) {
        window.BASE_URL = window.BASE_APP_URL;
    }
})();
