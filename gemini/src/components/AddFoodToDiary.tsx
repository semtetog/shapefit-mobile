import React, { useState, useEffect } from 'react';

export const AddFoodToDiary = ({ setView }: { setView: (view: string) => void }) => {
  const [activeTab, setActiveTab] = useState('foods'); // 'foods' or 'recipes'
  const [isRecipeModalVisible, setIsRecipeModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Or a specific recipe type
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingItems, setPendingItems] = useState([]); // Array of items to be added to diary

  const openRecipeModal = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsRecipeModalVisible(true);
  };

  const closeRecipeModal = () => {
    setIsRecipeModalVisible(false);
    setSelectedRecipe(null);
  };

  const handleAddToPending = (item: any) => {
    setPendingItems([...pendingItems, { ...item, quantity: 100, unit: 'g' }]); // Example initial values
    closeRecipeModal();
  };

  const handleRemovePendingItem = (index: number) => {
    setPendingItems(pendingItems.filter((_, i) => i !== index));
  };

  // Example data (replace with actual data fetching)
  const mockFoods = [
    { id: 1, name: 'Frango Grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { id: 2, name: 'Arroz Branco Cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    { id: 3, name: 'Brócolis Cozido', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 }
  ];

  const mockRecipes = [
    { id: 101, name: 'Salada de Frango com Abacate', imageUrl: 'https://placehold.co/600x400?text=Salada', calories: 350, protein: 30, carbs: 20, fat: 18 },
    { id: 102, name: 'Smoothie de Proteína e Frutas', imageUrl: 'https://placehold.co/600x400?text=Smoothie', calories: 280, protein: 25, carbs: 35, fat: 8 },
    { id: 103, name: 'Omelete de Legumes', imageUrl: 'https://placehold.co/600x400?text=Omelete', calories: 220, protein: 18, carbs: 10, fat: 14 }
  ];

  const filteredFoods = mockFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecipes = mockRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPendingCalories = pendingItems.reduce((sum, item) => sum + item.calories, 0);
  const totalPendingProtein = pendingItems.reduce((sum, item) => sum + item.protein, 0);
  const totalPendingCarbs = pendingItems.reduce((sum, item) => sum + item.carbs, 0);
  const totalPendingFat = pendingItems.reduce((sum, item) => sum + item.fat, 0);

  // TODO: Extract global config for BASE_APP_URL if necessary, or manage with environment variables in React.
  // All script tags and inline styles have been removed or converted to Tailwind CSS.

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5 font-montserrat">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div
            onClick={() => setView('Dashboard')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white transition-all duration-200 ease-in-out cursor-pointer hover:bg-white/10 hover:border-orange-500"
          >
            <i className="fas fa-chevron-left"></i>
          </div>
          <h1 className="text-2xl font-bold text-white m-0">Adicionar Refeição</h1>
          <div className="w-10"></div>
        </div>

        {/* Meal Setup */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mealType" className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Tipo de Refeição</label>
            <select id="mealType" className="appearance-none bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-sm transition-all duration-200 ease-in-out w-full box-border focus:outline-none focus:border-orange-500 focus:bg-white/10">
              <option value="breakfast">Café da Manhã</option>
              <option value="lunch">Almoço</option>
              <option value="dinner">Jantar</option>
              <option value="snack">Lanche</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mealDate" className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Data</label>
            <input type="date" id="mealDate" className="appearance-none bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-sm transition-all duration-200 ease-in-out w-full box-border focus:outline-none focus:border-orange-500 focus:bg-white/10" />
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('foods')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ease-in-out ${activeTab === 'foods' ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-orange-500'}`}
            >
              Alimentos
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ease-in-out ${activeTab === 'recipes' ? 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:border-orange-500'}`}
            >
              Receitas
            </button>
          </div>

          <div className="relative flex gap-2.5 mb-3">
            <input
              type="text"
              placeholder="Buscar alimentos ou receitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 appearance-none bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-sm transition-all duration-200 ease-in-out focus:outline-none focus:border-orange-500 focus:bg-white/10"
            />
            <button className="bg-orange-500 border-none rounded-xl px-4 py-2.5 text-white text-sm font-semibold cursor-pointer transition-all duration-200 ease-in-out min-w-[60px] hover:bg-orange-600 hover:-translate-y-0.5">
              <i className="fas fa-search"></i>
            </button>
          </div>

          <div className="mt-3 max-h-[300px] overflow-y-auto rounded-xl bg-white/5 border border-white/10">
            {activeTab === 'foods' && filteredFoods.length > 0 ? (
              filteredFoods.map(food => (
                <div key={food.id} onClick={() => handleAddToPending(food)} className="flex items-center gap-3 p-3 border-b border-white/5 cursor-pointer transition-all duration-200 ease-in-out last:border-b-0 hover:bg-white/10">
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-green-500 text-white">Alimento</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-0.5">{food.name}</p>
                    <p className="text-[11px] text-gray-400 m-0">{food.calories} kcal • P: {food.protein}g C: {food.carbs}g G: {food.fat}g</p>
                  </div>
                </div>
              ))
            ) : activeTab === 'foods' && searchTerm.length > 0 ? (
              <p className="text-center text-sm text-gray-400 p-4">Nenhum alimento encontrado.</p>
            ) : activeTab === 'recipes' && filteredRecipes.length > 0 ? (
                filteredRecipes.map(recipe => (
                    <div key={recipe.id} onClick={() => openRecipeModal(recipe)} className="flex items-center gap-3 p-3 border-b border-white/5 cursor-pointer transition-all duration-200 ease-in-out last:border-b-0 hover:bg-white/10">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-orange-500 text-white">Receita</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white mb-0.5">{recipe.name}</p>
                            <p className="text-[11px] text-gray-400 m-0">{recipe.calories} kcal • P: {recipe.protein}g C: {recipe.carbs}g G: {recipe.fat}g</p>
                        </div>
                    </div>
                ))
            ) : activeTab === 'recipes' && searchTerm.length > 0 ? (
                <p className="text-center text-sm text-gray-400 p-4">Nenhuma receita encontrada.</p>
            ) : (
                <p className="text-center text-sm text-gray-400 p-4">Comece a digitar para buscar.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => setView('CreateCustomFood')}
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-4 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all duration-200 ease-in-out text-center sm:text-left hover:bg-white/10 hover:border-orange-500 hover:-translate-y-0.5"
            >
              <i className="fas fa-utensils text-2xl text-orange-500 sm:text-xl"></i>
              <span className="text-sm font-medium leading-tight">Criar Alimento Customizado</span>
            </button>
            <button
              onClick={() => setView('CreateCustomRecipe')}
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-4 sm:px-4 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all duration-200 ease-in-out text-center sm:text-left hover:bg-white/10 hover:border-orange-500 hover:-translate-y-0.5"
            >
              <i className="fas fa-book-open text-2xl text-orange-500 sm:text-xl"></i>
              <span className="text-sm font-medium leading-tight">Criar Receita Customizada</span>
            </button>
          </div>
        </div>

        {/* Pending Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 flex flex-col gap-3">
          <div className="flex items-center justify-start gap-3">
            <h2 className="text-base font-semibold text-white m-0">Itens para Adicionar</h2>
            {pendingItems.length > 0 && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-none bg-orange-500 text-white font-semibold text-sm cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed hover:bg-orange-600 hover:-translate-y-0.5"
                disabled={pendingItems.length === 0}
              >
                <i className="fas fa-check"></i> Salvar Todos
              </button>
            )}
          </div>

          {pendingItems.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                {pendingItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_auto] items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>{item.quantity} {item.unit}</span>
                        <span>{item.calories} kcal</span>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span>P: {item.protein}g</span>
                        <span>C: {item.carbs}g</span>
                        <span>G: {item.fat}g</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePendingItem(index)}
                      className="bg-transparent border border-white/20 rounded-lg w-9 h-9 flex items-center justify-center text-white/70 cursor-pointer transition-all duration-200 ease-in-out hover:border-orange-500/60 hover:text-white"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-white/10 pt-2 mt-1">
                <span>Total Calorias: {totalPendingCalories} kcal</span>
                <span>Total P: {totalPendingProtein}g</span>
                <span>Total C: {totalPendingCarbs}g</span>
                <span>Total G: {totalPendingFat}g</span>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  className="w-full justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-none bg-orange-500 text-white font-semibold text-sm cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed hover:bg-orange-600 hover:-translate-y-0.5"
                  disabled={pendingItems.length === 0}
                >
                  <i className="fas fa-save"></i> Salvar no Diário
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-gray-400 p-5 rounded-xl border border-dashed border-white/10 bg-white/5">
              Nenhum alimento ou receita adicionado para a refeição ainda.
            </div>
          )}
        </div>

        {/* Recipes Section - Example of a separate section, could be combined with search results */}
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white mb-3 pb-2 border-b border-white/10">Receitas Populares</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mockRecipes.map(recipe => (
              <div key={recipe.id} onClick={() => openRecipeModal(recipe)} className="bg-white/5 border border-white/10 rounded-2xl p-3 cursor-pointer transition-all duration-200 ease-in-out text-inherit hover:bg-white/10 hover:border-orange-500 hover:-translate-y-0.5">
                <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1 leading-tight">{recipe.name}</h3>
                <p className="text-[11px] text-gray-400 m-0">P: {recipe.protein}g C: {recipe.carbs}g G: {recipe.fat}g</p>
                <p className="text-xs text-orange-500 font-semibold mt-1">{recipe.calories} kcal</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recipe Modal */}
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] transition-all duration-300 ease-in-out ${isRecipeModalVisible ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
          <div className={`fixed top-1/2 left-1/2 w-[calc(100%-40px)] max-w-md max-h-[calc(100vh-40px)] bg-gray-900 rounded-3xl border border-white/10 shadow-2xl flex flex-col transition-all duration-300 ease-out ${isRecipeModalVisible ? 'transform -translate-x-1/2 -translate-y-1/2 scale-100' : 'transform -translate-x-1/2 -translate-y-1/2 scale-90'}`} tabIndex={-1}>
            <div className="p-4 pb-3 text-center border-b border-white/10 relative flex-shrink-0">
              <div className="w-9 h-1 bg-white/30 rounded-full mx-auto mb-3"></div>
              <h2 className="text-xl font-semibold text-white m-0 p-0">{selectedRecipe?.name || 'Detalhes da Receita'}</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto overscroll-contain min-h-0 max-h-[calc(100vh-200px)]">
              {selectedRecipe && (
                <>
                  <img src={selectedRecipe.imageUrl} alt={selectedRecipe.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                  <div className="mb-2">
                    <span className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Porção</span>
                    <input type="number" value="100" className="appearance-none w-full block bg-white/5 border border-white/10 rounded-xl p-3 text-white text-base font-medium transition-all duration-200 ease-in-out box-border focus:outline-none focus:border-orange-500 focus:bg-white/10" />
                  </div>
                  <div className="mb-2">
                    <span className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">Quantidade e Unidade</span>
                    <div className="flex gap-2 items-center w-full">
                      <input type="number" value="1" className="w-[70px] flex-shrink-0 appearance-none bg-white/5 border border-white/10 rounded-xl py-3 px-2 text-white text-base font-medium transition-all duration-200 ease-in-out box-border text-center focus:outline-none focus:border-orange-500 focus:bg-white/10" />
                      <select className="flex-grow appearance-none bg-white/5 border border-white/10 rounded-xl p-3 text-white text-base font-medium transition-all duration-200 ease-in-out w-full box-border focus:outline-none focus:border-orange-500 focus:bg-white/10">
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="un">unidade</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-4">Calorias: {selectedRecipe.calories} kcal</p>
                  <p className="text-sm text-gray-300">Proteína: {selectedRecipe.protein}g</p>
                  <p className="text-sm text-gray-300">Carboidratos: {selectedRecipe.carbs}g</p>
                  <p className="text-sm text-gray-300">Gorduras: {selectedRecipe.fat}g</p>
                </>
              )}
            </div>
            <div className="p-4 border-t border-white/10 flex gap-3 flex-shrink-0">
              <button onClick={closeRecipeModal} className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-semibold transition-all duration-200 ease-in-out hover:bg-white/20">Fechar</button>
              <button onClick={() => handleAddToPending(selectedRecipe)} className="flex-1 py-3 px-4 rounded-xl bg-orange-500 text-white font-semibold transition-all duration-200 ease-in-out hover:bg-orange-600">Adicionar ao Diário</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
