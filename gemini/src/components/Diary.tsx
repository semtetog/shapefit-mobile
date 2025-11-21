import React, { useEffect, useState } from 'react';

export const Diary = ({ setView }: { setView: (view: string) => void }) => {
  // State for diary data
  const [currentDateDisplay, setCurrentDateDisplay] = useState('Carregando...');
  const [kcalConsumed, setKcalConsumed] = useState(0);
  const [kcalGoal, setKcalGoal] = useState(0);
  const [proteinConsumed, setProteinConsumed] = useState(0);
  const [proteinGoal, setProteinGoal] = useState(0);
  const [carbsConsumed, setCarbsConsumed] = useState(0);
  const [carbsGoal, setCarbsGoal] = useState(0);
  const [fatConsumed, setFatConsumed] = useState(0);
  const [fatGoal, setFatGoal] = useState(0);
  const [meals, setMeals] = useState<any[]>([]); // Assuming meals is an array of objects
  const [isLoading, setIsLoading] = useState(true);

  // useEffect for viewport height and touchmove event listeners
  useEffect(() => {
    function setRealViewportHeight() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setRealViewportHeight();
    window.addEventListener('resize', setRealViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setRealViewportHeight, 100);
    });

    const handleTouchMove = (event: TouchEvent) => {
      const scrollable = (event.target as HTMLElement).closest('.app-container, .container');
      if (!scrollable) {
        event.preventDefault();
      }
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('resize', setRealViewportHeight);
      window.removeEventListener('orientationchange', () => { /* no-op */ }); // Cleaner cleanup
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // useEffect for data loading (simulated)
  useEffect(() => {
    // Helper function to get local date string (YYYY-MM-DD)
    const getLocalDateString = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const loadDiaryData = async (date: string) => {
      setIsLoading(true);
      // Format date for display (e.g., YYYY-MM-DD to DD/MM/YYYY)
      setCurrentDateDisplay(date.split('-').reverse().join('/'));

      // TODO: Replace with actual API call (e.g., authenticatedFetch)
      // const token = getAuthToken();
      // const response = await authenticatedFetch(`${BASE_APP_URL}/api/get_diary_data.php?date=${date}`);
      // ... handle response and errors ...

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Placeholder data (replace with actual fetched data)
      setKcalConsumed(1500);
      setKcalGoal(2000);
      setProteinConsumed(80);
      setProteinGoal(120);
      setCarbsConsumed(150);
      setCarbsGoal(200);
      setFatConsumed(50);
      setFatGoal(60);

      setMeals([
        {
          id: 1,
          name: 'Café da Manhã',
          totalKcal: 350,
          items: [
            { id: 101, name: 'Ovos mexidos com queijo', details: '2 ovos, 30g queijo', kcal: 250 },
            { id: 102, name: 'Pão integral', details: '1 fatia', kcal: 100 },
          ],
        },
        {
          id: 2,
          name: 'Almoço',
          totalKcal: 600,
          items: [
            { id: 201, name: 'Frango grelhado', details: '150g', kcal: 300 },
            { id: 202, name: 'Arroz integral', details: '100g', kcal: 150 },
            { id: 203, name: 'Salada mista', details: 'Variados', kcal: 50 },
            { id: 204, name: 'Azeite de oliva', details: '10ml', kcal: 100 },
          ],
        },
      ]);
      setIsLoading(false);
    };

    const initialDate = getLocalDateString();
    loadDiaryData(initialDate);

    // TODO: Implement navigation for prev/next date logic here
    // This would involve managing a `currentSelectedDate` state and calling `loadDiaryData`.
  }, []); // Empty dependency array means this runs once on mount

  // Helper for date navigation (simplified for demonstration, needs full logic implementation)
  const handleDateChange = (direction: 'prev' | 'next') => {
    // In a real application, you would parse currentDateDisplay, adjust the date,
    // format it back to YYYY-MM-DD, and then call `loadDiaryData(newDate)`. 
    console.log(`Navigate ${direction} date`);
    // Example: setView('Diary?date=...') or update internal date state
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen font-['Montserrat'] relative">
      {/* Placeholder for fixed-background: assuming it's a subtle background image */}
      <div className="fixed inset-0 bg-cover bg-center opacity-20 -z-10" style={{ backgroundImage: 'url("https://placehold.co/1920x1080?text=Background")' }}></div>
      <div id="alert-container" className="fixed top-0 left-0 right-0 z-50"></div>

      <div className="app-container pt-6 pb-20 md:pb-[calc(60px+env(safe-area-inset-bottom))] px-0"> {/* padding-bottom calc is tricky in Tailwind, approximate or use inline style if exact match is critical */}
        {/* Header com navegação de data */}
        <div className="flex justify-between items-center mb-5 px-6">
          <h1 className="text-2xl font-bold text-white">Diário</h1>
          <div className="flex items-center gap-3 bg-white/5 py-2 px-4 rounded-xl border border-white/10">
            <button onClick={() => handleDateChange('prev')} className="text-gray-400 text-base transition-colors w-6 h-6 flex items-center justify-center hover:text-orange-500">
              <i className="fas fa-chevron-left"></i>
            </button>
            <span id="current-diary-date" className="font-semibold text-white text-sm">{currentDateDisplay}</span>
            <button onClick={() => handleDateChange('next')} className="text-gray-400 text-base transition-colors w-6 h-6 flex items-center justify-center hover:text-orange-500">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Resumo nutricional compacto */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mx-6 mb-5 grid grid-cols-4 gap-3 text-center md:grid-cols-2 md:gap-2 md:p-3">
          <div className="py-3 px-2">
            <h3 className="text-[11px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Calorias</h3>
            <div className="text-base font-bold text-white" id="kcal-consumed">{kcalConsumed}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">/ <span id="kcal-goal">{kcalGoal}</span> kcal</div>
          </div>
          <div className="py-3 px-2">
            <h3 className="text-[11px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Proteínas</h3>
            <div className="text-base font-bold text-white" id="protein-consumed">{proteinConsumed}g</div>
            <div className="text-[10px] text-gray-400 mt-0.5">/ <span id="protein-goal">{proteinGoal}</span>g</div>
          </div>
          <div className="py-3 px-2">
            <h3 className="text-[11px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Carboidratos</h3>
            <div className="text-base font-bold text-white" id="carbs-consumed">{carbsConsumed}g</div>
            <div className="text-[10px] text-gray-400 mt-0.5">/ <span id="carbs-goal">{carbsGoal}</span>g</div>
          </div>
          <div className="py-3 px-2">
            <h3 className="text-[11px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Gorduras</h3>
            <div className="text-base font-bold text-white" id="fat-consumed">{fatConsumed}g</div>
            <div className="text-[10px] text-gray-400 mt-0.5">/ <span id="fat-goal">{fatGoal}</span>g</div>
          </div>
        </div>

        {/* Lista de refeições */}
        <div className="flex flex-col gap-3 px-6" id="meals-list">
          {isLoading ? (
            <div className="text-center py-10 px-5 text-gray-400">
              <i className="fas fa-spinner fa-spin text-5xl text-orange-500 mb-4"></i>
              <h3 className="text-lg text-white mb-2">Carregando...</h3>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-10 px-5 text-gray-400">
              <i className="fas fa-utensils text-5xl text-orange-500 mb-4"></i>
              <h3 className="text-lg text-white mb-2">Nenhuma refeição registrada</h3>
              <p className="text-sm">Adicione sua primeira refeição para começar o diário.</p>
            </div>
          ) : (
            meals.map((mealGroup, index) => (
              <div key={mealGroup.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex justify-between items-center py-3 px-4 bg-white/[0.02] border-b border-white/[0.08]">
                  <h3 className="text-sm font-semibold text-white">{mealGroup.name}</h3>
                  <span className="text-xs text-orange-500 font-semibold">{mealGroup.totalKcal} kcal</span>
                </div>
                <div className="py-3 px-4">
                  {mealGroup.items.map((item: any, itemIndex: number) => (
                    <div key={item.id} className={`flex justify-between items-center py-2 ${itemIndex < mealGroup.items.length - 1 ? 'border-b border-white/[0.05]' : ''}`}>
                      <div className="flex-1">
                        <p className="text-sm text-white mb-0.5 font-medium">{item.name}</p>
                        <p className="text-[11px] text-gray-400">{item.details}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-orange-500 font-semibold">{item.kcal} kcal</span>
                        <button onClick={() => setView("EditMealPage")} className="text-gray-400 text-sm p-1.5 rounded-md transition-all hover:text-orange-500 hover:bg-orange-500/10">
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botão de adicionar refeição integrado */}
        <div className="mx-6 my-5 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <button onClick={() => setView("AddMealPage")} className="w-full h-12 rounded-xl bg-orange-500 border-none text-white text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-[#ff7a1a] hover:-translate-y-px hover:shadow-lg hover:shadow-orange-500/30">
            <i className="fas fa-plus"></i>
            <span>Adicionar Refeição</span>
          </button>
        </div>
      </div>

      {/* TODO: Bottom Navigation (from bottom-nav.js) - this would typically be a separate component and handled by a global layout. */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 shadow-lg flex justify-around">
        <button onClick={() => setView("HomePage")} className="text-gray-400">Home</button>
        <button onClick={() => setView("DiaryPage")} className="text-orange-500">Diário</button>
        <button onClick={() => setView("StatsPage")} className="text-gray-400">Estatísticas</button>
      </div> */}
    </div>
  );
};