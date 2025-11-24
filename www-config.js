// Configuração para o app mobile Capacitor
(function() {
    // SEMPRE usar o servidor remoto para APIs (appshapefit.com)
    // Os arquivos HTML/CSS/JS são servidos localmente, mas as APIs sempre vão para o servidor
    window.BASE_APP_URL = 'https://appshapefit.com';
    
    // Verificar se está rodando no Capacitor apenas para log
    const isCapacitor = window.Capacitor || window.CapacitorWeb;
    
    if (isCapacitor) {
        console.log('[Mobile App] Configurado para usar servidor remoto:', window.BASE_APP_URL);
    } else {
        console.log('[Web App] Desenvolvimento local - usando servidor remoto para APIs:', window.BASE_APP_URL);
        console.log('[Web App] Arquivos HTML/CSS/JS servidos de:', window.location.origin);
    }
    
    // Definir também para compatibilidade
    if (!window.BASE_URL) {
        window.BASE_URL = window.BASE_APP_URL;
    }
})();


