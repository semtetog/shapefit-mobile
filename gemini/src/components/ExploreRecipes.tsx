import React, { useState, useEffect } from 'react';

// TODO: Implement global viewport height and touchmove listeners if needed
// The original HTML included global scripts for setting --vh CSS variable and preventing touchmove
// on non-scrollable areas. These are typically managed at a higher level in a React app (e.g., in _app.tsx or a global context/hook).
// For this component, they are commented out as they don't directly control component state.

export const ExploreRecipes = ({ setView }: { setView: (view: string) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState(''); // e.g., 'Popular', 'Vegetariana', 'ComPoucasCalorias'
  const [sortOrder, setSortOrder] = useState('relevant'); // 'relevant', 'newest', 'oldest'

  // Dummy Data for demonstration
  const categories = [
    {
      name: 'Receitas Populares',
      recipes: [
        { id: 1, name: 'Salada de Quinoa com Vegetais', kcal: '320 Kcal', img: 'https://placehold.co/600x400?text=Salada+de+Quinoa' },
        { id: 2, name: 'Frango Grelhado com Batata Doce', kcal: '450 Kcal', img: 'https://placehold.co/600x400?text=Frango+Grelhado' },
        { id: 3, name: 'Sopa Detox de Legumes', kcal: '180 Kcal', img: 'https://placehold.co/600x400?text=Sopa+Detox' },
      ],
    },
    {
      name: 'Cafés da Manhã Rápidos',
      recipes: [
        { id: 4, name: 'Aveia com Frutas Vermelhas', kcal: '280 Kcal', img: 'https://placehold.co/600x400?text=Aveia' },
        { id: 5, name: 'Omelete de Claras com Espinafre', kcal: '150 Kcal', img: 'https://placehold.co/600x400?text=Omelete' },
        { id: 6, name: 'Smoothie Verde Energético', kcal: '220 Kcal', img: 'https://placehold.co/600x400?text=Smoothie' },
      ],
    },
  ];

  const allRecipes = categories.flatMap((cat) => cat.recipes);

  const filteredRecipes = searchText || activeFilter
    ? allRecipes.filter((recipe) => {
        const matchesSearch = searchText
          ? recipe.name.toLowerCase().includes(searchText.toLowerCase())
          : true;
        // More complex filter logic would go here based on activeFilter
        const matchesFilter = activeFilter ? recipe.name.includes(activeFilter) : true; // Simplified for demo
        return matchesSearch && matchesFilter;
      })
    : [];

  const handleApplyFilters = () => {
    // In a real app, this would trigger a data fetch with the new filters
    console.log('Aplicando filtros:', { activeFilter, sortOrder });
    setIsModalOpen(false);
  };

  const handleClearFilters = () => {
    setActiveFilter('');
    setSortOrder('relevant');
    // In a real app, this would trigger a data fetch to clear filters
    console.log('Filtros limpos');
    setIsModalOpen(false);
  };

  return (
    <div
      className="app-container min-h-screen box-border flex flex-col pt-6 pb-24 px-0"
      // Note: `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` for padding are best handled
      // with a global CSS solution or postcss-preset-env in a build step, or by using custom utility classes
      // defined in your Tailwind config if these values are critical for the layout.
      // For this example, fixed padding values are used as a fallback.
      style={{paddingTop: 'calc(24px + env(safe-area-inset-top))', paddingBottom: 'calc(60px + env(safe-area-inset-bottom))'}}
    >
      {/* Header */}
      <header className="page-header text-center mb-8 px-6">
        <h1 className="page-title text-3xl font-bold text-white m-0">Explorar Receitas</h1>
      </header>

      {/* Busca e Filtros */}
      <div className="search-section flex gap-3 mb-6 items-center px-6">
        <div className="search-wrapper flex-1 relative">
          <i className="fas fa-search search-icon absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"></i>
          <input
            type="search"
            id="search-input"
            className="search-input w-full h-12 px-4 pl-12 bg-white/5 border border-white/10 rounded-xl text-white text-base box-border transition-all duration-200 ease-in-out focus:outline-none focus:border-orange-500 focus:bg-white/10"
            placeholder="Buscar por nome..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <button
          className={`filter-btn w-12 h-12 bg-white/5 border border-white/10 rounded-xl text-white flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out relative ${activeFilter ? 'hover:bg-white/10 hover:border-orange-500' : 'hover:bg-white/10 hover:border-orange-500'}`}
          id="filter-btn"
          aria-label="Filtrar"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="fas fa-sliders-h"></i>
          {activeFilter && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-gray-900"></div>
          )}
        </button>
      </div>

      {/* Botão Favoritos */}
      <div className="favorites-section mb-8 px-6">
        <button
          className="favorites-btn flex items-center justify-center gap-3 w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white text-base font-medium transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-orange-500 hover:text-orange-500"
          onClick={() => setView('FavoriteRecipes')}
        >
          <i className="fas fa-heart text-orange-500 text-lg"></i>
          <span>Minhas Favoritas</span>
        </button>
      </div>

      {/* Filtros Ativos */}
      {activeFilter && (
        <div id="active-filters-container" className="text-center mb-6 mx-6">
          <div className="active-filters inline-block w-auto max-w-[calc(100%-48px)] py-3 px-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm text-gray-400">
            Filtrando por: <strong className="text-orange-500 font-semibold">{activeFilter}</strong>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main id="main-content" className="flex-1">
        {searchText || activeFilter ? (
          filteredRecipes.length > 0 ? (
            <div className="recipes-list flex flex-col gap-5 p-5 px-6 pb-24">
              {filteredRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  className="recipe-item flex gap-4 p-4 bg-white/5 border border-white/10 rounded-xl transition-all duration-200 ease-in-out"
                  onClick={() => setView('RecipeDetail')}
                >
                  <img src={recipe.img} alt={recipe.name} className="recipe-image w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  <div className="recipe-info flex-1 flex flex-col justify-center min-w-0">
                    <h3 className="recipe-name text-base font-semibold text-white mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{recipe.name}</h3>
                    <p className="recipe-kcal text-sm text-gray-400 flex items-center gap-1.5">
                      <i className="fas fa-fire text-orange-500"></i> {recipe.kcal}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 text-gray-400">
              Nenhuma receita encontrada com os filtros aplicados.
            </div>
          )
        ) : (
          <div className="categories-grid flex flex-col gap-8">
            {categories.map((category) => (
              <section key={category.name} className="category-section flex flex-col gap-4">
                <header className="category-header flex justify-between items-center px-6">
                  <h2 className="category-title text-xl font-semibold text-white m-0">{category.name}</h2>
                  <button
                    className="view-all-link text-sm text-orange-500 font-medium transition-opacity duration-200 ease-in-out hover:opacity-80"
                    onClick={() => setView('CategoryDetail')}
                  >
                    Ver Todos
                  </button>
                </header>
                <div className="recipes-carousel flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide">
                  {category.recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      className="recipe-card flex-shrink-0 w-40 bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-200 ease-in-out"
                      onClick={() => setView('RecipeDetail')}
                    >
                      <img src={recipe.img} alt={recipe.name} className="card-image w-full h-30 object-cover" />
                      <div className="card-info p-3">
                        <h3 className="card-name text-sm font-semibold text-white mb-2 leading-tight">{recipe.name}</h3>
                        <p className="card-kcal text-xs text-gray-400 flex items-center gap-1">
                          <i className="fas fa-fire text-orange-500 text-xs"></i> {recipe.kcal}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Filtros */}
      <div
        className={`modal-overlay fixed inset-0 bg-black/65 backdrop-blur-md z-[2000] transition-all duration-300 ease-in-out ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className={`modal-content fixed bottom-0 left-0 right-0 w-screen max-w-full bg-gray-900/95 rounded-t-[30px] border-t border-white/10 transition-transform duration-350 ease-[cubic-bezier(.25,1,.5,1)] shadow-[0_-12px_52px_rgba(0,0,0,0.35)] flex flex-col max-h-screen overflow-hidden box-border z-[2001] transform ${isModalOpen ? 'translate-y-0' : 'translate-y-full'}`}
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          style={{paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)'}}
        >
          <header className="modal-header py-4 px-6 pb-2.5 text-center relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-11 h-1 bg-white/30 rounded-full"></div>
            <h2 className="modal-title text-lg tracking-wide text-white font-semibold uppercase m-0">Filtrar Receitas</h2>
          </header>

          <div className="modal-scrollable-content px-4.5 pb-3 overflow-y-auto flex flex-col gap-4 max-h-[calc(100vh-260px)]">
            {/* Seção de Ordenação */}
            <div className="filter-section bg-white/5 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-3">
              <div className="filter-section-header flex flex-col gap-1">
                <p className="m-0 text-[15px] font-semibold text-white">Ordenar por</p>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Organize os resultados</span>
              </div>
              <div className="sort-pill-group flex gap-2 flex-wrap">
                {['Mais Relevante', 'Mais Recente', 'Menos Recente'].map((option) => (
                  <label key={option} className="sort-pill relative flex-1 basis-[calc(50%-8px)] min-w-[110px]">
                    <input
                      type="radio"
                      name="sortOrder"
                      value={option.toLowerCase().replace(/\s/g, '')}
                      checked={sortOrder === option.toLowerCase().replace(/\s/g, '')}
                      onChange={() => setSortOrder(option.toLowerCase().replace(/\s/g, ''))}
                      className="absolute inset-0 opacity-0 pointer-events-none peer"
                    />
                    <span className="flex items-center justify-center py-2 px-3 rounded-full border border-white/15 bg-white/5 text-sm text-white transition-all duration-200 ease-in-out peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seção de Filtros (Exemplo: Tipo de Refeição) */}
            <div className="filter-section bg-white/5 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-3">
              <div className="filter-section-header flex flex-col gap-1">
                <p className="m-0 text-[15px] font-semibold text-white">Tipo de Refeição</p>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Escolha o tipo de refeição</span>
              </div>
              <div className="chips-grid grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 justify-center">
                {['Café da Manhã', 'Almoço', 'Jantar', 'Lanche', 'Bebida', 'Sobremesa'].map((chip) => (
                  <label key={chip} className="chip-option relative w-full">
                    <input
                      type="checkbox"
                      value={chip}
                      checked={activeFilter === chip}
                      onChange={() => setActiveFilter(activeFilter === chip ? '' : chip)}
                      className="absolute inset-0 opacity-0 pointer-events-none peer"
                    />
                    <span className="flex items-center justify-center py-2.5 px-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white h-[42px] w-full text-center leading-tight transition-all duration-200 ease-in-out box-border peer-checked:bg-gradient-to-r peer-checked:from-orange-400 peer-checked:to-orange-600 peer-checked:border-none peer-checked:text-white">
                      {chip}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {/* Adicione mais seções de filtro aqui */}
          </div>

          <div
            className="modal-actions py-[18px] px-4 pb-28 border-t border-white/10 bg-gray-900/95 flex items-center gap-2.5 mt-auto"
            style={{paddingBottom: 'calc(18px + 70px + env(safe-area-inset-bottom, 0px))'}}
          >
            <button
              className="btn-secondary rounded-lg h-[46px] text-base font-semibold cursor-pointer transition-all duration-200 ease-in-out flex-1 min-w-0 bg-white/10 text-white hover:bg-white/15"
              onClick={handleClearFilters}
            >
              Limpar Filtros
            </button>
            <button
              className="btn-primary rounded-lg h-[46px] text-base font-semibold cursor-pointer transition-all duration-200 ease-in-out flex-1 min-w-0 bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:brightness-105"
              onClick={handleApplyFilters}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

