import React, { useEffect, useState } from 'react';

interface FavoriteRecipesProps {
  setView: (view: string) => void;
}

export const FavoriteRecipes = ({ setView }: FavoriteRecipesProps) => {
  // State to manage modal visibility
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [currentSort, setCurrentSort] = useState('name_asc');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  useEffect(() => {
    // --- SCRIPT CRITICAL (Converted to useEffect) --- //
    const setRealViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

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

    // --- GLOBAL VARIABLES (www-config.js / BASE_APP_URL) --- //
    // Direct script inclusion and global variable manipulation is not idiomatic React.
    // In a React application, BASE_APP_URL would typically be managed via environment variables
    // or a context provider, not through global window properties.
    // The original logic is commented out here:
    // if (!(window as any).BASE_APP_URL) {
    //   (window as any).BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
    // }
    // if ((window as any).BASE_APP_URL && (window as any).BASE_APP_URL.endsWith('/')) {
    //   (window as any).BASE_APP_URL = (window as any).BASE_APP_URL.slice(0, -1);
    // }

    // --- Auth Script (auth.js) --- //
    // Similar to www-config.js, authentication logic is typically handled by React contexts, hooks,
    // or dedicated libraries rather than external global scripts.

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('resize', setRealViewportHeight);
      window.removeEventListener('orientationchange', setRealViewportHeight);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const toggleFilterModal = () => {
    setIsFilterModalVisible(!isFilterModalVisible);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSort(event.target.value);
  };

  const handleChipChange = (chipValue: string) => {
    setSelectedChips((prev) =>
      prev.includes(chipValue) ? prev.filter((c) => c !== chipValue) : [...prev, chipValue]
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-['Montserrat']">
      {/* Assuming Montserrat font is loaded globally (e.g., via Tailwind config or index.css) */}
      <div className="fixed-background absolute inset-0 bg-[url('https://placehold.co/1920x1080?text=Background')] bg-cover bg-center opacity-10 z-0"></div>
      <div id="alert-container" className="relative z-10">{/* TODO: Implement Alert Component if needed */}</div>
      
      <div className="app-container relative z-10 py-[max(calc(24px+env(safe-area-inset-top)),44px)] md:py-[calc(20px+env(safe-area-inset-top))] pb-[max(calc(60px+env(safe-area-inset-bottom)),110px)]">
        <header className="page-header grid grid-cols-1 items-center pt-[calc(1.5rem+env(safe-area-inset-top,0px))] px-4 pb-0 mb-14 relative">
          <button
            onClick={() => setView("ExploreRecipes")}
            className="back-button absolute left-4 top-[calc(1.5rem+env(safe-area-inset-top,0px))] flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white transition-all duration-300 ease-in-out shrink-0 z-10 hover:bg-white/10 hover:border-orange-500 hover:text-orange-500 hover:-translate-x-0.5"
            aria-label="Voltar"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="page-header-text text-center px-[60px] md:px-[70px]">
            <h1 className="text-[1.75rem] font-bold m-0 text-white">Receitas Favoritas</h1>
            <p className="text-sm text-gray-400 m-0 mt-1">Sua coleção pessoal de receitas.</p>
          </div>
        </header>

        <div className="search-filter-container flex gap-3 px-4 py-6 items-center">
          <div className="search-form relative flex-grow">
            <i className="fas fa-search search-icon absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            <input
              type="search"
              id="search-input"
              className="search-input w-full h-12 pl-[45px] pr-4 bg-gray-800 border border-gray-700 rounded-2xl text-white text-base focus:outline-none focus:border-orange-500"
              placeholder="Buscar nos favoritos..."
              defaultValue=""
            />
          </div>
          <button
            onClick={toggleFilterModal}
            className={`filter-button shrink-0 w-12 h-12 rounded-2xl border border-gray-700 bg-gray-800 text-white flex items-center justify-center cursor-pointer text-base relative z-10 ${isFilterModalVisible ? 'active' : ''}`}
            aria-label="Filtrar"
          >
            <i className="fas fa-sliders-h"></i>
            {/* Pseudo-element for active state dot simulated with a span */}
            {isFilterModalVisible && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-gray-900"></span>
            )}
          </button>
        </div>

        <div id="loading-state" className="text-center p-10 text-gray-400" style={{ display: 'none' }}>
          <i className="fas fa-spinner fa-spin text-5xl mb-4"></i>
          <p>Carregando receitas favoritas...</p>
        </div>

        {/* Example Recipe List (will be dynamically rendered in a real app based on state) */}
        <div id="recipes-list" className="recipe-list-stack flex flex-col gap-2 px-4" style={{ display: 'none' }}>
          {/* Placeholder for recipe items, replace with actual data mapping */}
          <div onClick={() => setView('RecipeDetail')} className="recipe-list-item p-3 flex gap-4 items-center cursor-pointer bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-200">
            <img src="https://placehold.co/600x400?text=Receita+1" alt="Recipe Image" className="recipe-list-image w-16 h-16 shrink-0 rounded-xl object-cover" />
            <div className="recipe-list-info flex-grow flex flex-col justify-center overflow-hidden">
              <h3 className="text-base font-semibold m-0 mb-1 whitespace-nowrap overflow-hidden text-ellipsis text-white">Salada de Quinoa com Vegetais</h3>
              <div className="kcal text-sm font-medium text-gray-400 flex items-center gap-1.5">
                <i className="fas fa-fire text-orange-500"></i>
                <span>250 kcal</span>
              </div>
            </div>
            <i className="favorite-icon fas fa-heart shrink-0 pl-4 text-orange-500 text-base"></i>
          </div>
          <div onClick={() => setView('RecipeDetail')} className="recipe-list-item p-3 flex gap-4 items-center cursor-pointer bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors duration-200">
            <img src="https://placehold.co/600x400?text=Receita+2" alt="Recipe Image" className="recipe-list-image w-16 h-16 shrink-0 rounded-xl object-cover" />
            <div className="recipe-list-info flex-grow flex flex-col justify-center overflow-hidden">
              <h3 className="text-base font-semibold m-0 mb-1 whitespace-nowrap overflow-hidden text-ellipsis text-white">Frango Grelhado com Batata Doce</h3>
              <div className="kcal text-sm font-medium text-gray-400 flex items-center gap-1.5">
                <i className="fas fa-fire text-orange-500"></i>
                <span>380 kcal</span>
              </div>
            </div>
            <i className="favorite-icon fas fa-heart shrink-0 pl-4 text-orange-500 text-base"></i>
          </div>
        </div>
        
        <div id="empty-state" className="empty-favorites-message bg-white/5 border border-white/10 rounded-2xl m-4 p-8 text-center" style={{ display: 'none' }}>
            <i className="far fa-heart text-orange-500 text-5xl mb-4"></i>
            <p id="empty-message" className="m-0 text-gray-400 leading-normal">Você ainda não favoritou nenhuma receita.<br /><span className="text-orange-500">Toque no coração para guardá-las aqui.</span></p>
        </div>
      </div>

      {/* Filter Modal */}
      <div className={`modal-overlay fixed inset-0 bg-black/65 backdrop-blur-md z-[2000] transition-all duration-300 ease-in-out ${isFilterModalVisible ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className={`modal-content fixed bottom-0 left-0 right-0 w-screen max-w-full bg-zinc-900/95 rounded-t-[30px] border-t border-white/10 transition-transform duration-350 ease-out shadow-xl flex flex-col max-h-screen overflow-hidden box-border px-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] pb-0 z-[2001] ${isFilterModalVisible ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="modal-header pt-4 px-6 pb-2.5 text-center relative">
            {/* Modal grab handle (replaces ::before) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-11 h-1 bg-white/30 rounded-full"></div>
            <h2 className="modal-title text-lg tracking-wider text-white font-semibold m-0 uppercase">Filtros</h2>
          </div>
          
          <div className="modal-scrollable-content px-4 pb-3 overflow-y-auto flex flex-col gap-4 max-h-[calc(100vh-260px)]">
            <section className="filter-section bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="filter-section-header flex flex-col gap-1">
                <p className="m-0 text-base font-semibold text-white">Ordenar por</p>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Escolha apenas uma opção</span>
              </div>
              <div className="sort-pill-group flex gap-2 flex-wrap">
                <label className="sort-pill relative flex-1 basis-[calc(50%-8px)] min-w-[110px]">
                  <input type="radio" id="sort_name_asc" name="sort" value="name_asc" className="absolute inset-0 opacity-0 pointer-events-none peer" checked={currentSort === 'name_asc'} onChange={handleSortChange} />
                  <span className="flex items-center justify-center p-2.5 px-3 rounded-full border border-white/15 bg-white/5 text-sm text-white transition-all duration-200 ease-in-out peer-checked:bg-gradient-to-tr peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">Nome (A-Z)</span>
                </label>
                <label className="sort-pill relative flex-1 basis-[calc(50%-8px)] min-w-[110px]">
                  <input type="radio" id="sort_kcal_asc" name="sort" value="kcal_asc" className="absolute inset-0 opacity-0 pointer-events-none peer" checked={currentSort === 'kcal_asc'} onChange={handleSortChange} />
                  <span className="flex items-center justify-center p-2.5 px-3 rounded-full border border-white/15 bg-white/5 text-sm text-white transition-all duration-200 ease-in-out peer-checked:bg-gradient-to-tr peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">Menos Calóricas</span>
                </label>
                <label className="sort-pill relative flex-1 basis-[calc(50%-8px)] min-w-[110px]">
                  <input type="radio" id="sort_protein_desc" name="sort" value="protein_desc" className="absolute inset-0 opacity-0 pointer-events-none peer" checked={currentSort === 'protein_desc'} onChange={handleSortChange} />
                  <span className="flex items-center justify-center p-2.5 px-3 rounded-full border border-white/15 bg-white/5 text-sm text-white transition-all duration-200 ease-in-out peer-checked:bg-gradient-to-tr peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">Mais Proteicas</span>
                </label>
                <label className="sort-pill relative flex-1 basis-[calc(50%-8px)] min-w-[110px]">
                  <input type="radio" id="sort_time_asc" name="sort" value="time_asc" className="absolute inset-0 opacity-0 pointer-events-none peer" checked={currentSort === 'time_asc'} onChange={handleSortChange} />
                  <span className="flex items-center justify-center p-2.5 px-3 rounded-full border border-white/15 bg-white/5 text-sm text-white transition-all duration-200 ease-in-out peer-checked:bg-gradient-to-tr peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">Mais Rápidas</span>
                </label>
              </div>
            </section>

            {/* Example Filter Section (Categories/Diets) - expanded based on typical modal content */}
            <section className="filter-section bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="filter-section-header flex flex-col gap-1">
                <p className="m-0 text-base font-semibold text-white">Categorias</p>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Escolha uma ou mais opções</span>
              </div>
              <div className="chips-grid grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] sm:grid-cols-[repeat(auto-fill,100px)] gap-2 justify-center">
                <label className="chip-option relative w-full">
                  <input type="checkbox" name="category" value="vegan" className="absolute inset-0 opacity-0 pointer-events-none peer" checked={selectedChips.includes('vegan')} onChange={() => handleChipChange('vegan')} />
                  <span className="flex items-center justify-center p-2.5 px-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white h-[42px] w-full text-center leading-tight transition-all duration-200 ease-in-out peer-checked:bg-gradient-to-tr peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">Vegano</span>
                </label>
                <label className="chip-option relative w-full">
                  <input type="checkbox" name="category" value="gluten_free" className="absolute inset-0 opacity-0 pointer-events-none peer" checked={selectedChips.includes('gluten_free')} onChange={() => handleChipChange('gluten_free')} />
                  <span className="flex items-center justify-center p-2.5 px-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white h-[42px] w-full text-center leading-tight transition-all duration-200 ease-in-out peer-checked:bg-gradient-to-tr peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">Sem Glúten</span>
                </label>
                <label className="chip-option relative w-full">
                  <input type="checkbox" name="category" value="low_carb" className="absolute inset-0 opacity-0 pointer-events-none peer" checked={selectedChips.includes('low_carb')} onChange={() => handleChipChange('low_carb')} />
                  <span className="flex items-center justify-center p-2.5 px-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white h-[42px] w-full text-center leading-tight transition-all duration-200 ease-in-out peer-checked:bg-gradient-to-tr peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">Low Carb</span>
                </label>
                <label className="chip-option relative w-full">
                  <input type="checkbox" name="category" value="vegetarian" className="absolute inset-0 opacity-0 pointer-events-none peer" checked={selectedChips.includes('vegetarian')} onChange={() => handleChipChange('vegetarian')} />
                  <span className="flex items-center justify-center p-2.5 px-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white h-[42px] w-full text-center leading-tight transition-all duration-200 ease-in-out peer-checked:bg-gradient-to-tr peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">Vegetariano</span>
                </label>
              </div>
            </section>
            {/* Add more filter sections here if the original HTML had more content */}

          </div>

          <div className="modal-actions p-4 px-[calc(16px+env(safe-area-inset-right,0px))] pb-[calc(18px+70px+env(safe-area-inset-bottom,0px))] border-t border-white/5 bg-zinc-900/95 flex items-center gap-2.5 mt-auto">
            <button onClick={() => {
              setCurrentSort('name_asc'); // Reset sort to default
              setSelectedChips([]); // Clear all selected chips
            }} className="btn-secondary rounded-xl h-[46px] text-base font-semibold border-none cursor-pointer transition-all duration-200 ease-in-out flex-1 min-w-0 bg-white/10 text-white hover:bg-white/15">Limpar</button>
            <button onClick={toggleFilterModal} className="btn-primary rounded-xl h-[46px] text-base font-semibold border-none cursor-pointer transition-all duration-200 ease-in-out flex-1 min-w-0 bg-gradient-to-tr from-orange-400 to-orange-600 text-white hover:brightness-105">Aplicar</button>
          </div>
        </div>
      </div>
    </div>
  );
};
