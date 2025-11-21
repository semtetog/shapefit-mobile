import React, { useEffect, useRef, useState, useCallback } from 'react';
import { configure, DataCaptureContext, Camera, FrameSourceState, DataCaptureView } from "@scandit/web-datacapture-core";
import { BarcodeCapture, BarcodeCaptureSettings, Symbology, barcodeCaptureLoader } from "@scandit/web-datacapture-barcode";

export const BarcodeScanner = ({ setView }: { setView: (view: string) => void }) => {
    const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
    const [scannerStatusText, setScannerStatusText] = useState('Configurando scanner...');
    const [showScanditPicker, setShowScanditPicker] = useState(true);
    const [showResultConfirmation, setShowResultConfirmation] = useState(false);
    const [scannedProductInfo, setScannedProductInfo] = useState<any | null>(null);
    const [isRescanButtonVisible, setIsRescanButtonVisible] = useState(false);
    const [isSavingFood, setIsSavingFood] = useState(false);

    // Refs para instâncias Scandit
    const dataCaptureContextRef = useRef<DataCaptureContext | null>(null);
    const barcodeCaptureRef = useRef<BarcodeCapture | null>(null);
    const cameraRef = useRef<Camera | null>(null);
    const dataCaptureViewRef = useRef<DataCaptureView | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    // TODO: A URL base deve vir de uma variável de ambiente ou prop.
    const baseAppUrl = 'http://localhost'; // Exemplo, ajuste conforme necessário

    const closeAndDestroyScanner = useCallback(() => {
        if (barcodeCaptureRef.current) barcodeCaptureRef.current.setEnabled(false);
        if (cameraRef.current) cameraRef.current.switchToDesiredState(FrameSourceState.Off);
        setIsScannerModalOpen(false);
        // Dispor recursos Scandit
        if (dataCaptureViewRef.current) {
            dataCaptureViewRef.current.detachFromElement();
            dataCaptureViewRef.current.dispose();
            dataCaptureViewRef.current = null;
        }
        if (dataCaptureContextRef.current) {
            dataCaptureContextRef.current.dispose();
            dataCaptureContextRef.current = null;
        }
        barcodeCaptureRef.current = null;
        cameraRef.current = null;
    }, []);

    const handleScan = useCallback(async (barcodeData: string) => {
        setScannerStatusText(`Código [${barcodeData}] lido! Buscando...`);
        setShowScanditPicker(false);
        setIsRescanButtonVisible(false);

        try {
            const response = await fetch(`${baseAppUrl}/ajax_lookup_barcode.php?barcode=${barcodeData}`);
            const data = await response.json();

            if (data.success && data.data) {
                setScannerStatusText(''); // Limpar status
                setScannedProductInfo(data.data);
                setShowResultConfirmation(true);
            } else {
                setScannerStatusText(`Falha: ${data.message || 'Produto não encontrado.'} Tente novamente.`);
                setIsRescanButtonVisible(true);
            }
        } catch (error) {
            console.error('Erro na busca do produto:', error);
            setScannerStatusText('Erro ao buscar informações do produto. Tente novamente.');
            setIsRescanButtonVisible(true);
        }
    }, [baseAppUrl]);

    useEffect(() => {
        if (isScannerModalOpen && scannerContainerRef.current) {
            const initializeScanner = async () => {
                setScannerStatusText('Configurando scanner...');
                setShowScanditPicker(true);
                setShowResultConfirmation(false);
                setIsRescanButtonVisible(false);

                try {
                    await configure({
                        licenseKey: "An72iQOeJQErLLulFOoFCoQtpKRwQ7COOC045DAnsMjqfeRTNFhH551hyGDBb14BeEtQh3dM6g4OW7SmT1CcK7tvMRFBSSl+v3G+yGs4eWArNxvTIxSTbvs56vl+bZwO5wVF7AVj2XIAS/nOtVuCkQlVGdlqeu8ZEmuNuGNKccDCDUSSLGrTbrFMpTOYRDl3LlZxEF1fNOxUaO5nqXuQoYVbxK04Y2ufv3HmwIAQ4qcyYkj1jmMXRZJiuIBLW+AC0Hjy9bhJQAyjYrjVEE2n7JhDt4uv7c4dmQ8GQhDdqF9eY7OGWqgdGQQf1GpUmbh1WTEfmVhc+NuRVJHI32WJwBIZlZsKopC33NPvlFEpvrXczzf2VGhbtdmHe2ifHyeGnpLaqJTz/JxTdTZC3S1yM9a16v7UaYHU03OdE9cRFbrWXx0wnI0/2hv3GW4TLq0UXFHnzd9zN3PA82TTHCxR94SSuEQN60xg2Um5MtFvcC9W1BJxl9OrJYqeqBpWuN9qEHj8h528aQgeZd2YUU8fNQUm+9m68P0jZaA7qIEEBgBU/DGQ/s71/k+JlwWeKz1yQetDorq26qLNX9+KATRGUPLg+lwDoeRMiardoSwkrNnm/Zm093oKG/Rgfe8e36k3RXzOah+wz+MVyVPtns+j++A4Ld4i+HKvKmgFa3KC6QzcgQ5P6ibPcFKSZvfAKmO+V0AJ9bQZk6gf5S9E9uadM+BeyWNG0emu1bEvVS2p3HP7c5VLnrCgFS0B3RoqgezGt1Gnwsc+KrWvfN0BvvywNTNuE3UdIqLnyflYWC2N6DTUp3k5i/L+MCUzyBrLDziIcmo0kGpVbcV3eoO+Nw5NnXycZ4Jq2QgOQd9Ha0N5hKRl4ZH/EQGK6ZN8f400bufMUXi5cDHgEgipURBh8AgL6IK39JgPOtlOZNx3ZEGflIWR9lZIy3QrNiWTq0GKNrLQBx0Ny9K9SxURJuWVX3glcPO/6pLceGGiZ7pofSEUMuPIdVBH6pW7kQn9f3nA+x4YW6a6uW+5o8kOqxmKY2gEsxpqvrxVqC8m1CB4XtTupwZQiGfkdWXgiZT33uO0sM7vPQbEXplJltNyc5ERaTxSYlQsK1NIVxbxl4+RGpyLhWJYkihTUE6m/L9dQqQ1Cgv90UAf791sHNig/cLZySbFHoniFr6+fi7uyZsIdXwjjACg7aq2rxToURPbazzizjaxnQ=",
                        libraryLocation: "https://cdn.jsdelivr.net/npm/@scandit/web-datacapture-barcode@7.3.0/build/",
                        moduleLoaders: [barcodeCaptureLoader()],
                    });

                    dataCaptureContextRef.current = await DataCaptureContext.create();
                    dataCaptureViewRef.current = new DataCaptureView();
                    dataCaptureViewRef.current.connectToElement(scannerContainerRef.current);
                    await dataCaptureViewRef.current.setContext(dataCaptureContextRef.current);
                    
                    const settings = new BarcodeCaptureSettings();
                    settings.enableSymbologies([Symbology.EAN13UPCA, Symbology.EAN8, Symbology.Code128, Symbology.QR]);
                    barcodeCaptureRef.current = await BarcodeCapture.forContext(dataCaptureContextRef.current, settings);
                    
                    barcodeCaptureRef.current.addListener({
                        didScan: (barcodeCaptureMode, session) => {
                            barcodeCaptureMode.setEnabled(false);
                            const barcode = session.newlyRecognizedBarcodes[0];
                            handleScan(barcode.data);
                        }
                    });

                    cameraRef.current = Camera.default;
                    if (cameraRef.current) {
                        await dataCaptureContextRef.current.setFrameSource(cameraRef.current);
                        await cameraRef.current.switchToDesiredState(FrameSourceState.On);
                    }
                    await barcodeCaptureRef.current.setEnabled(true);
                    
                    setScannerStatusText("Aponte para o código de barras");

                } catch (error) {
                    console.error("Erro na inicialização da Scandit:", error);
                    setScannerStatusText('Erro ao iniciar o scanner. Verifique as permissões.');
                }
            };

            initializeScanner();

            return () => {
                // Cleanup ao desmontar ou fechar o modal
                if (barcodeCaptureRef.current) barcodeCaptureRef.current.removeListener({
                    didScan: () => {}
                });
                closeAndDestroyScanner();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScannerModalOpen, scannerContainerRef, handleScan]); // Adicione `handleScan` como dependência, pois é uma função de callback

    const handleRescan = useCallback(() => {
        setShowScanditPicker(true);
        setShowResultConfirmation(false);
        setIsRescanButtonVisible(false);
        setScannerStatusText("Aponte para o código de barras");
        if (barcodeCaptureRef.current) barcodeCaptureRef.current.setEnabled(true);
        if (cameraRef.current) cameraRef.current.switchToDesiredState(FrameSourceState.On);
    }, []);

    const handleSaveScannedFood = useCallback(async () => {
        if (!scannedProductInfo) return;

        setIsSavingFood(true);
        const formData = new FormData();
        formData.append('barcode', scannedProductInfo.id || '');
        formData.append('name_pt', scannedProductInfo.name || '');
        formData.append('brand', scannedProductInfo.brand || '');
        formData.append('energy_kcal_100g', scannedProductInfo.kcal_100g || '');
        formData.append('protein_g_100g', scannedProductInfo.protein_100g || '');
        formData.append('carbohydrate_g_100g', scannedProductInfo.carbs_100g || '');
        formData.append('fat_g_100g', scannedProductInfo.fat_100g || '');

        try {
            const response = await fetch(`${baseAppUrl}/process_save_custom_food.php`, { method: 'POST', body: formData });
            const data = await response.json();
            if (data.success) {
                alert('Alimento adicionado com sucesso!');
                closeAndDestroyScanner();
                setView("Dashboard"); // Exemplo de navegação após salvar
            } else {
                alert('Erro: ' + data.message);
            }
        } catch (error) {
            console.error('Erro de comunicação ao salvar:', error);
            alert('Erro de comunicação ao salvar.');
        } finally {
            setIsSavingFood(false);
        }
    }, [baseAppUrl, scannedProductInfo, closeAndDestroyScanner, setView]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <button
                onClick={() => setIsScannerModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                Escanear Código de Barras
            </button>

            {isScannerModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                        <h2 className="text-2xl font-bold mb-4 text-center">Scanner de Código de Barras</h2>
                        
                        <button
                            onClick={closeAndDestroyScanner}
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-3xl font-bold leading-none"
                        >
                            &times;
                        </button>

                        {scannerStatusText && (
                            <p className="text-center text-gray-700 mb-4" id="scanner-status">
                                {scannerStatusText}
                            </p>
                        )}

                        {showScanditPicker && (
                            <div
                                ref={scannerContainerRef}
                                className="w-full h-64 bg-gray-300 border border-gray-400 rounded-md overflow-hidden relative mb-4"
                                id="scanner-container"
                            >
                                {/* O Scandit DataCaptureView será renderizado aqui */}
                            </div>
                        )}

                        {showResultConfirmation && (scannedProductInfo ? (
                            <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50 text-gray-800" id="scanner-result-confirmation">
                                <h3 className="text-lg font-semibold mb-2">Produto Encontrado:</h3>
                                <div id="scanned-product-info">
                                    <p><strong>Nome:</strong> {scannedProductInfo.name}</p>
                                    <p><strong>Marca:</strong> {scannedProductInfo.brand || 'N/A'}</p>
                                    <p><strong>Calorias (100g):</strong> {scannedProductInfo.kcal_100g || 'N/A'}</p>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <button
                                        onClick={handleRescan}
                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                    >
                                        Escanear Novamente
                                    </button>
                                    <button
                                        onClick={handleSaveScannedFood}
                                        disabled={isSavingFood}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingFood ? 'Salvando...' : 'Sim, Adicionar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-500 text-center mt-4">Nenhum produto encontrado para confirmação.</p>
                        ))}

                        {isRescanButtonVisible && (
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={handleRescan}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                >
                                    Tentar Novamente
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
