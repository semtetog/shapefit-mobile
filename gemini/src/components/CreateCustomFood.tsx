import React, { useState, useEffect, FormEvent } from 'react';

// Mock authentication and fetch for demonstration purposes.
// In a real application, these would typically be imported from a utility file
// or replaced with actual API calls and authentication context.
const requireAuth = async (): Promise<boolean> => {
  // Simulate an API call for authentication status
  await new Promise(resolve => setTimeout(resolve, 500));
  // For this example, we always return true. In a real app, this would check tokens, etc.
  return true;
};

const authenticatedFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  // Simulate an authenticated fetch request
  return new Promise(resolve => setTimeout(() => {
    resolve({
      json: () => Promise.resolve({ success: true, message: "Alimento salvo com sucesso!" }),
      ok: true,
      status: 200
    } as Response); // Cast to Response for type compatibility
  }, 1000));
};

// Mock BASE_APP_URL. In a real application, this would come from environment variables or a config file.
const BASE_APP_URL = "http://localhost:3000"; // Example URL

export const CreateCustomFood = ({ setView }: { setView: (view: string) => void }) => {
  const [foodName, setFoodName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [kcal_100g, setKcal_100g] = useState<number | ''>('');
  const [protein_100g, setProtein_100g] = useState<number | ''>('');
  const [carbs_100g, setCarbs_100g] = useState<number | ''>('');
  const [fat_100g, setFat_100g] = useState<number | ''>('');
  const [barcode, setBarcode] = useState<string | null>(null);

  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | ''; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initForm = async () => {
      // TODO: Integrate with actual authentication system if requireAuth is not a global script.
      const authenticated = await requireAuth();
      if (!authenticated) {
        // If not authenticated, navigate to a login/dashboard view
        // setView("Login"); // Example
        return;
      }

      // Parse URL parameters to pre-fill form fields, typically from a barcode scanner or previous page.
      const urlParams = new URLSearchParams(window.location.search);
      const barcodeParam = urlParams.get('barcode');
      const foodNameParam = urlParams.get('food_name');
      const brandNameParam = urlParams.get('brand_name');
      const kcalParam = urlParams.get('kcal_100g');
      const proteinParam = urlParams.get('protein_100g');
      const carbsParam = urlParams.get('carbs_100g');
      const fatParam = urlParams.get('fat_100g');

      if (barcodeParam) {
        setBarcode(barcodeParam);
      }
      if (foodNameParam) setFoodName(foodNameParam);
      if (brandNameParam) setBrandName(brandNameParam);
      if (kcalParam) setKcal_100g(parseFloat(kcalParam));
      if (proteinParam) setProtein_100g(parseFloat(proteinParam));
      if (carbsParam) setCarbs_100g(parseFloat(carbsParam));
      if (fatParam) setFat_100g(parseFloat(fatParam));
    };

    initForm();
  }, []); // Empty dependency array means this effect runs once after the initial render (like componentDidMount)

  const showAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    const timer = setTimeout(() => {
      setAlert(null);
    }, 3000); // Clear the alert message after 3 seconds
    return () => clearTimeout(timer); // Cleanup function for the timer
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsSubmitting(true); // Disable the button and show loading state
    setAlert(null); // Clear any previous alert messages

    // Basic client-side validation for required fields
    if (!foodName || kcal_100g === '' || protein_100g === '' || carbs_100g === '' || fat_100g === '') {
        showAlert('danger', 'Por favor, preencha todos os campos obrigatórios.');
        setIsSubmitting(false);
        return;
    }

    // Prepare form data for API submission
    const formData = {
      food_name: foodName.trim(),
      brand_name: brandName.trim(),
      kcal_100g: parseFloat(kcal_100g as string), // Cast to string for parseFloat, assuming controlled input ensures valid number or empty string
      protein_100g: parseFloat(protein_100g as string),
      carbs_100g: parseFloat(carbs_100g as string),
      fat_100g: parseFloat(fat_100g as string),
      ...(barcode && { barcode }) // Conditionally add barcode if it exists
    };

    try {
      const response = await authenticatedFetch(`${BASE_APP_URL}/api/save_custom_food.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showAlert('success', data.message || 'Alimento salvo com sucesso!');
        setTimeout(() => {
          setView("AddFoodToDiary"); // Navigate to the 'AddFoodToDiary' view after successful save
        }, 1500);
      } else {
        showAlert('danger', data.message || 'Erro ao salvar o alimento.');
      }
    } catch (error) {
      console.error('Erro ao salvar alimento:', error);
      showAlert('danger', 'Erro ao salvar o alimento. Tente novamente.');
    } finally {
      setIsSubmitting(false); // Re-enable the submit button regardless of success or failure
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-['Montserrat']">
      <div className="min-h-screen px-6 py-4 pb-[calc(140px+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+16px)] box-border">
        {/* Header Section */}
        <div className="flex items-center py-4 bg-transparent gap-4 mb-5">
          <button
            type="button" // Explicitly set type to button to prevent accidental form submission
            onClick={() => setView("Dashboard")} // Navigate back to a dashboard or previous view
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-orange-500"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <h1 className="flex-1 text-xl font-semibold text-white m-0">Cadastrar Alimento</h1>
        </div>

        {/* Main Form Section */}
        <form id="custom-food-form" onSubmit={handleSubmit} className="max-w-full mx-0">
          {/* Alert Container */}
          <div id="alert-container">
            {alert && (
              <div className={`p-3.5 rounded-xl mb-4 text-sm ${alert.type === 'danger' ? 'bg-red-500/10 border border-red-500/30 text-red-500' : 'bg-green-500/10 border border-green-500/30 text-green-500'}`}>
                {alert.message}
              </div>
            )}
          </div>

          {/* Barcode Information Section (conditionally rendered) */}
          {barcode && (
            <div id="barcode-info" className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-center gap-3">
              <i className="fas fa-barcode text-2xl text-orange-500"></i>
              <div className="flex-1">
                <strong className="block text-white text-sm mb-1">Código de Barras Detectado</strong>
                <span id="barcode-value" className="text-gray-400 text-xs">{barcode}</span>
              </div>
            </div>
          )}

          {/* Basic Information Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 md:p-5"> {/* Mobile: p-4, Desktop: p-5 */}
            <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-wider m-0 mb-4 pb-2 border-b border-white/10">Informações Básicas</h3>

            <div className="mb-4">
              <label htmlFor="food_name" className="block text-xs font-medium text-gray-400 mb-1.5">Nome do Alimento *</label>
              <input
                type="text"
                id="food_name"
                name="food_name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm transition-all duration-200 ease-in-out box-border focus:outline-none focus:border-orange-500 focus:bg-white/10 placeholder-white/30"
                placeholder="Ex: Pão de Forma Integral"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
              />
            </div>

            <div className="mb-0"> {/* The original HTML had :last-child, explicitly setting mb-0 here */} 
              <label htmlFor="brand_name" className="block text-xs font-medium text-gray-400 mb-1.5">Marca (opcional)</label>
              <input
                type="text"
                id="brand_name"
                name="brand_name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm transition-all duration-200 ease-in-out box-border focus:outline-none focus:border-orange-500 focus:bg-white/10 placeholder-white/30"
                placeholder="Ex: Wickbold"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
          </div>

          {/* Nutritional Information Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 md:p-5"> {/* Mobile: p-4, Desktop: p-5 */}
            <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-wider m-0 mb-4 pb-2 border-b border-white/10">Informação Nutricional (por 100g)</h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2"> {/* Mobile: 1 column, Desktop: 2 columns */}
              <div className="mb-0">
                <label htmlFor="kcal_100g" className="block text-xs font-medium text-gray-400 mb-1.5">Calorias (kcal) *</label>
                <input
                  type="number"
                  id="kcal_100g"
                  name="kcal_100g"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm transition-all duration-200 ease-in-out box-border focus:outline-none focus:border-orange-500 focus:bg-white/10 placeholder-white/30"
                  placeholder="Ex: 250"
                  required
                  step="0.1"
                  min="0"
                  value={kcal_100g}
                  onChange={(e) => setKcal_100g(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>

              <div className="mb-0">
                <label htmlFor="protein_100g" className="block text-xs font-medium text-gray-400 mb-1.5">Proteínas (g) *</label>
                <input
                  type="number"
                  id="protein_100g"
                  name="protein_100g"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm transition-all duration-200 ease-in-out box-border focus:outline-none focus:border-orange-500 focus:bg-white/10 placeholder-white/30"
                  placeholder="Ex: 8.5"
                  required
                  step="0.1"
                  min="0"
                  value={protein_100g}
                  onChange={(e) => setProtein_100g(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>

              <div className="mb-0">
                <label htmlFor="carbs_100g" className="block text-xs font-medium text-gray-400 mb-1.5">Carboidratos (g) *</label>
                <input
                  type="number"
                  id="carbs_100g"
                  name="carbs_100g"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm transition-all duration-200 ease-in-out box-border focus:outline-none focus:border-orange-500 focus:bg-white/10 placeholder-white/30"
                  placeholder="Ex: 45.2"
                  required
                  step="0.1"
                  min="0"
                  value={carbs_100g}
                  onChange={(e) => setCarbs_100g(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>

              <div className="mb-0">
                <label htmlFor="fat_100g" className="block text-xs font-medium text-gray-400 mb-1.5">Gorduras (g) *</label>
                <input
                  type="number"
                  id="fat_100g"
                  name="fat_100g"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm transition-all duration-200 ease-in-out box-border focus:outline-none focus:border-orange-500 focus:bg-white/10 placeholder-white/30"
                  placeholder="Ex: 4.1"
                  required
                  step="0.1"
                  min="0"
                  value={fat_100g}
                  onChange={(e) => setFat_100g(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Save Button Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6 shadow-xl md:p-5"> {/* Mobile: p-4, Desktop: p-5 */}
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-orange-500 border-none text-white text-base font-semibold cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-2 hover:bg-orange-600 hover:translate-y-[-1px] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              id="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Salvando...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Salvar Alimento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};