// Configuração para o app mobile Capacitor
// Este arquivo define a URL base para o app mobile

(function() {
    // SEMPRE usar o servidor remoto para APIs (appshapefit.com)
    // Os arquivos HTML/CSS/JS são servidos localmente, mas as APIs sempre vão para o servidor
    window.BASE_APP_URL = 'https://appshapefit.com';
    
    // Verificar se está rodando no Capacitor (app mobile) apenas para log
    const isCapacitor = window.Capacitor || 
                       window.CapacitorWeb || 
                       window.location.protocol === 'capacitor:' || 
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
    
    if (isCapacitor) {
        console.log('[Mobile App] Detectado Capacitor - usando servidor remoto para APIs:', window.BASE_APP_URL);
    } else {
        console.log('[Web App] Desenvolvimento local - usando servidor remoto para APIs:', window.BASE_APP_URL);
        console.log('[Web App] Arquivos HTML/CSS/JS servidos de:', window.location.origin);
    }
    
    // Definir também para compatibilidade
    if (!window.BASE_URL) {
        window.BASE_URL = window.BASE_APP_URL;
    }
})();
