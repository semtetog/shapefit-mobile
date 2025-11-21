import React, { useState, useEffect } from 'react';

export const DashboardLogic = ({ setView }: { setView: (view: string) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Controls logical open/close state
    const [isModalVisible, setIsModalVisible] = useState(false); // Controls CSS visibility (opacity/display) for mounting/unmounting
    const [isModalAnimating, setIsModalAnimating] = useState(false); // Controls animation classes for transitions

    // --- Modal Open Logic --- 
    const openModal = () => {
        setIsModalOpen(true);
        setIsModalVisible(true); // Start rendering the modal to the DOM
        // Small delay to allow the element to be mounted before adding 'active' classes for the transition
        setTimeout(() => {
            setIsModalAnimating(true); // Trigger the fade-in and scale-in animation
        }, 10);
    };

    // --- Modal Close Logic --- 
    const closeModal = () => {
        setIsModalAnimating(false); // Remove 'active' classes to trigger the fade-out and scale-out transition
        // Wait for the transition duration before unmounting the modal from the DOM
        setTimeout(() => {
            setIsModalVisible(false); // Stop rendering the modal
            setIsModalOpen(false); // Reset logical state
        }, 300); // 300ms matches Tailwind's transition duration
    };

    // --- Escape Key Listener for closing the modal --- 
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isModalOpen) { // Check logical state of the modal
                closeModal();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        // Cleanup the event listener when the component unmounts or modal's logical state changes
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isModalOpen]); // Re-run effect if isModalOpen changes

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Bem-vindo ao Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Card 1: Navigate to another page */}
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Minhas Metas</h2>
                    <p className="text-gray-600 mb-4">Gerencie e visualize suas metas de produtividade e desenvolvimento.</p>
                    <button
                        onClick={() => setView("GoalOverview")}
                        className="mt-auto px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                    >
                        Ver Metas
                    </button>
                </div>

                {/* Card 2: Open the help modal */}
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Precisa de Ajuda?</h2>
                    <p className="text-gray-600 mb-4">Encontre respostas para suas dúvidas sobre o uso da plataforma.</p>
                    <button
                        id="open-help-modal-btn" // ID kept for reference, not strictly necessary for React functionality
                        onClick={openModal}
                        className="mt-auto px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                    >
                        Abrir Ajuda
                    </button>
                </div>

                {/* Card 3: Navigate to another page (Example) */}
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start">
                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Configurações da Conta</h2>
                    <p className="text-gray-600 mb-4">Ajuste suas preferências e informações pessoais.</p>
                    <button
                        onClick={() => setView("AccountSettings")}
                        className="mt-auto px-5 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                    >
                        Configurações
                    </button>
                </div>
            </div>

            {/* Goal Help Modal (Conditionally rendered based on isModalVisible state) */}
            {isModalVisible && (
                <div
                    id="goal-help-modal" // ID kept for reference
                    // Overlay classes: transition opacity and backdrop blur
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ease-out ${isModalAnimating ? 'bg-opacity-60 backdrop-blur-sm opacity-100' : 'bg-opacity-0 opacity-0'}`}
                    onClick={(event) => {
                        // Close if clicked directly on the overlay or an element with data-action="close-modal"
                        const target = event.target as HTMLElement;
                        if (target.id === "goal-help-modal" || target.closest('[data-action="close-modal"]')) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        // Modal content classes: transition all properties (scale, opacity, etc.)
                        className={`bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-auto relative transform transition-all duration-300 ease-out ${isModalAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal content from closing it
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ajuda com suas Metas</h2>
                        <p className="text-gray-700 text-base mb-6">
                            Aqui você pode aprender como configurar suas metas, monitorar seu progresso e otimizar seu desempenho.
                            Aproveite ao máximo a plataforma com estas dicas e truques!
                        </p>
                        <img
                            src="https://placehold.co/600x400?text=Imagem+de+Ajuda+para+Metas" // Placeholder image for relative paths
                            alt="Ilustração de ajuda para metas"
                            className="w-full h-auto rounded-lg mb-6 shadow-sm"
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                data-action="close-modal" // Attribute to identify close actions, mirroring original JS
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200 ease-in-out"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={() => {
                                    closeModal(); // Ensure modal closes before navigation
                                    setView("DetalhesDaMeta"); // Example of navigation after closing modal
                                }}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                            >
                                Ir para Detalhes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
