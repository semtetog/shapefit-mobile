import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // Assuming react-router-dom is used for URL params

interface EditMealProps {
  setView: (view: string) => void;
}

export const EditMeal = ({ setView }: EditMealProps) => {
  const [searchParams] = useSearchParams();
  const mealId = parseInt(searchParams.get('id') || '0', 10);

  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('');
  const [dateConsumed, setDateConsumed] = useState('');
  const [timeConsumed, setTimeConsumed] = useState('');
  const [servings, setServings] = useState(1.0);
  const [mealTypesOptions, setMealTypesOptions] = useState<Array<{ value: string; label: string }>>([]);

  const [nutritionPerServing, setNutritionPerServing] = useState({
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const [totalKcal, setTotalKcal] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);

  // Function to update nutritional values based on servings
  const updateNutrition = useCallback(() => {
    const currentServings = parseFloat(servings.toString()) || 1;

    const calculatedKcal = Math.round(nutritionPerServing.kcal * currentServings);
    const calculatedProtein = Math.round(nutritionPerServing.protein * currentServings * 10) / 10;
    const calculatedCarbs = Math.round(nutritionPerServing.carbs * currentServings * 10) / 10;
    const calculatedFat = Math.round(nutritionPerServing.fat * currentServings * 10) / 10;

    setTotalKcal(calculatedKcal);
    setTotalProtein(calculatedProtein);
    setTotalCarbs(calculatedCarbs);
    setTotalFat(calculatedFat);
  }, [servings, nutritionPerServing]);

  // Initial data loading and setup
  useEffect(() => {
    if (!mealId) {
      alert('ID da refeição inválido.');
      setView('Diary'); // Redirect to Diary page
      return;
    }

    // TODO: Implement authentication check (requireAuth() from original script)
    const loadMealData = async () => {
      // Placeholder for fetching meal data and meal types
      // const BASE_URL = window.BASE_APP_URL || ''; // Original logic
      console.log('Fetching meal data for ID:', mealId);

      // Simulate fetching meal types
      setTimeout(() => {
        setMealTypesOptions([
          { value: 'breakfast', label: 'Café da Manhã' },
          { value: 'lunch', label: 'Almoço' },
          { value: 'dinner', label: 'Jantar' },
          { value: 'snack', label: 'Lanche' },
        ]);
      }, 200);

      // Simulate fetching existing meal data
      setTimeout(() => {
        const fetchedData = {
          meal_name: 'Arroz com Frango (Exemplo)',
          meal_type: 'lunch',
          date_consumed: '2023-10-26',
          time_consumed: '13:00',
          servings: 1.5,
          nutrition: { kcal: 250, protein: 30, carbs: 40, fat: 10 }, // Nutrition per serving
        };

        setMealName(fetchedData.meal_name);
        setMealType(fetchedData.meal_type);
        setDateConsumed(fetchedData.date_consumed);
        setTimeConsumed(fetchedData.time_consumed);
        setServings(fetchedData.servings);
        setNutritionPerServing(fetchedData.nutrition);
        // The `updateNutrition` will be called by its own useEffect due to state changes
      }, 500);
    };

    loadMealData();
  }, [mealId, setView]);

  // Effect to update nutrition whenever servings or nutritionPerServing changes
  useEffect(() => {
    updateNutrition();
  }, [servings, nutritionPerServing, updateNutrition]);

  // TODO: Refactor global viewport height and touchmove listeners into a global context or custom hook if needed across the app.
  // This ensures better lifecycle management and avoids component-specific side effects for global concerns.
  useEffect(() => {
    const setRealViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setRealViewportHeight();
    window.addEventListener('resize', setRealViewportHeight);
    window.addEventListener('orientationchange', () => setTimeout(setRealViewportHeight, 100));

    const handleTouchMove = (event: TouchEvent) => {
      const scrollable = (event.target as HTMLElement).closest('.app-container, .container');
      if (!scrollable) {
        event.preventDefault();
      }
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('resize', setRealViewportHeight);
      window.removeEventListener('orientationchange', () => setTimeout(setRealViewportHeight, 100));
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleDeleteMeal = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta refeição?')) {
      console.log('Deleting meal:', mealId);
      // TODO: Implement actual API call for deletion
      alert('Refeição excluída com sucesso!');
      setView('Diary'); // Navigate back to diary after deletion
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Saving changes:', {
      mealId,
      mealName,
      mealType,
      dateConsumed,
      timeConsumed,
      servings,
    });
    // TODO: Implement actual API call to save meal changes
    alert('Refeição salva com sucesso!');
    setView('Diary'); // Navigate back to diary after saving
  };

  return (
    <div className="fixed-background absolute inset-0 bg-gray-950 -z-10" />
    <div id="alert-container" className="absolute top-0 left-0 right-0 z-50" />
    
    <div className="app-container relative pt-6 pb-16 min-h-screen bg-[#1a1a1a] md:pt-[calc(24px+env(safe-area-inset-top))] md:pb-[calc(60px+env(safe-area-inset-bottom))]">
      <div className="header flex items-center px-6 mb-6">
        <button
          type="button"
          id="back-button"
          className="back-button text-gray-400 text-xl mr-4 p-2 rounded-full transition-all duration-200 ease-in-out"
          aria-label="Voltar"
          onClick={() => setView('Diary')}
        >
          <i className="fas fa-chevron-left" />
        </button>
        <h1 className="page-title text-2xl font-bold text-white m-0">Editar Refeição</h1>
      </div>

      <div id="edit-form" className="edit-form bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-2xl mx-6 mb-6 p-6 overflow-hidden">
        <form onSubmit={handleSubmit} id="edit-meal-form">
          <input type="hidden" name="meal_id" id="meal_id" value={mealId} />

          {/* Informações Básicas */}
          <div className="form-section mb-6">
            <h3 className="section-title text-xl font-semibold text-white mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)]">Informações Básicas</h3>
            <div className="form-grid grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="form-group flex flex-col gap-2">
                <label htmlFor="meal_name" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nome da Refeição</label>
                <input
                  type="text"
                  id="meal_name"
                  name="meal_name"
                  className="form-control appearance-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-base transition-all duration-200 ease-in-out box-border w-full focus:outline-none focus:border-orange-500 focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] read-only:bg-[rgba(255,255,255,0.02)] read-only:text-gray-400 read-only:cursor-not-allowed"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="Ex: Arroz com frango grelhado"
                />
              </div>
              <div className="form-group flex flex-col gap-2">
                <label htmlFor="meal_type" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo de Refeição</label>
                <select
                  id="meal_type"
                  name="meal_type"
                  className="form-control appearance-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-base transition-all duration-200 ease-in-out box-border w-full focus:outline-none focus:border-orange-500 focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] read-only:bg-[rgba(255,255,255,0.02)] read-only:text-gray-400 read-only:cursor-not-allowed"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                >
                  {mealTypesOptions.length === 0 ? (
                    <option value="">Carregando...</option>
                  ) : (
                    mealTypesOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div className="date-time-wrapper grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="form-group flex flex-col gap-2">
                <label htmlFor="date_consumed" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Data</label>
                <input
                  type="date"
                  id="date_consumed"
                  name="date_consumed"
                  className="form-control appearance-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-base transition-all duration-200 ease-in-out box-border w-full focus:outline-none focus:border-orange-500 focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] read-only:bg-[rgba(255,255,255,0.02)] read-only:text-gray-400 read-only:cursor-not-allowed"
                  value={dateConsumed}
                  onChange={(e) => setDateConsumed(e.target.value)}
                />
              </div>
              <div className="form-group flex flex-col gap-2">
                <label htmlFor="time_consumed" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Horário</label>
                <input
                  type="time"
                  id="time_consumed"
                  name="time_consumed"
                  className="form-control appearance-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-base transition-all duration-200 ease-in-out box-border w-full focus:outline-none focus:border-orange-500 focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] read-only:bg-[rgba(255,255,255,0.02)] read-only:text-gray-400 read-only:cursor-not-allowed"
                  value={timeConsumed}
                  onChange={(e) => setTimeConsumed(e.target.value)}
                />
              </div>
            </div>
            <div className="form-grid grid grid-cols-1 gap-4 mt-4">
              <div className="form-group flex flex-col gap-2">
                <label htmlFor="servings" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Quantidade (porções)</label>
                <input
                  type="number"
                  id="servings"
                  name="servings"
                  className="form-control appearance-none bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white text-base transition-all duration-200 ease-in-out box-border w-full focus:outline-none focus:border-orange-500 focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.1)] read-only:bg-[rgba(255,255,255,0.02)] read-only:text-gray-400 read-only:cursor-not-allowed"
                  value={servings}
                  onChange={(e) => setServings(parseFloat(e.target.value))}
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Informações Nutricionais */}
          <div className="form-section">
            <h3 className="section-title text-xl font-semibold text-white mb-4 pb-2 border-b border-[rgba(255,255,255,0.08)]">Informações Nutricionais</h3>
            <div className="nutrition-display bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl p-5">
              <div className="nutrition-grid grid grid-cols-2 gap-4">
                <div className="nutrition-item text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl py-4 px-2">
                  <div className="nutrition-item-label text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Calorias</div>
                  <div id="total-kcal" className="nutrition-item-value text-xl font-bold text-white">
                    {totalKcal} <span className="nutrition-item-unit text-base font-medium text-orange-600 ml-0.5">kcal</span>
                  </div>
                </div>
                <div className="nutrition-item text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl py-4 px-2">
                  <div className="nutrition-item-label text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Proteínas</div>
                  <div id="total-protein" className="nutrition-item-value text-xl font-bold text-white">
                    {totalProtein} <span className="nutrition-item-unit text-base font-medium text-orange-600 ml-0.5">g</span>
                  </div>
                </div>
                <div className="nutrition-item text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl py-4 px-2">
                  <div className="nutrition-item-label text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Carboidratos</div>
                  <div id="total-carbs" className="nutrition-item-value text-xl font-bold text-white">
                    {totalCarbs} <span className="nutrition-item-unit text-base font-medium text-orange-600 ml-0.5">g</span>
                  </div>
                </div>
                <div className="nutrition-item text-center bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl py-4 px-2">
                  <div className="nutrition-item-label text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Gorduras</div>
                  <div id="total-fat" className="nutrition-item-value text-xl font-bold text-white">
                    {totalFat} <span className="nutrition-item-unit text-base font-medium text-orange-600 ml-0.5">g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons flex flex-col md:flex-row gap-3 mt-6 pt-5 border-t border-[rgba(255,255,255,0.08)]">
            <button type="button" className="btn btn-secondary flex-1 h-12 rounded-2xl text-base font-semibold border-none cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.06)] text-gray-400 border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.1)]" id="cancel-btn" onClick={() => setView('Diary')}>
              <i className="fas fa-times" />
              Cancelar
            </button>
            <button type="button" className="btn btn-danger flex-1 h-12 rounded-2xl text-base font-semibold border-none cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-2 bg-[rgba(220,53,69,0.1)] text-red-500 border border-[rgba(220,53,69,0.3)] hover:bg-[rgba(220,53,69,0.2)]" onClick={handleDeleteMeal}>
              <i className="fas fa-trash" />
              Excluir
            </button>
            <button type="submit" className="btn btn-primary flex-1 h-12 rounded-2xl text-base font-semibold border-none cursor-pointer transition-all duration-200 ease-in-out flex items-center justify-center gap-2 bg-orange-600 text-white hover:bg-orange-700">
              <i className="fas fa-save" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};
