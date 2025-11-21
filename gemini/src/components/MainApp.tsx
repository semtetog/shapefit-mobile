import React, { useEffect, useState, useRef } from 'react';

interface MainAppProps {
  setView: (view: string) => void;
}

// --- Utility to apply custom CSS variables for Tailwind approximation ---
// In a real project, these would be defined in tailwind.config.js or a global CSS file.
const CustomCSSVariables = `
  .var-surface-color { background-color: #2D3748; } /* gray-800 */
  .var-border-color { border-color: #4A5568; } /* gray-700 */
  .var-text-primary { color: #F7FAFC; } /* gray-100 */
  .var-text-secondary { color: #A0AEC0; } /* gray-400 */
  .var-accent-orange { color: #F56565; } /* red-500, approximating orange */
  .var-accent-orange-bg { background-color: #F56565; } /* red-500, approximating orange */
  .var-glass-border { border-color: rgba(255,255,255,0.1); } /* Light transparent white */
  .var-glass-bg-05 { background-color: rgba(255,255,255,0.05); }
  .var-glass-bg-06 { background-color: rgba(255,255,255,0.06); }
  .var-glass-bg-12 { background-color: rgba(255,255,255,0.12); }
  .var-primary-orange-gradient { background-image: linear-gradient(to right, #F6AD55, #ED8936); } /* orange-400 to orange-600 */

  /* Animations for water drop (simplified, ideally via Tailwind plugins) */
  @keyframes wave-animation {
    0% { transform: translateX(0); }
    50% { transform: translateX(-100px); }
    100% { transform: translateX(0); }
  }
  @keyframes wave-animation-2 {
    0% { transform: translateX(0); }
    50% { transform: translateX(100px); }
    100% { transform: translateX(0); }
  }
  .animate-wave-1 { animation: wave-animation 8s linear infinite; }
  .animate-wave-2 { animation: wave-animation-2 10s linear infinite alternate; }
  .transition-water-level { transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1); }

  /* Base styles for PWA-like behavior */
  html, body { min-height: 100vh; }
  body { -webkit-user-select: none; -ms-user-select: none; user-select: none; -webkit-touch-callout: none; overflow-x: hidden; }
  .checkin-modal-open { overflow: hidden; }
  a, button, .btn, [role="button"] { -webkit-touch-callout: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }

  /* Lottie container */
  .lottie-animation-container { width: 100%; height: 100%; }
`;

