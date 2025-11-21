import React, { useState, useEffect, useRef, useCallback } from 'react';
// Import QuaggaJS if it's installed as a package, otherwise you might load it via a script tag
// For this example, we'll assume a global Quagga or mock it.
// import Quagga from '@ericblade/quagga2'; // If using npm package

declare global {
  interface Window {
    Quagga: any; // Or type more specifically if Quagga is imported globally
    showAppNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  }
}

// Placeholder for global BASE_APP_URL. In a real app, use environment variables or a context provider.
const BASE_APP_URL = "http://localhost:8080"; 

interface FoodData {
  id: string;
  name: string;
  brand?: string;
  kcal_100g?: number;
  protein_100g?: number;
  carbs_100g?: number;
  fat_100g?: number;
}

interface MealItem extends FoodData {
  quantity: number;
  unit: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const AddFoodLogic = ({ setView }: { setView: (view: string) => void }) => {
  // --- STATE VARIABLES ---
  const [currentSelectedFoodData, setCurrentSelectedFoodData] = useState<FoodData | null>(null);
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FoodData[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [showSelectedFoodDetails, setShowSelectedFoodDetails] = useState(false);
  const [showNoUnitsMessage, setShowNoUnitsMessage] = useState(false);
  const [foodQuantityInput, setFoodQuantityInput] = useState('100');
  const [foodUnitSelect, setFoodUnitSelect] = useState('');
  const [unitOptionsHTML, setUnitOptionsHTML] = useState('');

  // Barcode Scanner State
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('Pronto para escanear');
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const searchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Placeholder for date and meal type. In a real app, these would come from props or a global state.
  const logDateDisplay = '2023-10-27'; // Example
  const logMealTypeDisplay = 'Jantar'; // Example

  // --- CONSTANTS AND HELPERS ---
  const unitConversions: { [key: string]: number } = {
    'g': 1, 'kg': 1000, 'ml': 1, 'l': 1000,
    'tablespoon': 15, 'teaspoon': 5, 'cup': 240,
    'slice': 25, 'unit': 150, 'piece': 50
  };

  // --- FUNCTIONS FOR LOGIC ---

  const loadFoodUnits = useCallback(async (foodId: string) => {
    if (typeof BASE_APP_URL === 'undefined') {
      console.error("Variável global BASE_APP_URL não foi encontrada.");
      setShowNoUnitsMessage(true);
      return;
    }

    const apiUrl = `${BASE_APP_URL}/api/ajax_get_food_units.php?food_id=${encodeURIComponent(foodId)}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Erro de rede: ${response.status}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        let optionsHtml = '';
        let defaultUnit = '';
        data.data.forEach((unit: { abbreviation: string; name: string; is_default: boolean; }) => {
          if (unit.is_default) {
            defaultUnit = unit.abbreviation;
          }
          optionsHtml += `<option value="${unit.abbreviation}" ${unit.is_default ? 'selected' : ''}>${unit.name} (${unit.abbreviation})</option>`;
        });
        setUnitOptionsHTML(optionsHtml);
        setFoodUnitSelect(defaultUnit);
        setShowNoUnitsMessage(false);
        setShowSelectedFoodDetails(true);
      } else {
        console.log('Nenhuma unidade encontrada no banco para este alimento');
        setShowNoUnitsMessage(true);
        setShowSelectedFoodDetails(false);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      setShowNoUnitsMessage(true);
      setShowSelectedFoodDetails(false);
    }
  }, []);

  const handleFoodSelection = useCallback((foodData: FoodData) => {
    setCurrentSelectedFoodData(foodData);
    loadFoodUnits(foodData.id);
    setSearchTerm('');
    setSearchResults([]);
  }, [loadFoodUnits]);

  const updateMacrosPreview = useCallback(() => {
    if (!currentSelectedFoodData) return;

    const quantity = parseFloat(foodQuantityInput) || 0;
    const unitKey = foodUnitSelect;

    const conversionFactor = unitConversions[unitKey] || 1;
    const totalBaseAmount = quantity * conversionFactor; // Assuming 1 unit = 1g/ml as base
    const nutrientFactor = totalBaseAmount / 100; // For 100g/ml nutritional values

    const getMacroValue = (macro: keyof FoodData) => {
      const value = (currentSelectedFoodData[macro] as number || 0) * nutrientFactor;
      return macro === 'kcal_100g' ? Math.round(value) : value.toFixed(1);
    };

    const kcal = getMacroValue('kcal_100g');
    const protein = getMacroValue('protein_100g');
    const carbs = getMacroValue('carbs_100g');
    const fat = getMacroValue('fat_100g');

    // These values are often displayed directly, so we'll re-render.
    // No explicit state for these, they are derived in the JSX.
    return { kcal, protein, carbs, fat };
  }, [currentSelectedFoodData, foodQuantityInput, foodUnitSelect, unitConversions]);

  const currentMacros = updateMacrosPreview();

  const addFoodToMeal = useCallback(() => {
    if (!currentSelectedFoodData) return;

    const quantity = parseFloat(foodQuantityInput) || 0;
    if (quantity <= 0) {
      alert("Por favor, insira uma quantidade válida.");
      return;
    }

    const selectedUnitText = document.getElementById('food-unit')?.options[document.getElementById('food-unit').selectedIndex]?.text || foodUnitSelect; // Fallback
    
    const newMealItem: MealItem = {
      id: currentSelectedFoodData.id,
      name: currentSelectedFoodData.name,
      brand: currentSelectedFoodData.brand,
      quantity: quantity,
      unit: selectedUnitText,
      kcal: parseFloat(currentMacros.kcal as string),
      protein: parseFloat(currentMacros.protein as string),
      carbs: parseFloat(currentMacros.carbs as string),
      fat: parseFloat(currentMacros.fat as string)
    };

    setMealItems(prevItems => [...prevItems, newMealItem]);
    setCurrentSelectedFoodData(null);
    setShowSelectedFoodDetails(false);
    setShowNoUnitsMessage(false);
    setFoodQuantityInput('100');
    setFoodUnitSelect('');
  }, [currentSelectedFoodData, foodQuantityInput, foodUnitSelect, currentMacros]);

  const removeMealItem = useCallback((indexToRemove: number) => {
    setMealItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  }, []);

  const totalMealKcal = mealItems.reduce((sum, item) => sum + (isNaN(item.kcal) ? 0 : item.kcal), 0);

  const performFoodSearch = useCallback(async () => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSearchResults([]);
      setIsLoadingSearch(false);
      return;
    }

    setIsLoadingSearch(true);
    setCurrentSelectedFoodData(null);
    setShowSelectedFoodDetails(false);
    setShowNoUnitsMessage(false);

    if (typeof BASE_APP_URL === 'undefined') {
      console.error("Variável global BASE_APP_URL não foi encontrada.");
      setSearchResults([]);
      setIsLoadingSearch(false);
      return;
    }

    const apiUrl = `${BASE_APP_URL}/api/ajax_search_food.php?term=${encodeURIComponent(term)}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Erro de rede: ${response.status}`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erro na busca de alimentos:', error);
      setSearchResults([]);
    } finally {
      setIsLoadingSearch(false);
    }
  }, [searchTerm]);

  // Debounce effect for search input
  useEffect(() => {
    if (searchDebounceTimer.current) {
      clearTimeout(searchDebounceTimer.current);
    }
    if (searchTerm.length >= 2) {
      searchDebounceTimer.current = setTimeout(() => {
        performFoodSearch();
      }, 500);
    }
    return () => {
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, [searchTerm, performFoodSearch]);

  // --- BARCODE SCANNER LOGIC ---

  const initScanner = useCallback(async () => {
    if (!scannerContainerRef.current || !window.Quagga) {
      console.warn('Scanner container not found or Quagga not loaded.');
      setScannerStatus('Erro: Scanner não disponível.');
      return;
    }

    setScannerStatus('Iniciando scanner...');

    try {
      await window.Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerContainerRef.current,
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            aspectRatio: { min: 1, max: 100 },
            facingMode: "environment" // ou "user" para câmera frontal
          },
        },
        decoder: {
          readers: ["ean_reader"],
          multiple: false // Decodificar apenas um código de barras por vez
        },
        locator: { // Configuração para a visualização do localizador
            patchSize: 'medium',
            halfSample: true,
            debug: { showCanvas: true, showPatches: true, showFoundPatches: true, showSkeleton: true, showLabels: true, showPatchLabels: true, showRemainingPatchLabels: true, boxFromPatches: { showTransformed: true, showTransformedBox: true, showBoundingBox: true } }
        }
      }, function (err: any) {
        if (err) {
          console.error("Quagga Init Error:", err);
          setScannerStatus(`Erro ao iniciar scanner: ${err.message}`);
          return;
        }
        setScannerStatus('Scanner iniciado. Aponte para um código de barras.');
        window.Quagga.start();
      });

      window.Quagga.onDetected((result: any) => {
        if (result.codeResult && result.codeResult.code) {
          const barcode = result.codeResult.code;
          setScannerStatus(`Código de barras detectado: ${barcode}`);
          window.Quagga.stop();
          setShowScannerModal(false);
          lookupBarcode(barcode);
        }
      });

      window.Quagga.onProcessed((result: any) => {
        // You can use this for visual feedback during scanning
        // if (result) {
        //   console.log('Processed frame', result);
        // }
      });

    } catch (error: any) {
      console.error('Failed to initialize Quagga:', error);
      setScannerStatus(`Erro: ${error.message}`);
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (window.Quagga) {
      window.Quagga.stop();
      console.log('Quagga scanner stopped.');
    }
  }, []);

  // Effect to manage scanner lifecycle
  useEffect(() => {
    if (showScannerModal) {
      // Delay to ensure modal is rendered and ref.current is available
      const timeoutId = setTimeout(() => {
        if (window.Quagga) {
           initScanner();
        } else {
           console.warn('Quagga global object not found. Make sure quagga.min.js is loaded.');
           setScannerStatus('Erro: Quagga JS não carregado.');
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      stopScanner();
    }
    return () => {
      stopScanner(); // Cleanup on unmount or modal close
    };
  }, [showScannerModal, initScanner, stopScanner]);

  const lookupBarcode = useCallback(async (barcode: string) => {
    const notify = window.showAppNotification; // Use global notification if available
    if (notify) notify('Buscando produto...', 'info');
    else setScannerStatus('Buscando produto...');

    try {
      // First try local database
      const localResponse = await fetch(`${BASE_APP_URL}/api/ajax_search_food_by_barcode.php?barcode=${barcode}`);
      if (localResponse.ok) {
        const localData = await localResponse.json();
        if (localData.success && localData.data) {
          if (notify) notify('Produto encontrado no banco de dados local!', 'success');
          handleFoodSelection(localData.data);
          return;
        }
      }
      // If not found locally, try Open Food Facts
      const offResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      if (offResponse.status === 404) {
        if (notify) notify('Este produto não foi encontrado no Open Food Facts.', 'warning');
        setShowNotFoundModal(true);
        return;
      }
      if (!offResponse.ok) throw new Error(`Erro de rede no Open Food Facts: ${offResponse.status}`);

      const offData = await offResponse.json();
      if (offData.product) {
        if (notify) notify('Produto encontrado no Open Food Facts!', 'success');
        // Map OFF data to FoodData format (simplified)
        const mappedFood: FoodData = {
          id: barcode, // Using barcode as ID for OFF products
          name: offData.product.product_name || `Produto com código ${barcode}`,
          brand: offData.product.brands || '',
          kcal_100g: offData.product.nutriments?.energy_kcal_100g || 0,
          protein_100g: offData.product.nutriments?.proteins_100g || 0,
          carbs_100g: offData.product.nutriments?.carbohydrates_100g || 0,
          fat_100g: offData.product.nutriments?.fat_100g || 0,
        };
        handleFoodSelection(mappedFood);
      } else {
        if (notify) notify('Este produto não foi encontrado.', 'warning');
        setShowNotFoundModal(true);
      }
    } catch (error: any) {
      console.error('Erro ao buscar código de barras:', error);
      if (notify) notify(`Erro ao buscar produto: ${error.message}`, 'error');
      else setScannerStatus(`Erro: ${error.message}`);
      setShowNotFoundModal(true);
    }
  }, [handleFoodSelection]);

  // --- Rendered Component (JSX) ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4 font-sans">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Voltar"
          onClick={() => setView("PreviousPage")}
        >
          <i className="fas fa-arrow-left text-2xl"></i>
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">Adicionar Alimento</h2>
        <div className="w-8"></div> { /* Spacer */}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Data:</p>
            <p id="log_date_display" className="text-lg font-medium text-gray-800">{logDateDisplay}</p>
            <input type="hidden" id="log_date_hidden_for_meal" value={logDateDisplay} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Refeição:</p>
            <p id="log_meal_type_display" className="text-lg font-medium text-gray-800">{logMealTypeDisplay}</p>
            <input type="hidden" id="log_meal_type_hidden_for_meal" value={logMealTypeDisplay} />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="food-search-input" className="block text-sm font-medium text-gray-700 mb-2">Buscar alimento:</label>
          <input
            type="text"
            id="food-search-input"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            placeholder="Ex: Arroz, Frango, Maçã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoadingSearch && (
          <div className="text-center text-gray-500 py-4">
            Buscando...
          </div>
        )}

        {searchResults.length > 0 && (
          <div id="search-results-container" className="bg-white border border-gray-200 rounded-lg shadow-sm mt-2 max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-200 search-results-list">
              {searchResults.map((food) => (
                <li
                  key={food.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer text-gray-800"
                  onClick={() => handleFoodSelection(food)}
                >
                  {food.name} {food.brand && food.brand.toUpperCase() !== 'TACO' ? `(${food.brand})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isLoadingSearch && searchTerm.length >= 2 && searchResults.length === 0 && (
          <p className="text-center text-gray-500 py-4">Nenhum alimento encontrado.</p>
        )}

        {/* Selected Food Details / No Units Message */}
        {currentSelectedFoodData && (
          <div
            id="selected-food-details-container"
            className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 transition-all duration-400 ease-in-out ${showSelectedFoodDetails || showNoUnitsMessage ? 'opacity-100 max-h-96 py-4' : 'opacity-0 max-h-0 py-0 overflow-hidden'}`}
          >
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              {currentSelectedFoodData.name} {currentSelectedFoodData.brand && currentSelectedFoodData.brand.toUpperCase() !== 'TACO' ? `(${currentSelectedFoodData.brand})` : ''}
            </h3>

            {showNoUnitsMessage ? (
              <div className="text-red-600 bg-red-50 p-3 rounded-md mb-4 no-units-message">
                <p className="font-semibold">⚠️ Este alimento ainda não foi classificado pelas estagiárias.</p>
                <p>Unidades de medida não disponíveis.</p>
                <p>Peça para uma estagiária classificar este alimento no painel administrativo.</p>
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    id="cancel-add-food-item-btn"
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Cancelar"
                    onClick={() => {
                      setCurrentSelectedFoodData(null);
                      setShowNoUnitsMessage(false);
                      setShowSelectedFoodDetails(false);
                    }}
                  >
                    <i className="fas fa-times"></i> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-4 mb-4 quantity-unit-row">
                  <div className="flex-1">
                    <label htmlFor="food-quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                    <input
                      type="number"
                      id="food-quantity"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      value={foodQuantityInput}
                      min="1"
                      step="any"
                      onChange={(e) => setFoodQuantityInput(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="food-unit" className="block text-sm font-medium text-gray-700 mb-1">Medida</label>
                    <select
                      id="food-unit"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      value={foodUnitSelect}
                      onChange={(e) => setFoodUnitSelect(e.target.value)}
                      dangerouslySetInnerHTML={{ __html: unitOptionsHTML }}
                    >
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-md p-3 mb-4 shadow-sm macros-preview">
                  <p className="flex justify-between items-center text-sm mb-1 text-gray-700">Calorias <span className="font-semibold text-gray-900"><span id="macro-kcal">{currentMacros.kcal}</span> kcal</span></p>
                  <p className="flex justify-between items-center text-sm mb-1 text-gray-700">Carboidratos <span className="font-semibold text-gray-900"><span id="macro-carbs">{currentMacros.carbs}</span> g</span></p>
                  <p className="flex justify-between items-center text-sm mb-1 text-gray-700">Proteínas <span className="font-semibold text-gray-900"><span id="macro-protein">{currentMacros.protein}</span> g</span></p>
                  <p className="flex justify-between items-center text-sm text-gray-700">Gorduras <span className="font-semibold text-gray-900"><span id="macro-fat">{currentMacros.fat}</span> g</span></p>
                </div>

                <div className="flex justify-end gap-2 form-actions-details">
                  <button
                    type="button"
                    id="add-food-item-to-meal-btn"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={addFoodToMeal}
                  >
                    Adicionar Alimento
                  </button>
                  <button
                    type="button"
                    id="cancel-add-food-item-btn"
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Cancelar"
                    onClick={() => {
                      setCurrentSelectedFoodData(null);
                      setShowSelectedFoodDetails(false);
                      setFoodQuantityInput('100');
                      setFoodUnitSelect('');
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            id="scan-barcode-btn"
            className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            onClick={() => setShowScannerModal(true)}
          >
            <i className="fas fa-barcode text-lg"></i> Escanear Código de Barras
          </button>
          {/* Placeholder for take/choose photo buttons if relevant */}
          <button
            type="button"
            id="take-nutrition-photo-btn"
            className="w-full mt-2 px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 flex items-center justify-center gap-2"
            // onClick={() => console.log('Take photo')} TODO: Implement photo logic
          >
            <i className="fas fa-camera text-lg"></i> Tirar Foto dos Nutrientes
          </button>
          <button
            type="button"
            id="choose-nutrition-photo-btn"
            className="w-full mt-2 px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 flex items-center justify-center gap-2"
            // onClick={() => console.log('Choose photo')} TODO: Implement photo logic
          >
            <i className="fas fa-image text-lg"></i> Escolher Foto dos Nutrientes
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mt-6 flex-grow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Alimentos na Refeição</h3>
        <ul id="current-meal-items-list" className="divide-y divide-gray-200">
          {mealItems.length === 0 ? (
            <li className="text-center text-gray-500 py-4 empty-meal-placeholder">Nenhum alimento adicionado ainda.</li>
          ) : (
            mealItems.map((item, index) => (
              <li key={index} className="flex items-center justify-between py-3">
                <div className="flex-1 meal-item-info">
                  <span className="block font-medium text-gray-800 meal-item-name">{item.name}</span>
                  <span className="block text-sm text-gray-600 meal-item-details">{item.quantity} {item.unit}</span>
                </div>
                <div className="flex items-center gap-2 meal-item-calories">
                  <span className="font-semibold text-gray-900">{Math.round(item.kcal)}</span>
                  <span className="text-gray-600">kcal</span>
                  <button
                    type="button"
                    className="ml-3 text-red-500 hover:text-red-700 focus:outline-none btn-remove-item"
                    onClick={() => removeMealItem(index)}
                    aria-label="Remover item"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <span className="text-lg font-semibold text-gray-800">Total de Calorias:</span>
          <span id="current-meal-total-kcal" className="text-2xl font-bold text-blue-600">{Math.round(totalMealKcal)}</span>
          <span className="text-lg text-gray-700">kcal</span>
        </div>
      </div>

      <div className="flex justify-between mt-6 p-4 bg-white rounded-lg shadow-md">
        <button
          type="button"
          id="cancel-log-entire-meal-btn"
          className="px-6 py-3 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          onClick={() => setView("HomePage")}
        >
          Cancelar
        </button>
        <button
          type="submit"
          id="save-entire-meal-btn"
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={mealItems.length === 0}
          // onClick={() => setView("ConfirmMealLog") } // TODO: Implement save logic
        >
          Salvar Refeição
        </button>
      </div>

      {/* Barcode Scanner Modal */}
      {showScannerModal && (
        <div id="barcode-scanner-modal" className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Escanear Código de Barras</h3>
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowScannerModal(false)}
              aria-label="Fechar"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
            <div id="scanner-container" ref={scannerContainerRef} className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 mb-4 overflow-hidden rounded-md">
              {/* QuaggaJS will render the video stream here */}
              {!window.Quagga && <p>Carregando scanner...</p>}
            </div>
            <p id="scanner-status" className="text-center text-sm text-gray-600">{scannerStatus}</p>
          </div>
        </div>
      )}

      {/* Product Not Found Modal */}
      {showNotFoundModal && (
        <div id="product-not-found-modal" className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative text-center">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Produto Não Encontrado</h3>
            <p className="text-gray-600 mb-4">Não conseguimos encontrar este produto em nossos bancos de dados ou no Open Food Facts.</p>
            <p className="text-gray-600 mb-6">Você pode adicioná-lo manualmente ou tentar escanear novamente.</p>
            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                onClick={() => setShowNotFoundModal(false)}
              >
                OK
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                // onClick={() => setView("AddFoodManuallyPage")}
                // TODO: Link to a page for manual food entry
              >
                Adicionar Manualmente
              </button>
            </div>
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => setShowNotFoundModal(false)}
              aria-label="Fechar"
            >
              <i className="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};