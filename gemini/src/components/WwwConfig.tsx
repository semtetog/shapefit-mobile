import React, { useEffect } from 'react';

export const WwwConfig = ({ setView }: { setView: (view: string) => void }) => {
  useEffect(() => {
    // TODO: Adicionar tipos mais específicos para window.Capacitor e window.CapacitorWeb se necessário.
    const isCapacitor = (window as any).Capacitor ||
                       (window as any).CapacitorWeb ||
                       window.location.protocol === 'capacitor:' ||
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '' ||
                       (window.location.hostname === '' && window.location.protocol === 'http:') ||
                       (window.location.hostname === '' && window.location.protocol === 'https:');

    if (isCapacitor) {
      (window as any).BASE_APP_URL = 'https://appshapefit.com';
      console.log('[Mobile App] Detectado Capacitor - usando servidor remoto para APIs:', (window as any).BASE_APP_URL);
    } else {
      (window as any).BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
      if ((window as any).BASE_APP_URL.endsWith('/')) {
        (window as any).BASE_APP_URL = (window as any).BASE_APP_URL.slice(0, -1);
      }
      console.log('[Web App] Usando URL local:', (window as any).BASE_APP_URL);
    }

    if (!(window as any).BASE_URL) {
      (window as any).BASE_URL = (window as any).BASE_APP_URL;
    }
  }, []); // Empty dependency array means this runs once after the initial render.

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Configuração da Aplicação</h1>
        <p className="text-gray-600 mb-6">
          A lógica de configuração da URL base foi executada.
          Verifique o console para os detalhes.
        </p>
        <div className="space-y-3">
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
            onClick={() => setView("HomePage")}
          >
            Ir para a Página Inicial
          </button>
          <button
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition ease-in-out duration-150"
            onClick={() => setView("SettingsPage")}
          >
            Configurações
          </button>
        </div>
      </div>
    </div>
  );
};