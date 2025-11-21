import React, { useState, useEffect } from 'react';

// Assume these are available globally or from a context/utility file
// TODO: Replace with actual authentication and API call methods suitable for your React app.
// For demonstration, these are mocked.
const authenticatedFetch = async (url: string) => {
    console.warn("Using mock authenticatedFetch. Implement real API call.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500)); 
    if (url.includes('get_more_options_data.php')) {
        return {
            ok: true,
            text: () => Promise.resolve(JSON.stringify({
                success: true,
                data: {
                    first_name: 'Usuário ShapeFIT',
                    // Uncomment the line below to test with a placeholder image
                    // profile_image_url: 'https://placehold.co/64x64/orange/white?text=SF'
                    profile_image_url: null // Test without image
                }
            }))
        };
    }
    return { ok: false, status: 404, text: () => Promise.resolve('Not Found') };
};

const clearAuthToken = () => {
    console.warn("Using mock clearAuthToken. Implement real token clearing.");
    localStorage.removeItem('shapefit_auth_token');
};

const requireAuth = async () => {
    console.warn("Using mock requireAuth. Implement real auth check.");
    // Mock: always return true for now. In a real app, this would redirect if not authenticated.
    return true;
};

export const MoreOptions = ({ setView }: { setView: (view: string) => void }) => {
    const [profileName, setProfileName] = useState<string>('Carregando...');
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadMoreOptionsData = async () => {
            try {
                const authCheck = await requireAuth();
                if (!authCheck) {
                    // requireAuth should handle redirection if not authenticated
                    return;
                }

                const response = await authenticatedFetch(`${import.meta.env.VITE_BASE_APP_URL || ''}/api/get_more_options_data.php`);

                if (!response) {
                    return; // Token inválido, já redirecionou
                }

                if (!response.ok) {
                    const text = await response.text();
                    console.error('Erro HTTP:', response.status, text);
                    throw new Error(`Erro ao carregar dados: ${response.status}`);
                }

                const text = await response.text();
                if (!text || text.trim() === '') {
                    throw new Error('Resposta vazia do servidor');
                }

                let result;
                try {
                    result = JSON.parse(text);
                } catch (parseError) {
                    console.error('Erro ao parsear JSON:', parseError);
                    console.error('Texto recebido:', text);
                    throw new Error('Resposta inválida do servidor');
                }

                if (!result.success) {
                    throw new Error(result.message || 'Erro ao carregar dados');
                }

                const data = result.data;
                setProfileName(data.first_name);
                setProfileImageUrl(data.profile_image_url);

            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                // Optionally set a default name or handle error state
                setProfileName('Usuário');
                setProfileImageUrl(null); // Ensure placeholder if error
            }
        };

        loadMoreOptionsData();
    }, []);

    const handleLogout = () => {
        clearAuthToken();
        setView("AuthLogin"); // Navigate to login page. Adjust "AuthLogin" to your actual login route/view name.
    };

    return (
        <div className="app-container min-h-screen bg-gray-900 text-white font-montserrat">
            <section className="settings-page-grid flex flex-col gap-5 px-1.5 py-5 md:px-2">
                {/* Card de perfil */}
                <button
                    id="profile-card"
                    className="profile-card flex items-center p-4 md:p-5 bg-white bg-opacity-3 border border-white border-opacity-5 rounded-2xl text-white transition-all duration-300 ease-in-out mb-6 shadow-lg backdrop-blur-md hover:bg-orange-600 hover:bg-opacity-10 hover:border-orange-500 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    onClick={() => setView("EditProfile")}
                >
                    <div id="profile-image-container">
                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt="Foto de Perfil"
                                className="profile-picture w-14 h-14 md:w-16 md:h-16 rounded-full object-cover mr-4 border-[3px] border-orange-500"
                                onError={(e) => {
                                    // Fallback to placeholder on image load error
                                    e.currentTarget.onerror = null; // Prevent infinite loop
                                    setProfileImageUrl(null);
                                }}
                            />
                        ) : (
                            <div className="profile-icon-placeholder flex items-center justify-center bg-white bg-opacity-5 border-[3px] border-orange-500 mr-4 w-14 h-14 md:w-16 md:h-16 rounded-full">
                                <i className="fas fa-user text-orange-500 text-2xl"></i>
                            </div>
                        )}
                    </div>
                    <div className="profile-info flex-1 flex flex-col gap-1">
                        <h2 className="profile-name text-xl md:text-2xl font-bold text-white m-0">
                            {profileName}
                        </h2>
                        <p className="profile-action text-sm text-gray-400 m-0">Ver e editar perfil</p>
                    </div>
                    <i className="fas fa-chevron-right arrow-icon text-orange-500 text-xl"></i>
                </button>

                {/* Grade de opções principais */}
                <div className="glass-card bg-white bg-opacity-3 backdrop-blur-md border border-white border-opacity-5 rounded-2xl p-5 md:p-6 mb-5 shadow-lg">
                    <h3 className="section-title text-xl font-semibold text-white mt-0 mb-5 text-center uppercase tracking-wider">
                        Principais
                    </h3>
                    <div className="options-grid grid grid-cols-2 gap-4 mb-6">
                        <button
                            className="option-card group flex flex-col items-center justify-center px-3 py-5 md:px-4 md:py-6 bg-white bg-opacity-3 border border-white border-opacity-5 rounded-2xl text-white transition-all duration-300 ease-in-out text-center shadow-lg backdrop-blur-md min-h-[100px] md:min-h-[120px] hover:bg-orange-600 hover:bg-opacity-10 hover:border-orange-500 hover:translate-y-[-4px] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                            onClick={() => setView("Dashboard")}
                        >
                            <i
                                className="fas fa-bullseye option-icon text-3xl md:text-4xl mb-3 text-orange-500 transition-transform duration-300 ease-in-out group-hover:scale-110"
                            ></i>
                            <span className="option-label text-sm md:text-base font-semibold text-white m-0">
                                Minha meta
                            </span>
                        </button>
                        <button
                            className="option-card group flex flex-col items-center justify-center px-3 py-5 md:px-4 md:py-6 bg-white bg-opacity-3 border border-white border-opacity-5 rounded-2xl text-white transition-all duration-300 ease-in-out text-center shadow-lg backdrop-blur-md min-h-[100px] md:min-h-[120px] hover:bg-blue-600 hover:bg-opacity-10 hover:border-blue-500 hover:translate-y-[-4px] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            onClick={() => setView("Content")}
                        >
                            <i
                                className="fas fa-file-alt option-icon text-3xl md:text-4xl mb-3 text-blue-500 transition-transform duration-300 ease-in-out group-hover:scale-110"
                            ></i>
                            <span className="option-label text-sm md:text-base font-semibold text-white m-0">
                                Conteúdos
                            </span>
                        </button>
                        <button
                            className="option-card group flex flex-col items-center justify-center px-3 py-5 md:px-4 md:py-6 bg-white bg-opacity-3 border border-white border-opacity-5 rounded-2xl text-white transition-all duration-300 ease-in-out text-center shadow-lg backdrop-blur-md min-h-[100px] md:min-h-[120px] hover:bg-green-600 hover:bg-opacity-10 hover:border-green-500 hover:translate-y-[-4px] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                            onClick={() => setView("Routine")}
                        >
                            <i
                                className="fas fa-tasks option-icon text-3xl md:text-4xl mb-3 text-green-500 transition-transform duration-300 ease-in-out group-hover:scale-110"
                            ></i>
                            <span className="option-label text-sm md:text-base font-semibold text-white m-0">
                                Rotina
                            </span>
                        </button>
                        <button
                            className="option-card group flex flex-col items-center justify-center px-3 py-5 md:px-4 md:py-6 bg-white bg-opacity-3 border border-white border-opacity-5 rounded-2xl text-white transition-all duration-300 ease-in-out text-center shadow-lg backdrop-blur-md min-h-[100px] md:min-h-[120px] hover:bg-yellow-600 hover:bg-opacity-10 hover:border-yellow-500 hover:translate-y-[-4px] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                            onClick={() => setView("Ranking")}
                        >
                            <i
                                className="fas fa-trophy option-icon text-3xl md:text-4xl mb-3 text-yellow-500 transition-transform duration-300 ease-in-out group-hover:scale-110"
                            ></i>
                            <span className="option-label text-sm md:text-base font-semibold text-white m-0">
                                Ranking
                            </span>
                        </button>
                    </div>
                </div>

                {/* Lista de opções secundárias */}
                <div className="glass-card bg-white bg-opacity-3 backdrop-blur-md border border-white border-opacity-5 rounded-2xl p-5 md:p-6 mb-5 shadow-lg">
                    <h3 className="section-title text-xl font-semibold text-white mt-0 mb-5 text-center uppercase tracking-wider">
                        Outros
                    </h3>
                    <ul className="options-list list-none p-0 m-0">
                        <li>
                            <button
                                className="option-item group flex items-center px-5 py-4 bg-white bg-opacity-2 border border-white border-opacity-3 rounded-xl text-white transition-all duration-200 ease-in-out mb-2 relative overflow-hidden w-full text-left hover:bg-white hover:bg-opacity-8 hover:border-orange-600 hover:border-opacity-20 hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                                onClick={() => setView("FavoriteRecipes")}
                            >
                                <i
                                    className="fas fa-heart list-icon text-xl mr-4 w-6 text-center text-red-500 transition-transform duration-200 ease-in-out group-hover:scale-110"
                                ></i>
                                <span className="flex-1 text-base font-medium m-0">Meus Favoritos</span>
                                <i className="fas fa-chevron-right arrow-icon-list text-gray-400 text-sm transition-transform duration-200 ease-in-out group-hover:translate-x-1"></i>
                            </button>
                        </li>
                        <li>
                            <button
                                className="option-item group flex items-center px-5 py-4 bg-white bg-opacity-2 border border-white border-opacity-3 rounded-xl text-white transition-all duration-200 ease-in-out mb-2 relative overflow-hidden w-full text-left hover:bg-white hover:bg-opacity-8 hover:border-orange-600 hover:border-opacity-20 hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                                onClick={() => setView("MeasurementsProgress")}
                            >
                                <i
                                    className="fas fa-camera list-icon text-xl mr-4 w-6 text-center text-purple-500 transition-transform duration-200 ease-in-out group-hover:scale-110"
                                ></i>
                                <span className="flex-1 text-base font-medium m-0">Fotos e Medidas</span>
                                <i className="fas fa-chevron-right arrow-icon-list text-gray-400 text-sm transition-transform duration-200 ease-in-out group-hover:translate-x-1"></i>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Opções de conta */}
                <div className="glass-card bg-white bg-opacity-3 backdrop-blur-md border border-white border-opacity-5 rounded-2xl p-5 md:p-6 mb-5 shadow-lg">
                    <h3 className="section-title text-xl font-semibold text-white mt-0 mb-5 text-center uppercase tracking-wider">
                        Conta
                    </h3>
                    <ul className="options-list list-none p-0 m-0">
                        <li>
                            <button
                                id="logout-btn"
                                className="option-item group logout-link flex items-center px-5 py-4 bg-red-700 bg-opacity-10 border-red-700 border-opacity-20 rounded-xl text-white transition-all duration-200 ease-in-out mb-2 relative overflow-hidden w-full text-left hover:bg-red-700 hover:bg-opacity-20 hover:border-red-500 hover:translate-y-[-1px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                onClick={handleLogout}
                            >
                                <i className="fas fa-sign-out-alt list-icon text-xl mr-4 w-6 text-center text-white transition-transform duration-200 ease-in-out group-hover:scale-110"></i>
                                <span className="flex-1 text-base font-medium m-0">Sair da Conta</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
};