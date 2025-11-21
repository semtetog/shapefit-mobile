import React, { useState, useEffect } from 'react';

export const Routine = ({ setView }: { setView: (view: string) => void }) => {
    // State for modals
    const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
    const [isExerciseDurationModalOpen, setIsExerciseDurationModalOpen] = useState(false);
    const [selectedRoutineItem, setSelectedRoutineItem] = useState<any>(null); // To store which item the modal refers to

    // Mock data for routine items and progress, as the original HTML is static
    const [progress, setProgress] = useState(70); // Example progress
    const [dailyRoutines, setDailyRoutines] = useState([
        { id: 'sleep', text: 'Dormir', duration: '8h', isCompleted: false, type: 'sleep' },
        { id: 'exercise', text: 'Treino de Força (Peito e Tríceps)', duration: '60 min', isCompleted: false, type: 'exercise' },
        { id: 'meal', text: 'Café da manhã (Ovos e Aveia)', duration: null, isCompleted: true, type: 'meal' },
        { id: 'meditation', text: 'Meditar', duration: '15 min', isCompleted: false, type: 'exercise' }
    ]);
    const [upcomingRoutines, setUpcomingRoutines] = useState([
        { id: 'work', text: 'Trabalho Focado', duration: '3h', isCompleted: false, type: 'exercise' },
        { id: 'read', text: 'Ler 30 páginas', duration: '30 min', isCompleted: false, type: 'exercise' }
    ]);

    // Handle completion/uncompletion of routine items
    const toggleComplete = (id: string, listType: 'daily' | 'upcoming') => {
        const list = listType === 'daily' ? dailyRoutines : upcomingRoutines;
        const setList = listType === 'daily' ? setDailyRoutines : setUpcomingRoutines;

        setList(list.map(item => 
            item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
        ));
    };

    const handleDurationClick = (item: any) => {
        setSelectedRoutineItem(item);
        if (item.type === 'sleep') {
            setIsSleepModalOpen(true);
        } else if (item.type === 'exercise') { // Assuming other types use exercise duration modal
            setIsExerciseDurationModalOpen(true);
        }
    };

    // Script Critical: setRealViewportHeight
    useEffect(() => {
        const setRealViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setRealViewportHeight();
        window.addEventListener('resize', setRealViewportHeight);
        window.addEventListener('orientationchange', () => setTimeout(setRealViewportHeight, 100)); // Maintain original delay

        return () => {
            window.removeEventListener('resize', setRealViewportHeight);
            window.removeEventListener('orientationchange', () => setTimeout(setRealViewportHeight, 100)); // Cleanup
        };
    }, []);

    // Placeholder for global variables from script tags.
    // window.BASE_APP_URL would be handled globally or passed as context/prop if needed.
    // For this component, it's not directly used in the render.
    // auth.js and common.js logic would be in custom hooks or services.

    return (
        <div className="min-h-screen bg-[#1A1A2E] text-white font-['Montserrat'] relative pb-24">
            <div className="max-w-[600px] mx-auto">
                {/* Page Header */}
                <header className="pt-[calc(env(safe-area-inset-top,0px)+20px)] px-6 pb-5 flex justify-between items-center">
                    <button
                        type="button"
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-gray-400 hover:bg-white/20 transition-all duration-200"
                        onClick={() => setView("Profile")} // Assuming there's a Profile page
                        aria-label="Voltar para Perfil"
                    >
                        <i className="fas fa-chevron-left text-lg"></i>
                    </button>
                    <h1 className="text-4xl font-bold text-white m-0">Sua Rotina</h1>
                    <button
                        type="button"
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-gray-400 hover:bg-white/20 transition-all duration-200"
                        onClick={() => setView("Settings")} // Assuming there's a Settings page
                        aria-label="Abrir Configurações"
                    >
                        <i className="fas fa-ellipsis-v text-lg"></i>
                    </button>
                </header>

                {/* Main Content Wrapper */}
                <div className="flex flex-col gap-6 px-6 pb-[calc(env(safe-area-inset-bottom,0px)+100px)]">
                    {/* Card de Progresso */}
                    <div className="bg-[#2A2A4A] rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-semibold text-white">Progresso Diário</p>
                            <span className="text-sm font-semibold text-white">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-md overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-md transition-all duration-500 ease"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Rotina do Dia */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Rotina do Dia</h2>
                        {dailyRoutines.length > 0 ? (
                            <ul className="list-none p-0 m-0 flex flex-col gap-3">
                                {dailyRoutines.map((item) => (
                                    <li key={item.id} className={`bg-white/5 rounded-xl p-3 md:p-4 flex flex-col items-start justify-between transition-all duration-400 ease ${item.isCompleted ? 'opacity-70' : ''}`}>
                                        <div className="w-full flex justify-between items-center">
                                            <p className={`m-0 text-base font-medium flex-grow text-left ${item.isCompleted ? 'line-through' : ''}`}>{item.text}</p>
                                            <div className="flex items-center gap-2.5">
                                                {item.isCompleted ? (
                                                    <button
                                                        type="button"
                                                        className="action-btn uncomplete-btn bg-red-500/20 text-red-500 hover:bg-red-500/40"
                                                        onClick={() => toggleComplete(item.id, 'daily')}
                                                        aria-label="Desmarcar como concluído"
                                                    >
                                                        <i className="fas fa-undo"></i>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="action-btn skip-btn bg-white/10 text-gray-400 hover:bg-white/20"
                                                            onClick={() => alert(`Item "${item.text}" pulado!`)} // Placeholder for skip logic
                                                            aria-label="Pular item"
                                                        >
                                                            <i className="fas fa-ellipsis-h"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="action-btn complete-btn bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:brightness-110"
                                                            onClick={() => toggleComplete(item.id, 'daily')}
                                                            aria-label="Marcar como concluído"
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {item.duration && (
                                            <div className="text-sm text-gray-400 font-medium mt-1 ml-0 flex items-center gap-1.5 transition-all duration-300 ease">
                                                <i className="fas fa-hourglass-half"></i>
                                                <span>{item.duration}</span>
                                                {(item.type === 'sleep' || item.type === 'exercise') && !item.isCompleted && (
                                                    <button
                                                        type="button"
                                                        className={`action-btn duration-btn ${item.type === 'sleep' ? 'sleep-btn bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 focus:outline-none focus:shadow-none' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 focus:outline-none focus:shadow-none'} w-6 h-6 text-xs`} // Smaller button for duration edit
                                                        onClick={() => handleDurationClick(item)}
                                                        aria-label="Ajustar duração"
                                                    >
                                                        <i className="fas fa-pen"></i>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="bg-[#2A2A4A] rounded-2xl placeholder-card text-center p-6 opacity-70">
                                <i className="fas fa-check-circle text-5xl text-green-500 mb-3"></i>
                                <p className="m-0 text-base font-semibold">Uhuul! Todas as rotinas concluídas!</p>
                            </div>
                        )}
                    </section>

                    {/* Rotinas Próximas */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Rotinas Próximas</h2>
                        {upcomingRoutines.length > 0 ? (
                            <ul className="list-none p-0 m-0 flex flex-col gap-3">
                                {upcomingRoutines.map((item) => (
                                    <li key={item.id} className={`bg-white/5 rounded-xl p-3 md:p-4 flex flex-col items-start justify-between transition-all duration-400 ease ${item.isCompleted ? 'opacity-70' : ''}`}>
                                        <div className="w-full flex justify-between items-center">
                                            <p className={`m-0 text-base font-medium flex-grow text-left ${item.isCompleted ? 'line-through' : ''}`}>{item.text}</p>
                                            <div className="flex items-center gap-2.5">
                                                {item.isCompleted ? (
                                                    <button
                                                        type="button"
                                                        className="action-btn uncomplete-btn bg-red-500/20 text-red-500 hover:bg-red-500/40"
                                                        onClick={() => toggleComplete(item.id, 'upcoming')}
                                                        aria-label="Desmarcar como concluído"
                                                    >
                                                        <i className="fas fa-undo"></i>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="action-btn skip-btn bg-white/10 text-gray-400 hover:bg-white/20"
                                                            onClick={() => alert(`Item "${item.text}" pulado!`)} // Placeholder for skip logic
                                                            aria-label="Pular item"
                                                        >
                                                            <i className="fas fa-ellipsis-h"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="action-btn complete-btn bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:brightness-110"
                                                            onClick={() => toggleComplete(item.id, 'upcoming')}
                                                            aria-label="Marcar como concluído"
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {item.duration && (
                                            <div className="text-sm text-gray-400 font-medium mt-1 ml-0 flex items-center gap-1.5 transition-all duration-300 ease">
                                                <i className="fas fa-hourglass-half"></i>
                                                <span>{item.duration}</span>
                                                {(item.type === 'sleep' || item.type === 'exercise') && !item.isCompleted && (
                                                    <button
                                                        type="button"
                                                        className={`action-btn duration-btn ${item.type === 'sleep' ? 'sleep-btn bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 focus:outline-none focus:shadow-none' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 focus:outline-none focus:shadow-none'} w-6 h-6 text-xs`} // Smaller button for duration edit
                                                        onClick={() => handleDurationClick(item)}
                                                        aria-label="Ajustar duração"
                                                    >
                                                        <i className="fas fa-pen"></i>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="bg-[#2A2A4A] rounded-2xl placeholder-card text-center p-6 opacity-70">
                                <i className="fas fa-clipboard-check text-5xl text-blue-500 mb-3"></i>
                                <p className="m-0 text-base font-semibold">Nenhuma rotina próxima por enquanto!</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Modals */}
            {/* Sleep Modal */}
            <div className={`modal-overlay fixed top-0 left-0 w-screen h-screen bg-black/80 flex items-center justify-center z-[99999] p-5 box-border overflow-x-hidden overflow-y-auto invisible opacity-0 transition-opacity duration-300 ease ${isSleepModalOpen ? 'modal-visible visible opacity-100 transition-delay-0' : ''}`}>
                <div className="modal-content bg-[#2A2A4A] rounded-2xl p-6 w-full max-w-sm max-h-[calc(100vh-40px)] overflow-y-auto border border-gray-700 shadow-xl relative z-[100000] box-border m-0 overflow-x-visible">
                    <h2 className="m-0 mb-5 text-white text-xl text-center">Definir Horário de Sono</h2>
                    <div className="modal-body">
                        <div className="form-group mb-5">
                            <label htmlFor="sleepTime" className="block mb-2 text-white font-semibold">Horário para dormir</label>
                            <input
                                type="time"
                                id="sleepTime"
                                className="time-input w-full px-5 py-4 rounded-xl border-2 border-gray-700 bg-[#1A1A2E] text-white text-xl font-semibold text-center cursor-pointer transition-all duration-300 ease appearance-none focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.2)]"
                                defaultValue="22:00"
                            />
                        </div>
                        <div className="form-group mb-5">
                            <label htmlFor="wakeTime" className="block mb-2 text-white font-semibold">Horário para acordar</label>
                            <input
                                type="time"
                                id="wakeTime"
                                className="time-input w-full px-5 py-4 rounded-xl border-2 border-gray-700 bg-[#1A1A2E] text-white text-xl font-semibold text-center cursor-pointer transition-all duration-300 ease appearance-none focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.2)]"
                                defaultValue="06:00"
                            />
                        </div>
                    </div>
                    <div className="modal-actions flex flex-col gap-2.5 justify-center mt-6">
                        <button
                            type="button"
                            className="primary-button bg-orange-500 text-white py-3.5 px-6 rounded-lg font-semibold border-none cursor-pointer transition-all duration-300 ease text-base w-full box-border hover:bg-orange-600"
                            onClick={() => setIsSleepModalOpen(false)} // Placeholder for save logic
                        >
                            Salvar Horário
                        </button>
                        <button
                            type="button"
                            className="primary-button secondary-button bg-[#2A2A4A] text-white border border-gray-700 py-3.5 px-6 rounded-lg font-semibold cursor-pointer transition-all duration-300 ease text-base w-full box-border hover:bg-gray-700"
                            onClick={() => setIsSleepModalOpen(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* Exercise Duration Modal */}
            <div className={`modal-overlay fixed top-0 left-0 w-screen h-screen bg-black/80 flex items-center justify-center z-[99999] p-5 box-border overflow-x-hidden overflow-y-auto invisible opacity-0 transition-opacity duration-300 ease ${isExerciseDurationModalOpen ? 'modal-visible visible opacity-100 transition-delay-0' : ''}`}>
                <div className="modal-content bg-[#2A2A4A] rounded-2xl p-6 w-full max-w-sm max-h-[calc(100vh-40px)] overflow-y-auto border border-gray-700 shadow-xl relative z-[100000] box-border m-0 overflow-x-visible">
                    <h2 className="m-0 mb-5 text-white text-xl text-center">Ajustar Duração</h2>
                    <div className="modal-body">
                        <p className="block mb-2 text-white font-semibold">
                            Duração para <span className="text-orange-400">{selectedRoutineItem?.text}</span>
                        </p>
                        <div className="duration-input-group flex items-center gap-3 mt-2">
                            <input
                                type="number"
                                id="exerciseDuration"
                                className="flex-1 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white text-base font-semibold box-border focus:outline-none focus:border-orange-500"
                                placeholder="e.g., 60"
                                defaultValue={selectedRoutineItem?.duration ? parseInt(selectedRoutineItem.duration.split(' ')[0]) : ''}
                            />
                            <span className="duration-unit text-gray-400 text-sm font-medium min-w-[60px]">Minutos</span>
                        </div>
                        <span className="form-help text-gray-400 text-xs mt-1 block">
                            Defina a duração em minutos para este item da rotina.
                        </span>
                    </div>
                    <div className="modal-actions flex flex-col gap-2.5 justify-center mt-6">
                        <button
                            type="button"
                            className="primary-button bg-orange-500 text-white py-3.5 px-6 rounded-lg font-semibold border-none cursor-pointer transition-all duration-300 ease text-base w-full box-border hover:bg-orange-600"
                            onClick={() => setIsExerciseDurationModalOpen(false)} // Placeholder for save logic
                        >
                            Salvar Duração
                        </button>
                        <button
                            type="button"
                            className="primary-button secondary-button bg-[#2A2A4A] text-white border border-gray-700 py-3.5 px-6 rounded-lg font-semibold cursor-pointer transition-all duration-300 ease text-base w-full box-border hover:bg-gray-700"
                            onClick={() => setIsExerciseDurationModalOpen(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};