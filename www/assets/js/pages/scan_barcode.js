// Scripts inline extraídos de scan_barcode.html
// Gerado automaticamente - não editar manualmente

// Script inline 1


// Script inline 2
if (!window.BASE_APP_URL) { 
            window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/'); 
        }

// Script inline 3


// Script inline 4


// Script inline 5


// Script inline 6
// Acessar o plugin via Capacitor (sem import ES module)
        let BarcodeScanner = null;
        let isScanning = false;
        let isProcessingBarcode = false;
        let lastDetectedBarcode = null;
        let scanListener = null;

        // Inicialização
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                const authenticated = await requireAuth();
                if (!authenticated) return;

                // Aguardar Capacitor estar pronto
                await new Promise(resolve => setTimeout(resolve, 300));

                // Acessar o plugin via Capacitor
                if (window.Capacitor && window.Capacitor.Plugins) {
                    // Tentar diferentes nomes possíveis do plugin
                    BarcodeScanner = window.Capacitor.Plugins.BarcodeScanner ||
                                    window.Capacitor.Plugins.CapacitorMlkitBarcodeScanning ||
                                    window.Capacitor.Plugins['@capacitor-mlkit/barcode-scanning'];
                }

                if (!BarcodeScanner) {
                    console.warn("Plugin de scanner ML Kit não encontrado.");
                    return;
                }

                // Verificar se está no dispositivo nativo
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
                    console.warn("Scanner ML Kit só funciona em dispositivos nativos.");
                    return;
                }

                // Verificar permissões
                try {
                    const status = await BarcodeScanner.checkPermissions();
                    if (status.camera === 'denied' || status.camera === 'prompt') {
                        const response = await BarcodeScanner.requestPermissions();
                        if (response.camera !== 'granted') {
                            console.warn('Permissão de câmera negada');
                            return;
                        }
                    }

                    // Aguardar antes de iniciar
                    await new Promise(resolve => setTimeout(resolve, 500));
                    startNativeScan();
                } catch (err) {
                    console.error('Erro ao verificar permissões:', err);
                }
            } catch (error) {
                console.error('Erro na inicialização:', error);
            }
        });

        async function startNativeScan() {
            if (isScanning) return;
            
            try {
                isScanning = true;
                
                // 1. Torna o HTML transparente para ver a Activity da câmera atrás
                document.body.classList.add('scanner-active');
                document.documentElement.classList.add('scanner-active');

                // 2. Configurar listener ANTES de iniciar o scanner
                scanListener = await BarcodeScanner.addListener('barcodeScanned', async (result) => {
                    // Proteção contra múltiplas detecções
                    if (isProcessingBarcode) {
                        console.log('Já processando código, ignorando detecção duplicada');
                        return;
                    }
                    
                    const barcodeValue = result.barcode.rawValue;
                    
                    // Ignorar se for o mesmo código detectado recentemente
                    if (lastDetectedBarcode === barcodeValue) {
                        console.log('Código duplicado ignorado:', barcodeValue);
                        return;
                    }
                    
                    // Marcar como processando IMEDIATAMENTE
                    isProcessingBarcode = true;
                    lastDetectedBarcode = barcodeValue;
                    
                    console.log('Barcode detectado:', barcodeValue);
                    
                    // Parar scanner IMEDIATAMENTE
                    await stopScan();
                    
                    // Delay para garantir que o scanner foi totalmente parado
                    setTimeout(() => {
                        handleSuccess(barcodeValue).finally(() => {
                            // Resetar flag após processar
                            setTimeout(() => {
                                isProcessingBarcode = false;
                                lastDetectedBarcode = null;
                            }, 2000);
                        });
                    }, 300);
                });

                // 3. Iniciar scanner
                await BarcodeScanner.startScan();

            } catch (error) {
                console.error("Erro ao iniciar scanner:", error);
                await stopScan();
                console.warn("Erro ao abrir câmera:", error.message || error);
            }
        }

        window.stopScan = async function() {
            if (!isScanning) return;
            
            isScanning = false;
            document.body.classList.remove('scanner-active');
            document.documentElement.classList.remove('scanner-active');
            
            try {
                // Remover listener primeiro
                if (scanListener) {
                    await BarcodeScanner.removeListener(scanListener);
                    scanListener = null;
                }
                
                // Parar scanner
                await BarcodeScanner.stopScan();
            } catch (e) { 
                console.warn('Erro ao parar scanner:', e); 
            }
        };

        window.stopScanAndLeave = async function() {
            await window.stopScan();
            window.history.back();
        };

        window.toggleTorch = async function() {
            try {
                await BarcodeScanner.toggleTorch();
            } catch (e) { 
                console.log("Flash não disponível"); 
            }
        };

        window.handleManual = function() {
            const code = document.getElementById('manual-code').value;
            if(code && code.length > 3) {
                handleSuccess(code);
            } else {
                alert('Digite um código válido');
            }
        };

        async function handleSuccess(barcode) {
            try {
                // Validar barcode
                if (!barcode || typeof barcode !== 'string') {
                    console.error('Barcode inválido:', barcode);
                    return;
                }

                // Vibrar (opcional) - com tratamento de erro
                try {
                    if(window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(200);
                    }
                } catch (vibrateErr) {
                    console.warn('Erro ao vibrar:', vibrateErr);
                }

                // Mostrar loading com segurança
                try {
                    const loadingEl = document.getElementById('loading-overlay');
                    if (loadingEl) {
                        loadingEl.classList.add('active');
                    }
                } catch (loadingErr) {
                    console.warn('Erro ao mostrar loading:', loadingErr);
                }

                // Aguardar um pouco antes de fazer a requisição (evita crash)
                await new Promise(resolve => setTimeout(resolve, 200));

                try {
                    const url = `${window.BASE_APP_URL}/api/lookup_barcode.php?barcode=${encodeURIComponent(barcode)}`;
                    const response = await authenticatedFetch(url);
                    
                    if (!response || !response.ok) {
                        throw new Error(`HTTP ${response?.status || 'unknown'}`);
                    }
                    
                    const data = await response.json();

                    // Esconder loading
                    try {
                        const loadingEl = document.getElementById('loading-overlay');
                        if (loadingEl) {
                            loadingEl.classList.remove('active');
                        }
                    } catch (loadingErr) {
                        console.warn('Erro ao esconder loading:', loadingErr);
                    }

                    // Aguardar um pouco antes de redirecionar (evita crash)
                    await new Promise(resolve => setTimeout(resolve, 300));

                    if (data && data.success && data.data) {
                        // Redirecionar com dados
                        const params = new URLSearchParams({
                            barcode: barcode,
                            food_name: data.data.name || '',
                            brand_name: data.data.brand || '',
                            kcal_100g: data.data.kcal_100g || '',
                            protein_100g: data.data.protein_100g || '',
                            carbs_100g: data.data.carbs_100g || '',
                            fat_100g: data.data.fat_100g || ''
                        });
                        
                        // Usar try-catch no redirecionamento
                        try {
                            window.location.href = `create_custom_food.html?${params.toString()}`;
                        } catch (redirectErr) {
                            console.error('Erro ao redirecionar:', redirectErr);
                            // Fallback: tentar sem parâmetros
                            window.location.href = `create_custom_food.html?barcode=${encodeURIComponent(barcode)}`;
                        }
                    } else {
                        // Produto não encontrado
                        const params = new URLSearchParams({ barcode: barcode });
                        try {
                            window.location.href = `create_custom_food.html?${params.toString()}`;
                        } catch (redirectErr) {
                            console.error('Erro ao redirecionar:', redirectErr);
                        }
                    }
                } catch (fetchError) {
                    console.error('Erro ao buscar produto:', fetchError);
                    
                    // Esconder loading
                    try {
                        const loadingEl = document.getElementById('loading-overlay');
                        if (loadingEl) {
                            loadingEl.classList.remove('active');
                        }
                    } catch (loadingErr) {
                        console.warn('Erro ao esconder loading:', loadingErr);
                    }
                    
                    // Não mostrar alerta que pode crashar, apenas redirecionar
                    setTimeout(() => {
                        try {
                            window.location.href = `create_custom_food.html?barcode=${encodeURIComponent(barcode)}`;
                        } catch (redirectErr) {
                            console.error('Erro ao redirecionar após erro:', redirectErr);
                        }
                    }, 500);
                }
            } catch (error) {
                console.error('Erro geral em handleSuccess:', error);
                // Esconder loading
                try {
                    const loadingEl = document.getElementById('loading-overlay');
                    if (loadingEl) {
                        loadingEl.classList.remove('active');
                    }
                } catch (loadingErr) {
                    console.warn('Erro ao esconder loading:', loadingErr);
                }
                // Tentar redirecionar mesmo com erro
                setTimeout(() => {
                    try {
                        window.location.href = `create_custom_food.html?barcode=${encodeURIComponent(barcode)}`;
                    } catch (redirectErr) {
                        console.error('Erro crítico ao redirecionar:', redirectErr);
                    }
                }, 500);
            }
        }

        // Segurança: Garante que o scanner para se o usuário sair do app
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                window.stopScan();
            }
        });
        
        // Limpa ao sair da página
        window.addEventListener('beforeunload', () => {
            window.stopScan();
        });

