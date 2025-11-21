import React, { useEffect } from 'react';

// TODO: Ensure VanillaTilt.js is loaded and available globally or imported.
// If using a module bundler, you might need to 'npm install vanilla-tilt'
// and then 'import VanillaTilt from 'vanilla-tilt';' at the top of your file.
// If it's a global script, ensure the script tag is in your public/index.html
// or loaded dynamically. For this example, we'll assume it's available globally.

export const MoreOptionsLogic = ({ setView }: { setView: (view: string) => void }) => {
  useEffect(() => {
    const tiltCards = document.querySelectorAll<HTMLElement>('.option-card');

    // @ts-ignore - Ignore TypeScript error if VanillaTilt is not explicitly typed globally
    if (typeof VanillaTilt !== 'undefined' && tiltCards.length > 0) {
      // @ts-ignore - Ignore TypeScript error if VanillaTilt is not explicitly typed globally
      VanillaTilt.init(tiltCards, {
        max: 8,
        speed: 600,
        perspective: 1500,
        glare: true,
        "max-glare": 0.15
      });
    } else if (tiltCards.length > 0) {
      console.error("VanillaTilt.js not found. Ensure it is loaded before this script.");
    }

    // Cleanup function: If VanillaTilt.init returns an instance that needs to be destroyed,
    // it would typically go here to prevent memory leaks, e.g., instance.destroy();
    // The original JS snippet does not provide such a mechanism, so we omit it for now.
  }, []); // Empty dependency array means this effect runs once after the initial render.

  const cardsData = [
    { id: '1', title: 'Opção do Dashboard', view: 'Dashboard', imageUrl: 'https://placehold.co/600x400?text=Dashboard' },
    { id: '2', title: 'Opção de Relatórios', view: 'Reports', imageUrl: 'https://placehold.co/600x400?text=Relatorios' },
    { id: '3', title: 'Opção de Configurações', view: 'Settings', imageUrl: 'https://placehold.co/600x400?text=Configuracoes' },
    { id: '4', title: 'Opção de Ajuda', view: 'Help', imageUrl: 'https://placehold.co/600x400?text=Ajuda' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Mais Opções</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {cardsData.map((card) => (
          <div
            key={card.id}
            className="option-card bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 flex flex-col items-center cursor-pointer"
            onClick={() => setView(card.view)}
            // Optional: Add data-tilt attributes for more declarative setup if VanillaTilt.init is not picking up elements dynamically
            // data-tilt data-tilt-max="8" data-tilt-speed="600" data-tilt-perspective="1500" data-tilt-glare="true" data-tilt-max-glare="0.15"
          >
            <img src={card.imageUrl} alt={card.title} className="w-full h-48 object-cover rounded-md mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">{card.title}</h2>
            <p className="text-gray-500 mt-2 text-center">Clique para ver mais detalhes sobre esta opção.</p>
          </div>
        ))}
      </div>
    </div>
  );
};