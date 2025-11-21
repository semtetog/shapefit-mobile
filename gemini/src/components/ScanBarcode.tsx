import React, { useEffect, useState, useRef, useCallback } from 'react';

// TODO: Configurar Montserrat na tailwind.config.js ou importar via Google Fonts na index.html
// Exemplo de configuração no tailwind.config.js:
// theme: {
//   extend: {
//     fontFamily: {
//       montserrat: ['Montserrat', 'sans-serif'],
//     },
//   },
// },

// Definindo o tipo para o plugin BarcodeScanner, se for conhecido
interface BarcodeScannerPlugin {
  checkPermissions(): Promise<{ camera: 'granted' | 'denied' | 'prompt' }>;
  requestPermissions(): Promise<{ camera: 'granted' | 'denied' }>;
  addListener(eventName: 'barcodeScanned', callback: (result: { barcode: { rawValue: string } }) => void): Promise<any>; // ListenerHandle
  startScan(): Promise<void>;
  stopScan(): Promise<void>;
  removeListener(listenerHandle: any): Promise<void>;
  toggleTorch(): Promise<void>;
  isSupported?(): Promise<{ supported: boolean }>;
  // Outros métodos que possam existir
}

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
      isNative?: boolean;
      Plugins?: {
        BarcodeScanner?: BarcodeScannerPlugin;
        CapacitorMlkitBarcodeScanning?: BarcodeScannerPlugin;
        '@capacitor-mlkit/barcode-scanning'?: BarcodeScannerPlugin;
      };
    };
    BASE_APP_URL?: string;
  }
}

// TODO: Implementar ou mockar requireAuth se necessário
const requireAuth = async (): Promise<boolean> => {
  console.log('requireAuth: Autenticação simulada.');
  return true; // Simula que o usuário está autenticado
};