export const MainApp = ({ setView }: MainAppProps) => {
  const [currentWeight, setCurrentWeight] = useState('75.2'); // Exemplo de estado
  const [waterAmount, setWaterAmount] = useState(250); // Valor em ml
  const [currentWaterInput, setCurrentWaterInput] = useState('');
  const [currentUnit, setCurrentUnit] = useState('ml');
  const waterLevelRef = useRef<SVGGElement>(null);
  const waterPercentage = 0.6; // Exemplo: 60% de água preenchida

  useEffect(() => {
    // Helper function to convert CSS variables to Tailwind classes or inline styles
    // For this exercise, we are assuming direct Tailwind classes or helper classes defined above.

    // Critical Scripts Logic (Viewport Height, Keyboard Offset, Touchmove prevention)
    const setRealViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const updateKeyboardOffset = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const offset = Math.max(0, window.innerHeight - viewportHeight);
        document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      const checkinModal = document.getElementById('checkinModal');
      const isModalOpen = checkinModal && checkinModal.classList.contains('active');

      if (isModalOpen) {
        const insideMessages = (event.target as HTMLElement).closest('#checkinMessages');
        if (insideMessages) return;
        const insideModal = (event.target as HTMLElement).closest('#checkinModal');
        if (insideModal) {
          event.preventDefault();
          return;
        }
      }
      const scrollable = (event.target as HTMLElement).closest('.app-container, .container');
      if (!scrollable) {
        event.preventDefault();
      }
    };

    setRealViewportHeight();
    window.addEventListener('resize', setRealViewportHeight);
    window.addEventListener('orientationchange', () => setTimeout(setRealViewportHeight, 100));

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateKeyboardOffset);
      window.visualViewport.addEventListener('scroll', updateKeyboardOffset);
      window.addEventListener('orientationchange', updateKeyboardOffset);
      updateKeyboardOffset();
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Lottie.js (placeholder for potential future integration)
    // if (window.lottie) {
    //   const animationContainer = document.getElementById('lottieAnimationContainer');
    //   if (animationContainer) {
    //     window.lottie.loadAnimation({
    //       container: animationContainer,
    //       renderer: 'svg',
    //       loop: true,
    //       autoplay: true,
    //       path: '/path/to/animation.json' // TODO: Replace with actual Lottie JSON path
    //     });
    //   }
    // }

    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener('resize', setRealViewportHeight);
      window.removeEventListener('orientationchange', () => setTimeout(setRealViewportHeight, 100));
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateKeyboardOffset);
        window.visualViewport.removeEventListener('scroll', updateKeyboardOffset);
        window.removeEventListener('orientationchange', updateKeyboardOffset);
      }
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Update water level in SVG based on percentage
  useEffect(() => {
    if (waterLevelRef.current) {
      // Assuming total height for water is 160 units (SVG internal scale)
      // and 0% is at y=160, 100% is at y=0. Current SVG is inverted.
      // 'full' at Y=160 (bottom of rect), 'empty' at Y=0 (top of rect)
      // viewBox="0 0 160 160"
      // water-level-mask (rect id="full-water") height is 160
      // So, to move from 0 to 160px from bottom: transform translateY(X)
      // Original HTML moves Y coordinate of group based on total height 160px and percentage.
      // translateY(160 * (1 - waterPercentage)) - this pushes it down to correct level
      // But because the mask clipPath is inverted, we need to push it from the top.
      // Current SVG structure is actually simpler: move the water-level-group up or down.
      // It has a base transform `translateY(160)`. So we want to move it up `160 * waterPercentage`.
      // New transform: `translateY(160 - (160 * waterPercentage))`
      const newY = 160 - (160 * waterPercentage);
      waterLevelRef.current.style.transform = `translateY(${newY}px)`;
    }
  }, [waterPercentage]);

  const handleAddWater = (amount: number) => {
    // This is just a placeholder, logic for updating daily intake would go here
    console.log(`Adicionando ${amount}${currentUnit}`);
  };

  return (
    <div className="app-container relative min-h-screen bg-gray-900 font-sans text-gray-100 flex flex-col pt-safe pb-safe">
      <style dangerouslySetInnerHTML={{ __html: CustomCSSVariables }} />

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 md:px-6 md:py-8 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <header className="flex justify-end items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('Points')}
              className="flex items-center gap-2 h-11 px-4 rounded-full bg-gray-800 border border-gray-700 text-gray-100 no-underline transition-all duration-200 ease-in-out hover:border-orange-500"
            >
              <i className="fas fa-trophy text-orange-500 text-base"></i>
              <span className="font-semibold text-base">1200</span>
            </button>
            <button
              onClick={() => setView('Profile')}
              className="flex items-center justify-center w-11 h-11 rounded-full border border-gray-700 bg-gray-800 overflow-hidden transition-colors duration-200 ease-in-out hover:border-orange-500"
            >
              <img
                src="https://placehold.co/600x400?text=Profile"
                alt="Profile Image"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-safe-bottom">
          {/* Card: Peso Corporal */}
          <div className="relative flex flex-col justify-center items-center text-center gap-1 p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800/60 border border-gray-700 shadow-lg">
            <span className="text-sm text-gray-400">Peso Corporal</span>
            <strong className="text-4xl leading-tight text-gray-100">{currentWeight}kg</strong>
            <button
              onClick={() => console.log('Editar Peso')}
              className="absolute top-4 right-4 bg-transparent border-none text-gray-400 cursor-pointer p-1 transition-colors duration-200 ease-in-out hover:text-orange-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
            </button>
          </div>

          {/* Card: Hidratação */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800/60 border border-gray-700 shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_160px] items-center gap-5 sm:gap-3">
              <div className="flex flex-col min-w-0 items-center text-center sm:items-start sm:text-left">
                <h3 className="m-0 mb-2 sm:mb-2 text-lg text-gray-100">Hidratação</h3>
                <p className="text-2xl font-semibold text-gray-100 mb-4">
                  {waterAmount}ml <span className="text-base text-gray-400">de 2000ml</span>
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                    <div className="inline-flex items-center gap-2 flex-nowrap w-full sm:w-auto">
                      <input
                        type="number"
                        placeholder="Ex: 300"
                        value={currentWaterInput}
                        onChange={(e) => setCurrentWaterInput(e.target.value)}
                        className="w-full sm:w-[120px] p-3.5 sm:p-3 rounded-2xl border var-glass-border var-glass-bg-05 text-gray-100 font-semibold text-center placeholder:text-gray-400/35 focus:outline-none focus:border-orange-500"
                      />
                      <div className="relative inline-block min-w-[78px]">
                        <select
                          value={currentUnit}
                          onChange={(e) => setCurrentUnit(e.target.value)}
                          className="p-2.5 pr-8 sm:py-2.5 sm:pl-3 sm:pr-8 rounded-2xl border var-glass-border var-glass-bg-05 text-gray-100 font-bold uppercase w-full min-w-[78px] appearance-none cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none focus:border-orange-500"
                        >
                          <option value="ml">ml</option>
                          <option value="oz">oz</option>
                        </select>
                        <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-100 text-xs opacity-80 transition-opacity duration-200 ease-in-out"></i>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddWater(parseInt(currentWaterInput) || 0)}
                      disabled={!currentWaterInput}
                      className="w-16 h-16 rounded-full border var-glass-border var-glass-bg-06 text-gray-100 text-3xl font-bold flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out hover:var-glass-bg-12 hover:border-gray-500 disabled:opacity-50 disabled:cursor-default disabled:grayscale"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-1">
                    {[250, 500, 750].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAddWater(amount)}
                        className="px-3 py-2 rounded-full border var-glass-border var-glass-bg-06 text-gray-100 font-semibold cursor-pointer transition-all duration-200 ease-in-out hover:var-glass-bg-12 hover:border-gray-500"
                      >
                        +{amount} {currentUnit}
                      </button>
                    ))}
                  </div>
                  <div className="w-full h-px var-glass-border mt-1 opacity-60" />
                  <button
                    onClick={() => setView('Checkin')}
                    className="w-full p-3 sm:p-3 rounded-2xl border var-glass-border var-glass-bg-06 text-gray-100 font-bold cursor-pointer text-center"
                  >
                    Check-in Completo
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center justify-self-center w-[160px] h-[160px] sm:justify-self-end order-[-1] sm:order-none">
                {/* Animated Water Drop SVG */}
                <svg
                  id="animated-water-drop"
                  width="160" height="160"
                  viewBox="0 0 160 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="water-shadow-filter" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="rgba(0, 191, 255, 0.4)" floodOpacity="1"/>
                      <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="rgba(255, 255, 255, 0.2)" floodOpacity="1"/>
                    </filter>
                    <clipPath id="water-level-mask">
                      <rect id="full-water" x="0" y="0" width="160" height="160" />
                    </clipPath>
                  </defs>

                  {/* Outer drop shape (static) */}
                  <path
                    d="M80 0C48 0 20 28 20 60C20 100 80 160 80 160C80 160 140 100 140 60C140 28 112 0 80 0Z"
                    className="fill-blue-500/20 stroke-blue-300 stroke-[1px]"
                    style={{ filter: 'url(#water-shadow-filter)' }}
                  />

                  {/* Water level, masked and animated */}
                  <g
                    id="water-level-group"
                    clipPath="url(#water-level-mask)"
                    transform="translateY(160)" // Base position: completely empty
                    ref={waterLevelRef}
                    className="transition-water-level"
                  >
                    {/* Water waves */}
                    <path
                      id="wave1"
                      d="M0 100C33.3333 80 66.6667 80 100 100C133.333 120 166.667 120 200 100V160H0V100Z"
                      className="fill-blue-500/60 animate-wave-1"
                      transform="translateY(-60)" // Adjust to base of the group
                    />
                    <path
                      id="wave2"
                      d="M0 100C33.3333 120 66.6667 120 100 100C133.333 80 166.667 80 200 100V160H0V100Z"
                      className="fill-blue-500 animate-wave-2"
                      transform="translateY(-60)" // Adjust to base of the group
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Card: Lottie Animation (Placeholder) */}
          <div className="grid-cols-1 p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800/60 border border-gray-700 shadow-lg">
            <div id="lottieAnimationContainer" className="lottie-animation-container flex items-center justify-center text-gray-400">
              <p>Lottie Animation Placeholder</p>
              {/* TODO: Integrate React Lottie player or lottie-web for actual animation */}
            </div>
          </div>

          {/* Cards de Ação */} 
          <button
            onClick={() => setView('Meals')}
            className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800/60 border border-gray-700 shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl hover:shadow-orange-500/15"
          >
            <div className="flex items-stretch justify-end flex-shrink-0 w-14 h-14 rounded-2xl bg-gray-800/60 transition-all duration-300 ease-in-out group-hover:bg-orange-500">
              <i className="fas fa-utensils text-2xl text-orange-500 flex items-center p-2"></i>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-100">Minhas Refeições</h4>
              <p className="text-sm text-gray-400">Registre suas refeições diárias.</p>
            </div>
          </button>

          <button
            onClick={() => setView('Missions')}
            className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800/60 border border-gray-700 shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl hover:shadow-orange-500/15"
          >
            <div className="flex items-stretch justify-end flex-shrink-0 w-14 h-14 rounded-2xl bg-orange-500 transition-all duration-300 ease-in-out">
              <i className="fas fa-star text-2xl text-white flex items-center p-2"></i>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-100">Missões</h4>
              <p className="text-sm text-gray-400">Complete missões para ganhar pontos.</p>
            </div>
          </button>

          <button
            onClick={() => setView('Challenges')}
            className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800/60 border border-gray-700 shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl hover:shadow-orange-500/15"
          >
            <div className="flex items-stretch justify-end flex-shrink-0 w-14 h-14 rounded-2xl bg-gray-800/60 transition-all duration-300 ease-in-out group-hover:bg-orange-500">
              <i className="fas fa-fist-raised text-2xl text-orange-500 flex items-center p-2"></i>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-100">Desafios</h4>
              <p className="text-sm text-gray-400">Supere limites e alcance seus objetivos.</p>
            </div>
          </button>

          <button
            onClick={() => setView('Suggestions')}
            className="flex items-center gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-800/60 border border-gray-700 shadow-lg cursor-pointer transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl hover:shadow-orange-500/15"
          >
            <div className="flex items-stretch justify-end flex-shrink-0 w-14 h-14 rounded-2xl bg-gray-800/60 transition-all duration-300 ease-in-out group-hover:bg-orange-500">
              <i className="fas fa-lightbulb text-2xl text-orange-500 flex items-center p-2"></i>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-100">Sugestões</h4>
              <p className="text-sm text-gray-400">Dicas e conselhos para sua jornada.</p>
            </div>
          </button>

          {/* Example of other cards that would fit grid-column: 1 / -1 */}
          {/* <div className="grid-cols-1 p-6 rounded-2xl bg-gray-800 border border-gray-700 shadow-lg"></div> */}
        </main>
      </div>
    </div>
  );
};
