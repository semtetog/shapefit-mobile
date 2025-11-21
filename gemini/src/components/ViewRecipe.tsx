import React, { useEffect } from 'react';

export const ViewRecipe = ({ setView }: { setView: (view: string) => void }) => {
    useEffect(() => {
        const setRealViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setRealViewportHeight();
        window.addEventListener('resize', setRealViewportHeight);

        const orientationChangeHandler = () => {
            setTimeout(setRealViewportHeight, 100);
        };
        window.addEventListener('orientationchange', orientationChangeHandler);

        const handleTouchMove = (event: TouchEvent) => {
            const scrollable = (event.target as HTMLElement).closest('.app-container, .container');
            if (!scrollable) {
                event.preventDefault();
            }
        };
        document.addEventListener('touchmove', handleTouchMove, { passive: false });

        // TODO: The original HTML had global scripts (www-config.js, common.js, auth.js) and
        // global helper functions (getLocalDateString, addDaysLocal, BASE_APP_URL).
        // In a React app, these would typically be imported modules or context providers.
        // If specific logic from these scripts needs to be used within this component,
        // it should be extracted and managed via React state/props/hooks.
        // For this conversion, only browser-level DOM manipulation scripts are handled here.

        return () => {
            window.removeEventListener('resize', setRealViewportHeight);
            window.removeEventListener('orientationchange', orientationChangeHandler);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <div className="fixed-background"></div>
            <div className="app-container max-w-2xl mx-auto py-4">
                <div className="flex justify-between items-center mb-5">
                    <button
                        onClick={() => setView("RecipeList")}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white transition-all duration-200 hover:bg-white/10 hover:translate-x-[-2px] focus:outline-none focus:ring-2 focus:ring-white/20"
                        aria-label="Voltar"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                        id="favorite-btn"
                        onClick={() => console.log('Toggle favorite')}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-200 cursor-pointer hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500 favorite-toggle-btn"
                        aria-label="Favoritar receita"
                    >
                        <i className="far fa-heart"></i>
                    </button>
                </div>

                <img id="recipe-image" src="https://placehold.co/600x400?text=Imagem" alt="" className="w-full h-72 object-cover rounded-2xl mb-5" />

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5 transition-all duration-200 overflow-hidden break-words box-border hover:bg-white/10">
                    <h1 id="recipe-name" className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight break-words max-w-full overflow-hidden">Nome da Receita</h1>
                    <p id="recipe-description" className="text-base text-gray-400 leading-relaxed mb-4 break-words max-w-full overflow-hidden" style={{ display: 'none' }}>
                        Uma descrição curta e apetitosa da receita, destacando seus principais sabores e características.
                    </p>
                    <div id="category-tags" className="flex flex-wrap gap-2 mt-0" style={{ display: 'none' }}>
                        <div className="inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 transition-all duration-200 cursor-default pointer-events-none">Categoria 1</div>
                        <div className="inline-block px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 transition-all duration-200 cursor-default pointer-events-none">Categoria 2</div>
                    </div>
                </div>

                <div id="recipe-macros" className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center transition-all duration-200 hover:bg-white/10">
                    <div className="flex flex-col gap-1">
                        <span id="macro-kcal" className="text-xl font-bold text-white">350</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Kcal</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span id="macro-carbs" className="text-xl font-bold text-white">45g</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Carbo</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span id="macro-fat" className="text-xl font-bold text-white">12g</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Gordura</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span id="macro-protein" className="text-xl font-bold text-white">25g</span>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Proteína</span>
                    </div>
                    <p id="serving-info" className="col-span-full text-xs text-gray-400 mt-3 text-center">Porção: 1 Pessoa</p>
                </div>

                <div id="timing-servings" className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 flex flex-col sm:flex-row justify-between items-center sm:text-left text-center gap-3 sm:gap-0 transition-all duration-200 hover:bg-white/10">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <i className="fas fa-clock text-orange-500 w-4"></i>
                        <span>30 min de preparo</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <i className="fas fa-users text-orange-500 w-4"></i>
                        <span>2 porções</span>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5 transition-all duration-200 hover:bg-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4 relative pl-7 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-orange-500 before:rounded-sm">
                        Ingredientes
                    </h2>
                    <ul className="list-none p-0 m-0">
                        <li className="py-3 border-b border-white/10 text-gray-400 text-base leading-snug relative pl-5 before:content-['•'] before:absolute before:left-0 before:top-3 before:text-orange-500">200g de peito de frango</li>
                        <li className="py-3 border-b border-white/10 text-gray-400 text-base leading-snug relative pl-5 before:content-['•'] before:absolute before:left-0 before:top-3 before:text-orange-500">1 xícara de arroz integral</li>
                        <li className="py-3 border-b border-white/10 text-gray-400 text-base leading-snug relative pl-5 before:content-['•'] before:absolute before:left-0 before:top-3 before:text-orange-500">1 brócolis pequeno</li>
                        <li className="py-3 border-b border-white/10 text-gray-400 text-base leading-snug relative pl-5 before:content-['•'] before:absolute before:left-0 before:top-3 before:text-orange-500">Sal, pimenta e temperos a gosto</li>
                        <li className="py-3 text-gray-400 text-base leading-snug relative pl-5 before:content-['•'] before:absolute before:left-0 before:top-3 before:text-orange-500 last:border-b-0">Azeite de oliva</li>
                    </ul>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5 transition-all duration-200 hover:bg-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4 relative pl-7 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-orange-500 before:rounded-sm">
                        Modo de Preparo
                    </h2>
                    <div className="flex gap-4 mb-5 p-4 bg-white/5 rounded-xl border-l-4 border-orange-500">
                        <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">1</div>
                        <p className="text-gray-400 leading-relaxed m-0">Cozinhe o arroz integral conforme as instruções da embalagem.</p>
                    </div>
                    <div className="flex gap-4 mb-5 p-4 bg-white/5 rounded-xl border-l-4 border-orange-500">
                        <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">2</div>
                        <p className="text-gray-400 leading-relaxed m-0">Grelhe o peito de frango temperado com sal e pimenta até dourar.</p>
                    </div>
                    <div className="flex gap-4 mb-5 p-4 bg-white/5 rounded-xl border-l-4 border-orange-500">
                        <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">3</div>
                        <p className="text-gray-400 leading-relaxed m-0">Cozinhe o brócolis no vapor até ficar al dente.</p>
                    </div>
                    <div className="flex gap-4 p-4 bg-white/5 rounded-xl border-l-4 border-orange-500">
                        <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">4</div>
                        <p className="text-gray-400 leading-relaxed m-0">Sirva o frango com arroz e brócolis. Regue com azeite.</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5 transition-all duration-200 hover:bg-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4 relative pl-7 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-orange-500 before:rounded-sm">
                        Observações
                    </h2>
                    <p className="text-gray-400 leading-relaxed">Esta receita é ótima para uma refeição saudável e rápida. Pode ser adaptada com outros vegetais de sua preferência.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5 transition-all duration-200 hover:bg-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4 text-center">Registrar Refeição</h2>
                    <div className="form-group mb-5">
                        <label htmlFor="mealDate" className="block text-sm font-medium text-white mb-2">Data</label>
                        <input type="date" id="mealDate" className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-orange-500 focus:bg-white/10" />
                    </div>
                    <div className="form-group mb-5">
                        <label htmlFor="mealType" className="block text-sm font-medium text-white mb-2">Tipo de Refeição</label>
                        <select id="mealType" className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-base transition-all duration-200 box-border focus:outline-none focus:border-orange-500 focus:bg-white/10">
                            <option value="breakfast">Café da Manhã</option>
                            <option value="lunch">Almoço</option>
                            <option value="dinner">Jantar</option>
                            <option value="snack">Lanche</option>
                        </select>
                    </div>
                    <button
                        onClick={() => console.log('Registrar Refeição')}
                        className="w-full h-13 bg-orange-500 border-none rounded-2xl text-white text-base font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <i className="fas fa-plus"></i> Registrar
                    </button>
                </div>
            </div>
        </div>
    );
};