export const ScanBarcode = ({ setView }: { setView: (view: string) => void }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
  const [lastDetectedBarcode, setLastDetectedBarcode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa como true para simular a inicialização
  const BarcodeScannerRef = useRef<BarcodeScannerPlugin | null>(null);
  const scanListenerRef = useRef<any>(null); // Referência para o listener do Capacitor

  // Função para lidar com o código de barras detectado ou inserido manualmente
  const handleSuccess = useCallback(async (barcodeValue: string) => {
    console.log('handleSuccess: Barcode detectado/inserido:', barcodeValue);
    setIsLoading(true);
    // TODO: Adicionar lógica real de busca de produto aqui (ex: chamada de API)
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula uma chamada de API
    setIsLoading(false);
    alert(`Produto com código ${barcodeValue} encontrado! (Simulado)`);
    setView("ProductDetails"); // Exemplo de navegação para detalhes do produto
  }, [setView]);

  const stopScan = useCallback(async () => {
    if (!isScanning) return;
    setIsScanning(false);
    // Remove as classes de scanner do body e html diretamente no DOM para transparência
    document.body.classList.remove('scanner-active');
    document.documentElement.classList.remove('scanner-active');

    try {
      if (scanListenerRef.current && BarcodeScannerRef.current) {
        await BarcodeScannerRef.current.removeListener(scanListenerRef.current);
        scanListenerRef.current = null;
      }
      if (BarcodeScannerRef.current) {
        await BarcodeScannerRef.current.stopScan();
      }
    } catch (e) {
      console.warn('Erro ao parar scanner:', e);
    }
  }, [isScanning]);

  const startNativeScan = useCallback(async () => {
    if (isScanning || !BarcodeScannerRef.current) return;

    try {
      setIsScanning(true);
      document.body.classList.add('scanner-active');
      document.documentElement.classList.add('scanner-active');

      scanListenerRef.current = await BarcodeScannerRef.current.addListener('barcodeScanned', async (result) => {
        if (isProcessingBarcode) {
          console.log('Já processando código, ignorando detecção duplicada');
          return;
        }

        const barcodeValue = result.barcode.rawValue;

        if (lastDetectedBarcode === barcodeValue) {
          console.log('Código duplicado ignorado:', barcodeValue);
          return;
        }

        setIsProcessingBarcode(true);
        setLastDetectedBarcode(barcodeValue);
        console.log('Barcode detectado:', barcodeValue);

        await stopScan();

        setTimeout(() => {
          handleSuccess(barcodeValue).finally(() => {
            setTimeout(() => {
              setIsProcessingBarcode(false);
              setLastDetectedBarcode(null);
            }, 2000); // Permite nova detecção após um tempo
          });
        }, 300); // Pequeno atraso para garantir que o scanner parou
      });

      await BarcodeScannerRef.current.startScan();

    } catch (error) {
      console.error('Erro ao iniciar scanner:', error);
      await stopScan();
      console.warn('Erro ao abrir câmera:', (error as Error).message || error);
    }
  }, [isScanning, isProcessingBarcode, lastDetectedBarcode, handleSuccess, stopScan]);

  // Efeito de inicialização (equivalente a DOMContentLoaded)
  useEffect(() => {
    const initializeScanner = async () => {
      setIsLoading(true);
      try {
        const authenticated = await requireAuth();
        if (!authenticated) {
          setView("Login"); // Redireciona para login se não autenticado
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        if (window.Capacitor && window.Capacitor.Plugins) {
          BarcodeScannerRef.current = window.Capacitor.Plugins.BarcodeScanner ||
                                      window.Capacitor.Plugins.CapacitorMlkitBarcodeScanning ||
                                      window.Capacitor.Plugins['@capacitor-mlkit/barcode-scanning'] ||
                                      null;
        }

        if (!BarcodeScannerRef.current) {
          console.warn('Plugin de scanner ML Kit não encontrado. Operando em modo de simulação/web.');
          // TODO: Implementar fallback para web se necessário ou apenas desativar a funcionalidade
          setIsLoading(false);
          return;
        }

        let isNative = false;
        if (window.Capacitor) {
          if (typeof window.Capacitor.isNativePlatform === 'function') {
            isNative = window.Capacitor.isNativePlatform();
          } else if (typeof window.Capacitor.getPlatform === 'function') {
            isNative = window.Capacitor.getPlatform() !== 'web';
          } else if (typeof window.Capacitor.isNative !== 'undefined') {
            isNative = !!window.Capacitor.isNative;
          }
        }

        if (!isNative) {
          console.warn('Scanner ML Kit só funciona em dispositivos nativos. Desativando funcionalidade nativa.');
          setIsLoading(false);
          return;
        }

        try {
          const status = await BarcodeScannerRef.current.checkPermissions();
          if (status.camera === 'denied' || status.camera === 'prompt') {
            const response = await BarcodeScannerRef.current.requestPermissions();
            if (response.camera !== 'granted') {
              console.warn('Permissão de câmera negada');
              setIsLoading(false);
              return;
            }
          }

          await new Promise(resolve => setTimeout(resolve, 500));
          startNativeScan();
        } catch (err) {
          console.error('Erro ao verificar permissões:', err);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setIsLoading(false);
      }
    };

    // Inicialização de BASE_APP_URL, se não existir
    if (!window.BASE_APP_URL) {
      window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
    }

    initializeScanner();

    // Cleanup para quando o componente for desmontado
    return () => {
      stopScan(); // Garante que o scanner é parado ao sair do componente
    };
  }, [setView, startNativeScan, stopScan]); // Dependências do useEffect

  const handleToggleTorch = useCallback(async () => {
    try {
      if (BarcodeScannerRef.current) {
        await BarcodeScannerRef.current.toggleTorch();
      } else {
        console.log('Flash não disponível ou scanner não inicializado.');
      }
    } catch (e) {
      console.log('Erro ao alternar flash:', e);
    }
  }, []);

  const handleManualInput = useCallback(() => {
    const manualCodeInput = document.getElementById('manual-code') as HTMLInputElement;
    const code = manualCodeInput?.value;
    if (code && code.length > 3) {
      handleSuccess(code);
    } else {
      alert('Por favor, digite um código válido (pelo menos 4 caracteres).');
    }
  }, [handleSuccess]);

  // Estilos globais/animações que Tailwind não cobre diretamente
  // Idealmente, isto estaria num ficheiro CSS global ou tailwind config customizado
  const globalStyles = `
    .scanner-active {
      background-color: transparent !important;
      background: transparent !important;
      --background: transparent !important;
    }
    .scanner-active .scanner-container {
      background: transparent !important;
    }
    .scanner-active .hide-on-scan {
      display: none;
    }
    @keyframes scanMove {
      0% { top: 10%; opacity: 0; }
      50% { opacity: 1; }
      100% { top: 90%; opacity: 0; }
    }
    .animate-scanMove {
      animation: scanMove 2s infinite linear;
    }
  `;

  return (
    <div className="h-screen w-screen bg-[#121212] font-['Montserrat'] text-white transition-colors duration-300 overflow-hidden relative">
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      {/* Máscara Escura com o "Buraco" (Só aparece quando scanner ativo) */}
      <div className={`${isScanning ? 'flex' : 'hidden'} scan-mask absolute inset-0 w-full h-full pointer-events-none z-0 items-center justify-center`}>
        <div className="scan-hole w-[80%] max-w-[300px] aspect-square rounded-xl relative bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] border-2 border-[rgba(255,255,255,0.3)]">
          <div className="scan-corner absolute w-[30px] h-[30px] border-[3px] border-[#FF7A1A]
            top-[-3px] left-[-3px] border-r-0 border-b-0 rounded-tl-xl"></div>
          <div className="scan-corner absolute w-[30px] h-[30px] border-[3px] border-[#FF7A1A]
            top-[-3px] right-[-3px] border-l-0 border-b-0 rounded-tr-xl"></div>
          <div className="scan-corner absolute w-[30px] h-[30px] border-[3px] border-[#FF7A1A]
            bottom-[-3px] left-[-3px] border-r-0 border-t-0 rounded-bl-xl"></div>
          <div className="scan-corner absolute w-[30px] h-[30px] border-[3px] border-[#FF7A1A]
            bottom-[-3px] right-[-3px] border-l-0 border-t-0 rounded-br-xl"></div>
          <div className="scan-line w-full h-[2px] bg-[#FF7A1A] shadow-[0_0_4px_#FF7A1A] absolute animate-scanMove"></div>
        </div>
      </div>

      {/* Camada de UI (Fica por cima de tudo) */}
      <div className="ui-layer absolute inset-0 w-full h-full flex flex-col justify-between px-5 pb-10 box-border pointer-events-none">
        {/* Topo */}
        <div className="header-controls pointer-events-auto bg-[rgba(0,0,0,0.4)] backdrop-blur-sm p-4 rounded-2xl flex items-center justify-between gap-2.5">
          <button
            className="btn-icon bg-[rgba(255,255,255,0.1)] border-none text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-lg"
            onClick={async () => { await stopScan(); setView("Home"); } /* Exemplo: voltar para Home */}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="m-0 text-lg">Escanear Produto</h1>
          <button
            className="btn-icon bg-[rgba(255,255,255,0.1)] border-none text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-lg"
            onClick={handleToggleTorch}
          >
            <i className="fas fa-bolt"></i>
          </button>
        </div>

        {/* Rodapé */}
        <div className="footer-controls pointer-events-auto bg-[rgba(0,0,0,0.4)] backdrop-blur-sm p-4 rounded-2xl flex flex-col w-full gap-2.5">
          <div className="mb-2.5 text-sm text-center opacity-80">
            Aponte a câmera para o código de barras
          </div>

          <div className="manual-input-group flex w-full gap-2.5">
            <input type="number" id="manual-code" className="manual-input flex-1 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] p-3 rounded-lg text-white text-base focus:outline-none focus:ring-1 focus:ring-[#FF7A1A]" placeholder="Ou digite o código aqui" />
            <button
              className="btn-icon rounded-lg bg-[#FF7A1A] border-none text-white w-10 h-10 flex items-center justify-center cursor-pointer text-lg"
              onClick={handleManualInput}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div id="loading-overlay" className="loading-overlay fixed inset-0 w-full h-full bg-[rgba(0,0,0,0.85)] z-[10000] flex items-center justify-center">
          <div className="loading-box bg-[#1e1e1e] p-6 rounded-2xl text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-[#FF7A1A] mb-4"></i>
            <p>Buscando produto...</p>
          </div>
        </div>
      )}
    </div>
  );
};