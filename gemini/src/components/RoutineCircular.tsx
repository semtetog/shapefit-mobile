import React, { useState, useEffect, useMemo } from 'react';

export const RoutineCircular = ({ setView }: { setView: (view: string) => void }) => {
    // State variables, initialized with some dummy data to make it runnable.
    // In a real application, these might be loaded from props, an API, or a context.
    const [totalMissions, setTotalMissions] = useState(5);
    const [completedMissions, setCompletedMissions] = useState(2);
    const [missionQueue, setMissionQueue] = useState<any[]>([
        { id: '1', title: 'Completar Tarefa A', icon_class: 'fa-check' },
        { id: '2', title: 'Completar Tarefa B', icon_class: 'fa-star' },
        { id: '3', title: 'Completar Tarefa C', icon_class: 'fa-lightbulb' }
    ]);
    const [csrfToken, setCsrfToken] = useState('some-csrf-token'); // Placeholder

    // Constants for the SVG circle based on its 'r' attribute in JSX
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    // Derived state for calculations
    const percentage = useMemo(() => {
        return totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
    }, [completedMissions, totalMissions]);

    // Calculate strokeDashoffset for SVG progress
    const strokeDashoffset = useMemo(() => {
        let percent = percentage;
        if (isNaN(percent) || percent < 0) percent = 0;
        if (percent > 100) percent = 100;
        return circumference - (percent / 100) * circumference;
    }, [percentage, circumference]);

    // Current mission details, derived from missionQueue
    const currentMission = missionQueue.length > 0 ? missionQueue[0] : null;
    const missionIconClass = currentMission ? `fas ${currentMission.icon_class || 'fa-tasks'}` : 'fas fa-trophy';
    const missionTitleText = currentMission ? currentMission.title : 'Você completou tudo!';
    const showCompleteButton = missionQueue.length > 0;

    // Handler for completing a mission
    const handleCompleteMission = async () => {
        if (!currentMission || !currentMission.id) return;

        const routineId = currentMission.id;

        // Optimistic UI update
        setCompletedMissions(prev => prev + 1);
        // Create a new array for missionQueue to trigger re-render
        setMissionQueue(prev => prev.slice(1)); 

        const formData = new FormData();
        formData.append('routine_id', routineId);
        formData.append('status', '1'); // Convert to string for FormData
        formData.append('csrf_token', csrfToken);

        try {
            const response = await fetch('api/update_routine_status.php', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.status === 'success') {
                // TODO: Handle external functions if needed, currently commented out
                // if (typeof window.updateUserPointsDisplay === 'function') {
                //     window.updateUserPointsDisplay(data.new_total_points);
                // }
                // if (typeof window.showSinglePopup === 'function' && data.points_awarded > 0) {
                //     window.showSinglePopup(data.points_awarded);
                // }
            } else {
                console.error("Falha ao atualizar missão:", data.message);
                // Revert UI on error
                setCompletedMissions(prev => prev - 1);
                setMissionQueue(prev => [currentMission, ...prev]); // Re-add mission
            }
        } catch (error) {
            console.error("Erro na requisição fetch:", error);
            // Revert UI on network error
            setCompletedMissions(prev => prev - 1);
            setMissionQueue(prev => [currentMission, ...prev]); // Re-add mission
        }
    };

    // Initial load/mount effect (simulating DOMContentLoaded data read)
    useEffect(() => {
        // In a real scenario, you might fetch initial data here or get it from props.
        // For this example, initial state is hardcoded. If this component were mounted
        // within an element with data-attributes, you would parse them here.
        // Example:
        // const cardElement = document.getElementById('routine-circular-card');
        // if (cardElement) {
        //     setTotalMissions(parseInt(cardElement.dataset.totalMissions || '0', 10));
        //     setCompletedMissions(parseInt(cardElement.dataset.completedMissions || '0', 10));
        //     setMissionQueue(JSON.parse(cardElement.dataset.missionsQueue || '[]'));
        //     setCsrfToken(cardElement.dataset.csrfToken || '');
        // }
    }, []); // Run once on mount

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-xl card-routine-circular">
            {/* Progress Ring */}
            <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                        className="progress-ring__circle stroke-current text-gray-200"
                        strokeWidth="10"
                        fill="transparent"
                        r="50"
                        cx="60"
                        cy="60"
                    />
                    <circle
                        className="progress-ring__progress stroke-current text-blue-500 transition-all duration-500 ease-in-out"
                        strokeWidth="10"
                        fill="transparent"
                        r="50"
                        cx="60"
                        cy="60"
                        style={{
                            strokeDasharray: `${circumference} ${circumference}`,
                            strokeDashoffset: strokeDashoffset,
                            strokeLinecap: 'round'
                        }}
                    />
                </svg>
                <span id="completed-count" className="absolute text-4xl font-bold text-gray-800">
                    {completedMissions}
                </span>
            </div>

            {/* Mission Details */}
            <div className="text-center mb-6">
                <i id="mission-icon" className={`${missionIconClass} text-4xl text-blue-600 mb-2`}></i>
                <h3 id="mission-title" className="text-xl font-semibold text-gray-800">
                    {missionTitleText}
                </h3>
            </div>

            {/* Complete Mission Button */}
            {showCompleteButton ? (
                <button
                    onClick={handleCompleteMission}
                    className="complete-mission-btn-circular px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300"
                >
                    Completar Missão
                </button>
            ) : (
                <div
                    onClick={() => setView("Dashboard")}
                    className="cursor-pointer px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition duration-300"
                >
                    Ver Dashboard
                </div>
            )}
            
            {/* Example navigation button */}
            <button 
                onClick={() => setView("AnotherRoutine")}
                className="mt-4 text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:underline"
            >
                Ver Outra Rotina
            </button>
        </div>
    );
};