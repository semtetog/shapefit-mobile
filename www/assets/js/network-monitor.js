// network-monitor.js - Monitora status da conexão e mostra popup quando offline

(function() {
    'use strict';
    
    let isOnline = true;
    let offlineModal = null;
    
    // Criar modal de offline
    function createOfflineModal() {
        if (offlineModal) return offlineModal;
        
        const modal = document.createElement('div');
        modal.id = 'offline-modal';
        modal.innerHTML = `
            <div class="offline-modal-overlay"></div>
            <div class="offline-modal-content">
                <div class="offline-modal-icon">
                    <div class="offline-modal-signal">
                        <div class="bar bar-1"></div>
                        <div class="bar bar-2"></div>
                        <div class="bar bar-3"></div>
                    </div>
                </div>
                <h3 class="offline-modal-title">Sem Conexão</h3>
                <p class="offline-modal-message">
                    Parece que você está sem internet no momento.
                </p>
                <p class="offline-modal-submessage">
                    Verifique sua conexão e tente novamente.
                </p>
                <div class="offline-modal-checking" id="offline-modal-checking">
                    <div class="offline-modal-spinner"></div>
                    <span>Verificando conexão...</span>
                </div>
                <button class="offline-modal-button" id="retry-connection-btn">
                    <span class="btn-text">Tente Novamente</span>
                    <span class="btn-spinner" style="display: none;">
                        <div class="offline-modal-spinner"></div>
                    </span>
                </button>
            </div>
        `;
        
        // Adicionar estilos
        if (!document.getElementById('offline-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'offline-modal-styles';
            styles.textContent = `
                #offline-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                #offline-modal.show {
                    display: flex;
                }
                
                .offline-modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
                
                .offline-modal-content {
                    position: relative;
                    background: linear-gradient(165deg, rgba(60, 60, 60, 0.3) 0%, rgba(45, 45, 45, 0.2) 100%);
                    backdrop-filter: blur(40px);
                    -webkit-backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 30px 24px;
                    max-width: 380px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                    transform: scale(0.9) translateY(20px);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                #offline-modal.show .offline-modal-content {
                    transform: scale(1) translateY(0);
                }
                
                .offline-modal-icon {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .offline-modal-signal {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: flex-end;
                    gap: 3px;
                    height: 30px;
                    z-index: 1;
                }
                
                .offline-modal-signal .bar {
                    width: 5px;
                    background: #F44336;
                    border-radius: 3px 3px 0 0;
                    animation: pulse 1.5s ease-in-out infinite;
                }
                
                .offline-modal-signal .bar-1 {
                    height: 10px;
                    animation-delay: 0s;
                }
                
                .offline-modal-signal .bar-2 {
                    height: 16px;
                    animation-delay: 0.2s;
                }
                
                .offline-modal-signal .bar-3 {
                    height: 22px;
                    animation-delay: 0.4s;
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 1;
                    }
                }
                
                .offline-modal-title {
                    font-size: 22px;
                    font-weight: 700;
                    color: #F5F5F5;
                    margin: 0 0 12px 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                
                .offline-modal-message {
                    font-size: 15px;
                    color: #A3A3A3;
                    margin: 0 0 10px 0;
                    line-height: 1.55;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                
                .offline-modal-submessage {
                    font-size: 13px;
                    color: #A3A3A3;
                    opacity: 0.8;
                    margin: 0 0 22px 0;
                    line-height: 1.55;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                
                .offline-modal-checking {
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    margin: 20px 0;
                    color: #A3A3A3;
                    font-size: 14px;
                }
                
                .offline-modal-checking.active {
                    display: flex;
                }
                
                .offline-modal-spinner {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-top-color: #FF6B00;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
                
                .offline-modal-button {
                    background: linear-gradient(45deg, #FFAE00, #F83600);
                    background-size: 150% auto;
                    color: #F5F5F5 !important;
                    border: none;
                    border-radius: 16px;
                    padding: 14px 24px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    transition: transform 0.2s ease, background-position 0.4s ease;
                }
                
                .offline-modal-button:hover {
                    background-position: right center;
                }
                
                .offline-modal-button:active {
                    transform: scale(0.98);
                }
                
                .offline-modal-button:disabled,
                .offline-modal-button.loading {
                    display: none !important;
                }
                
                .offline-modal-button .btn-text {
                    display: inline-block;
                }
                
                .offline-modal-button .btn-spinner {
                    display: none;
                    align-items: center;
                    justify-content: center;
                }
                
                .offline-modal-button.loading .btn-text {
                    display: none;
                }
                
                .offline-modal-button.loading .btn-spinner {
                    display: inline-flex;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(modal);
        offlineModal = modal;
        return modal;
    }
    
    // Mostrar modal offline
    function showOfflineModal() {
        if (!isOnline) return; // Já está mostrando
        
        isOnline = false;
        const modal = createOfflineModal();
        setTimeout(() => {
            modal.classList.add('show');
        }, 50);
        
        // Configurar botão "Tente Novamente"
        const retryBtn = modal.querySelector('#retry-connection-btn');
        if (retryBtn) {
            retryBtn.onclick = function() {
                testConnection();
            };
        }
    }
    
    // Testar conexão
    async function testConnection() {
        const modal = createOfflineModal();
        const retryBtn = modal.querySelector('#retry-connection-btn');
        const checking = modal.querySelector('#offline-modal-checking');
        
        if (!retryBtn) return;
        
        // Mostrar loading
        retryBtn.classList.add('loading');
        retryBtn.disabled = true;
        if (checking) {
            checking.classList.add('active');
        }
        
        // Aguardar um pouco antes de testar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Testar conexão
        let connectionRestored = false;
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(window.BASE_APP_URL + '/api/verify_token.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: 'test' }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            connectionRestored = true;
        } catch (error) {
            // Verificar também usando Capacitor Network
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Network) {
                try {
                    const status = await window.Capacitor.Plugins.Network.getStatus();
                    connectionRestored = status.connected;
                } catch (e) {
                    connectionRestored = navigator.onLine || false;
                }
            } else {
                connectionRestored = navigator.onLine || false;
            }
        }
        
        // Atualizar status
        if (connectionRestored) {
            isOnline = true;
            hideOfflineModal();
            // Usar SPA para atualizar página atual ao invés de recarregar
            if (window.SPANavigator && window.SPANavigator.currentPage) {
                const currentUrl = window.location.pathname.split('/').pop() || 'main_app.html';
                window.dispatchEvent(new CustomEvent('spa:page-reload', {
                    detail: { pageId: window.SPANavigator.currentPage, url: currentUrl }
                }));
            } else {
                window.location.reload();
            }
        } else {
            // Ainda offline - remover loading e mostrar botão novamente
            retryBtn.classList.remove('loading');
            retryBtn.disabled = false;
            if (checking) {
                checking.classList.remove('active');
            }
            // Garantir que o botão está visível novamente
            retryBtn.style.display = 'flex';
        }
    }
    
    // Esconder modal offline
    function hideOfflineModal() {
        if (isOnline) return; // Já está escondido
        
        isOnline = true;
        if (offlineModal) {
            offlineModal.classList.remove('show');
        }
    }
    
    // Verificar status da rede usando Capacitor Network
    async function checkNetworkStatus() {
        try {
            // Tentar usar Capacitor Network plugin
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Network) {
                const status = await window.Capacitor.Plugins.Network.getStatus();
                if (status.connected) {
                    hideOfflineModal();
                } else {
                    showOfflineModal();
                }
                return;
            }
            
            // Fallback: usar API nativa do navegador
            if (navigator.onLine !== undefined) {
                if (navigator.onLine) {
                    hideOfflineModal();
                } else {
                    showOfflineModal();
                }
            }
        } catch (error) {
            console.error('[Network Monitor] Erro ao verificar status:', error);
            // Fallback para navigator.onLine
            if (navigator.onLine !== undefined) {
                if (navigator.onLine) {
                    hideOfflineModal();
                } else {
                    showOfflineModal();
                }
            }
        }
    }
    
    // Monitorar eventos de rede
    function setupNetworkMonitoring() {
        // Verificar status inicial
        checkNetworkStatus();
        
        // Eventos nativos do navegador
        window.addEventListener('online', function() {
            console.log('[Network Monitor] Conexão restaurada');
            hideOfflineModal();
            // Usar SPA para atualizar página atual ao invés de recarregar
            if (window.SPANavigator && window.SPANavigator.currentPage) {
                const currentUrl = window.location.pathname.split('/').pop() || 'main_app.html';
                window.dispatchEvent(new CustomEvent('spa:page-reload', {
                    detail: { pageId: window.SPANavigator.currentPage, url: currentUrl }
                }));
            } else {
                window.location.reload();
            }
        });
        
        window.addEventListener('offline', function() {
            console.log('[Network Monitor] Conexão perdida');
            showOfflineModal();
        });
        
        // Monitorar usando Capacitor Network plugin (se disponível)
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Network) {
            window.Capacitor.Plugins.Network.addListener('networkStatusChange', function(status) {
                console.log('[Network Monitor] Status mudou:', status);
                if (status.connected) {
                    hideOfflineModal();
                    // Usar SPA para atualizar página atual ao invés de recarregar
            if (window.SPANavigator && window.SPANavigator.currentPage) {
                const currentUrl = window.location.pathname.split('/').pop() || 'main_app.html';
                window.dispatchEvent(new CustomEvent('spa:page-reload', {
                    detail: { pageId: window.SPANavigator.currentPage, url: currentUrl }
                }));
            } else {
                window.location.reload();
            }
                } else {
                    showOfflineModal();
                }
            });
        }
        
        // Verificar periodicamente (a cada 5 segundos) como fallback
        setInterval(checkNetworkStatus, 5000);
    }
    
    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupNetworkMonitoring);
    } else {
        setupNetworkMonitoring();
    }
    
    // Exportar funções para uso global se necessário
    window.showOfflineModal = showOfflineModal;
    window.hideOfflineModal = hideOfflineModal;
    window.checkNetworkStatus = checkNetworkStatus;
})();
