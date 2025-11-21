import React, { useEffect, useRef, useState } from 'react';

export const DiaryLogic = ({ setView }: { setView: (view: string) => void }) => {
  const dateRef = useRef<HTMLSpanElement>(null);
  const [currentDate, setCurrentDate] = useState('');

  // Helper function for date formatting
  const getLocalDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Initialize the current date to today's date when the component mounts
    const today = getLocalDateString();
    setCurrentDate(today);

    // TODO: If the date should be initialized from a prop or a specific source,
    // adjust this logic. Currently, it defaults to today's date.

  }, []); // Empty dependency array means this effect runs once on mount

  const handleAddMealFromHeader = () => {
    // Original JS logic redirected to add_food_to_diary.html with current date.
    // We use setView to navigate to the corresponding React component/view.
    // If the 'AddFoodToDiary' view needs the date, the setView prop's signature
    // would need to be updated to accept parameters (e.g., setView("AddFoodToDiary", { date: currentDate }))
    setView("AddFoodToDiary");
    console.log(`Navigating to AddFoodToDiary for date: ${currentDate}`); // For debugging/context
  };

  const handleAddMealFromShortcut = () => {
    // Original JS logic redirected to add_food_to_diary.html with today's date.
    // We use setView to navigate to the corresponding React component/view.
    setView("AddFoodToDiary");
    console.log(`Navigating to AddFoodToDiary for date: ${getLocalDateString()}`); // For debugging/context
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Meu Diário</h1>
        <div className="flex items-center space-x-3">
          <span id="current-diary-date" ref={dateRef} data-date={currentDate} className="text-lg font-medium text-gray-700">
            {currentDate}
          </span>
          <button
            id="add-meal-diary-btn"
            onClick={handleAddMealFromHeader}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
          >
            Adicionar Refeição
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 mb-4">Conteúdo do diário para a data selecionada. (Exemplo de placeholder)</p>
          {/* Placeholder for actual diary entries */} 
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="font-semibold text-gray-800">Café da Manhã</h3>
              <p className="text-sm text-gray-500">200g Aveia, 1 Banana, 50g Whey Protein</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="font-semibold text-gray-800">Almoço</h3>
              <p className="text-sm text-gray-500">300g Frango Grelhado, Arroz Integral, Salada Mista</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="font-semibold text-gray-800">Jantar</h3>
              <p className="text-sm text-gray-500">250g Peixe Assado, Brócolis Cozido</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */} 
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 flex justify-around items-center z-10">
        <button
          onClick={() => setView("Dashboard")}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none p-2 rounded-md transition duration-150 ease-in-out"
        >
          <span className="text-2xl">🏠</span>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          onClick={() => setView("Reports")}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none p-2 rounded-md transition duration-150 ease-in-out"
        >
          <span className="text-2xl">📊</span>
          <span className="text-xs mt-1">Relatórios</span>
        </button>
        <button
          id="add-meal-shortcut-bottom-nav"
          onClick={handleAddMealFromShortcut}
          className="flex flex-col items-center text-white bg-blue-600 rounded-full p-4 shadow-xl hover:bg-blue-700 focus:outline-none transform -translate-y-4 transition duration-150 ease-in-out scale-105 hover:scale-110"
        >
          <span className="text-3xl font-light">+</span>
        </button>
        <button
          onClick={() => setView("Achievements")}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none p-2 rounded-md transition duration-150 ease-in-out"
        >
          <span className="text-2xl">🏆</span>
          <span className="text-xs mt-1">Conquistas</span>
        </button>
        <button
          onClick={() => setView("Settings")}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none p-2 rounded-md transition duration-150 ease-in-out"
        >
          <span className="text-2xl">⚙️</span>
          <span className="text-xs mt-1">Configurações</span>
        </button>
      </footer>
    </div>
  );
};
