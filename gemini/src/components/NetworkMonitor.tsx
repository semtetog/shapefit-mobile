import React, { useState, useEffect, useCallback } from 'react';

// Define the shape of the window object to include Capacitor plugins
declare global {
  interface Window {
    Capacitor?: {
      Plugins?: {
        Network?: {
          getStatus: () => Promise<{ connected: boolean; connectionType: string; }>,
          addListener: (event: 'networkStatusChange', callback: (status: { connected: boolean; connectionType: string; }) => void) => Promise<{ remove: () => void; }>,
        };
      };
    };
    BASE_APP_URL?: string;
  }
}

export const NetworkMonitor = ({ setView }: { setView: (view: string) => void }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);

  // Function to show the offline modal
  const displayOfflineModal = useCallback(() => {
    if (!isOnline) return;
    setIsOnline(false);
    setTimeout(() => setShowModal(true), 50);
  }, [isOnline]);

  // Function to hide the offline modal
  const hideOfflineModal = useCallback(() => {
    if (isOnline) return;
    setIsOnline(true);
    setShowModal(false);
  }, [isOnline]);

  const testConnection = useCallback(async () => {
    setIsCheckingConnection(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    let connectionRestored = false;
    const apiUrl = window.BASE_APP_URL ? `${window.BASE_APP_URL}/api/verify_token.php` : 'https://jsonplaceholder.typicode.com/posts/1';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(apiUrl, {
        method: 'GET', // Changed to GET for placeholder compatibility to avoid CORS with POST
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      connectionRestored = response.ok;
    } catch (error) {
      console.error("[Network Monitor] Test connection fetch error:", error);
      if (window.Capacitor?.Plugins?.Network) {
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

    if (connectionRestored) {
      hideOfflineModal();
      window.location.reload();
    } else {
      setIsCheckingConnection(false);
    }
  }, [hideOfflineModal]);

  const checkNetworkStatus = useCallback(async () => {
    try {
      if (window.Capacitor?.Plugins?.Network) {
        const status = await window.Capacitor.Plugins.Network.getStatus();
        if (status.connected) {
          hideOfflineModal();
        } else {
          displayOfflineModal();
        }
      } else if (navigator.onLine !== undefined) {
        if (navigator.onLine) {
          hideOfflineModal();
        } else {
          displayOfflineModal();
        }
      }
    } catch (error) {
      console.error('[Network Monitor] Error checking network status:', error);
      if (navigator.onLine !== undefined) {
        if (navigator.onLine) {
          hideOfflineModal();
        } else {
          displayOfflineModal();
        }
      }
    }
  }, [displayOfflineModal, hideOfflineModal]);

  useEffect(() => {
    checkNetworkStatus();

    const handleOnline = () => {
      console.log('[Network Monitor] Conexão restaurada');
      hideOfflineModal();
      window.location.reload();
    };

    const handleOffline = () => {
      console.log('[Network Monitor] Conexão perdida');
      displayOfflineModal();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let removeCapacitorListener: (() => void) | undefined;
    if (window.Capacitor?.Plugins?.Network) {
      window.Capacitor.Plugins.Network.addListener('networkStatusChange', (status) => {
        console.log('[Network Monitor] Status mudou:', status);
        if (status.connected) {
          handleOnline();
        } else {
          handleOffline();
        }
      }).then(listener => {
        removeCapacitorListener = listener.remove;
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (removeCapacitorListener) {
        removeCapacitorListener();
      }
    };
  }, [checkNetworkStatus, displayOfflineModal, hideOfflineModal]);

  if (!showModal) {
    return null;
  }

  return (
    <div
      id="offline-modal"
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-5 transition-opacity duration-300 ${showModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md"></div>
      <div
        className={`
          relative bg-gradient-to-br from-gray-600/30 to-gray-500/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl
          transition-all duration-300 ease-out transform
          ${showModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-5'}
        `}
      >
        <div className="relative w-20 h-20 mx-auto mb-3 flex items-center justify-center">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-1 h-[30px] z-10">
            {/* 
              TODO: Original pulse animation (opacity 0.3 to 1) does not directly map to Tailwind's default `animate-pulse` (opacity 1 to 0.5).
              For an exact match, custom keyframes would be required in tailwind.config.js,
              which cannot be included in this JSON output.
              Using `animate-pulse` and arbitrary `animation-delay` as a visual approximation.
            */}
            <div className="w-1.5 bg-red-500 rounded-t-sm h-[10px] animate-pulse [animation-delay:0s]"></div>
            <div className="w-1.5 bg-red-500 rounded-t-sm h-[16px] animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-1.5 bg-red-500 rounded-t-sm h-[22px] animate-pulse [animation-delay:0.4s]"></div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-50 mb-3 font-sans">Sem Conexão</h3>
        <p className="text-base text-gray-400 mb-2 leading-relaxed font-sans">
          Parece que você está sem internet no momento.
        </p>
        <p className="text-sm text-gray-400 opacity-80 mb-5 leading-relaxed font-sans">
          Verifique sua conexão e tente novamente.
        </p>
        <div
          className={`flex-col items-center gap-3 my-5 text-gray-400 text-sm ${isCheckingConnection ? 'flex' : 'hidden'}`}
        >
          <div className="w-5 h-5 border-[3px] border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
          <span>Verificando conexão...</span>
        </div>
        <button
          className={`
            bg-gradient-to-tr from-orange-400 to-red-600 bg-[size:150%_auto] bg-[position:left_center] hover:bg-[position:right_center]
            text-gray-50 border-none rounded-2xl px-6 py-3.5 text-base font-semibold cursor-pointer w-full mt-4 flex items-center justify-center gap-2 font-sans
            transition-all duration-400 ease-in-out active:scale-98
            ${isCheckingConnection ? 'hidden' : 'flex'}
          `}
          onClick={testConnection}
          disabled={isCheckingConnection}
        >
          <span className="btn-text">Tente Novamente</span>
          <span className={`${isCheckingConnection ? 'inline-flex' : 'hidden'} items-center justify-center`}>
            <div className="w-5 h-5 border-[3px] border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
          </span>
        </button>
      </div>
    </div>
  );
};