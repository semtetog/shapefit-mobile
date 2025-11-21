import React, { useState, useEffect, useCallback, useRef } from 'react';

export const ScriptJs = ({ setView }: { setView: (view: string) => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [waterCups, setWaterCups] = useState(0); // Initial value set in useEffect
  const waterGoal = 10; // Example goal
  const [currentWeight, setCurrentWeight] = useState(''); // Initial value set in useEffect
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [weightErrorMessage, setWeightErrorMessage] = useState('');
  const [appNotification, setAppNotification] = useState<{ message: string; type: string } | null>(null);
  const [pointsPopup, setPointsPopup] = useState<{ points: number; eventType: string } | null>(null);
  const [userTotalPoints, setUserTotalPoints] = useState<number | null>(null);

  const csrfToken = useRef<string | null>(null);
  const waterDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  interface Mission {
    id: string;
    text: string;
    completed: boolean;
  }
  const [missions, setMissions] = useState<Mission[]>([
    { id: '1', text: 'Beber 2 litros de água', completed: false },
    { id: '2', text: '30 minutos de exercício', completed: false },
    { id: '3', text: 'Refeição saudável', completed: false }
  ]);

  // Global Helper Functions (re-implemented as useCallback hooks)
  const showSinglePopup = useCallback((points: number, eventType = 'gain') => {
    if (points === 0) return;
    setPointsPopup({ points, eventType });
    setTimeout(() => setPointsPopup(null), 3000);
  }, []);

  const showAppNotification = useCallback((message: string, type = 'info') => {
    setAppNotification({ message, type });
    setTimeout(() => setAppNotification(null), 4000);
  }, []);

  const updateUserPointsDisplay = useCallback((newTotal: number) => {
    setUserTotalPoints(newTotal);
  }, []);

  // Initial Load & CSRF Token Setup (BLOCO 1 & CSRF from BLOCO 0)
  useEffect(() => {
    console.log('ShapeFit Master Script Loaded');
    // TODO: Dynamically fetch or pass CSRF token from context/meta tag
    csrfToken.current = 'mock_csrf_token_123';

    // Simulate loader fade out
    const loaderTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(loaderTimeout);
  }, []);

  // Simulate initial data fetch (water, weight, points)
  useEffect(() => {
    setWaterCups(3); // Example initial value
    setCurrentWeight('70.5'); // Example initial weight
    setUserTotalPoints(500); // Example initial points
  }, []);

  // BLOCO 0: Helper - Water amount update on server
  const updateWaterOnServer = useCallback(async (newAmount: number) => {
    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
    }
    waterDebounceTimerRef.current = setTimeout(async () => {
      try {
        // Mock API call simulation
        const response = await new Promise<{ success: boolean; points_awarded?: number; new_total_points?: number; message?: string }>(resolve => {
          setTimeout(() => {
            const points = newAmount % 2 === 0 ? 5 : 0; // Award points on even cups for example
            resolve({
              success: true,
              points_awarded: points,
              new_total_points: (userTotalPoints || 0) + points
            });
          }, 300);
        });

        // In a real app:
        // const response = await fetch('/api/update_water.php', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        //   body: `water_consumed=${newAmount}&csrf_token=${csrfToken.current}`
        // });
        // const result = await response.json();

        const result = response;
        if (result.success) {
          if (result.points_awarded !== undefined && result.points_awarded !== 0) {
            showSinglePopup(result.points_awarded, result.points_awarded > 0 ? 'gain' : 'loss');
          }
          if (result.new_total_points !== undefined) {
            updateUserPointsDisplay(result.new_total_points);
          }
        } else {
          showAppNotification(result.message || 'Erro ao salvar consumo de água.', 'error');
        }
      } catch (error) {
        showAppNotification('Erro de conexão ao atualizar água.', 'error');
      }
    }, 500);
  }, [csrfToken, showSinglePopup, showAppNotification, updateUserPointsDisplay, userTotalPoints]);

  const handleWaterChange = useCallback((change: number) => {
    setWaterCups(prev => {
      const newCups = Math.max(0, prev + change);
      updateWaterOnServer(newCups);
      return newCups;
    });
  }, [updateWaterOnServer]);

  // BLOCO 3: Banner Clicks (converted from window.handleBannerClick)
  const handleBannerClick = useCallback((bannerNumber: number) => {
    switch (bannerNumber) {
      case 1: setView('ExploreRecipes'); break;
      case 2: return; // No functionality
      case 3: setView('RoutinePage'); break;
      case 4: setView('ProgressPage'); break;
      default: break;
    }
  }, [setView]);

  // BLOCO 2: Lógica da Rotina (Missões)
  const handleCompleteMission = useCallback(async (missionId: string) => {
    const missionIndex = missions.findIndex(m => m.id === missionId);
    if (missionIndex === -1 || missions[missionIndex].completed) return;

    // Optimistic UI update
    const prevMissions = missions; // Store current state for potential rollback
    const updatedMissions = missions.map(m =>
      m.id === missionId ? { ...m, completed: true } : m
    );
    setMissions(updatedMissions);

    try {
      // Mock API call simulation
      const response = await new Promise<{ success: boolean; points_awarded?: number; new_total_points?: number; message?: string }>(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            points_awarded: 20, // Example points
            new_total_points: (userTotalPoints || 0) + 20
          });
        }, 300);
      });

      // In a real app:
      // const response = await fetch('/api/update_routine_status.php', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: `routine_id=${missionId}&status=1&csrf_token=${csrfToken.current}`
      // });
      // const result = await response.json();

      const result = response;
      if (result.success) {
        if (result.points_awarded !== undefined && result.points_awarded > 0) {
          showSinglePopup(result.points_awarded, 'gain');
          if (result.new_total_points !== undefined) {
            updateUserPointsDisplay(result.new_total_points);
          }
        }
        // Mission item will animate out due to conditional class.
        // If actual removal from list is desired, uncomment:
        // setTimeout(() => setMissions(missions.filter(m => m.id !== missionId)), 500);
      } else {
        throw new Error(result.message || 'Erro ao atualizar missão.');
      }
    } catch (error: any) {
      showAppNotification(error.message || 'Erro ao atualizar missão.', 'error');
      setMissions(prevMissions); // Rollback
    }
  }, [missions, csrfToken, showSinglePopup, showAppNotification, updateUserPointsDisplay, userTotalPoints]);

  const completedMissionsCount = missions.filter(m => m.completed).length;
  const totalMissionsCount = missions.length;
  const routineProgressPercentage = totalMissionsCount > 0 ? (completedMissionsCount / totalMissionsCount) * 100 : 0;

  // BLOCO 4: Lógica de Atualização de Peso
  const handleSaveWeight = useCallback(async () => {
    const newWeightInput = document.getElementById('new-weight-input') as HTMLInputElement;
    const newWeightValue = newWeightInput?.value;

    setWeightErrorMessage('');

    if (!newWeightValue || isNaN(Number(newWeightValue)) || Number(newWeightValue) <= 0) {
      setWeightErrorMessage('Por favor, insira um peso válido.');
      return;
    }

    try {
      // Mock API call simulation
      const response = await new Promise<{ success: boolean; new_weight_formatted?: string; points_awarded?: number; new_total_points?: number; message?: string }>(resolve => {
        setTimeout(() => {
          const formattedWeight = parseFloat(newWeightValue).toFixed(1);
          resolve({
            success: true,
            new_weight_formatted: formattedWeight,
            points_awarded: 10, // Example points
            new_total_points: (userTotalPoints || 0) + 10
          });
        }, 300);
      });

      // In a real app:
      // const response = await fetch('/api/update_weight.php', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      //   body: `new_weight=${newWeightValue}&csrf_token=${csrfToken.current}`
      // });
      // const result = await response.json();

      const result = response;
      if (result.success) {
        if (result.new_weight_formatted) {
          setCurrentWeight(result.new_weight_formatted);
        }
        setIsWeightModalVisible(false);
        if (result.points_awarded !== undefined && result.points_awarded > 0) {
          showSinglePopup(result.points_awarded, 'gain');
          if (result.new_total_points !== undefined) {
            updateUserPointsDisplay(result.new_total_points);
          }
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setWeightErrorMessage(error.message || 'Erro de conexão ao atualizar peso.');
    }
  }, [csrfToken, showSinglePopup, showAppNotification, updateUserPointsDisplay, userTotalPoints]);


  return (
    <div className="relative min-h-screen bg-gray-100 font-sans">
      {/* Loader Overlay */}
      {isLoading && (
        <div id="loader-overlay" className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center transition-opacity duration-500 opacity-100">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {/* Points Popup */}
      {pointsPopup && (
        <div className={`points-popup fixed z-50 p-2 rounded-lg shadow-lg flex items-center text-white text-lg font-bold top-5 right-5 ${pointsPopup.eventType === 'bonus' ? 'bg-yellow-500' : pointsPopup.eventType === 'loss' ? 'bg-red-500' : 'bg-green-500'} animate-fade-in-up`}>
          <img src="https://i.ibb.co/8LXQt0Xy/POINTS.webp" alt="Pontos" className="w-6 h-6 mr-2" />
          <span>
            {pointsPopup.eventType === 'bonus' ? `+${pointsPopup.points} PONTOS BÔNUS!` :
             pointsPopup.eventType === 'loss' ? `-${Math.abs(pointsPopup.points)} Pontos` :
             `+${pointsPopup.points} Pontos`}
          </span>
        </div>
      )}

      {/* App Notification Popup */}
      {appNotification && (
        <div className={`app-notification-popup fixed z-50 p-3 rounded-lg shadow-lg flex items-center text-white top-5 left-5 ${appNotification.type === 'success' ? 'bg-green-500' : appNotification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} animate-fade-in-down`}>
          <i className={`fas ${appNotification.type === 'success' ? 'fa-check-circle' : appNotification.type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'} mr-2`}></i>
          <span>{appNotification.message}</span>
        </div>
      )}

      {/* User Points Display */}
      <div id="user-points-display" className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
        {userTotalPoints !== null ? (
          (userTotalPoints % 1 === 0)
            ? userTotalPoints.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
            : userTotalPoints.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        ) : '...'}
      </div>

      <div className="p-4 dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Water Card (Hidratação) */}
        <div id="water-card" className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Hidratação</h3>
          <div className="relative w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-300">
            <div id="water-level-group" className="absolute bottom-0 left-0 right-0 h-full bg-blue-500 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" style={{ transform: `translate(0, ${140 - (Math.min(waterCups / (waterGoal || 1), 1) * 140)}px)` }}></div>
            <span id="water-amount-display" className="relative z-10 text-2xl font-bold text-white drop-shadow-md">{waterCups}</span>
          </div>
          <span className="mt-2 text-sm text-gray-600">Copos de água (Meta: <span id="water-goal-display-total">{waterGoal}</span>)</span>
          <div className="flex mt-4 space-x-2">
            <button id="decrease-water" onClick={() => handleWaterChange(-1)} className="bg-red-500 text-white px-3 py-1 rounded-full shadow-md hover:bg-red-600 transition-colors">-</button>
            <button id="increase-water" onClick={() => handleWaterChange(1)} className="bg-green-500 text-white px-3 py-1 rounded-full shadow-md hover:bg-green-600 transition-colors">+</button>
          </div>
        </div>

        {/* Progress Circles */}
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Progresso Geral</h3>
          <div className="flex space-x-8">
            <div className="progress-circle relative w-24 h-24" data-value="75" data-goal="100">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle className="circle-bg" cx="18" cy="18" r="15.9155" strokeWidth="2" stroke="#e0e0e0" fill="none"></circle>
                {/* TODO: Implement dynamic strokeDashoffset for animation in useEffect */}
                <circle className="circle" cx="18" cy="18" r="15.9155" strokeWidth="2" stroke="#4CAF50" fill="none" strokeDasharray="100" strokeDashoffset="25"></circle>
                <text x="18" y="20.35" className="text-center text-sm font-bold fill-gray-800" textAnchor="middle">75%</text>
              </svg>
              <p className="text-sm mt-1 text-gray-600">Concluído</p>
            </div>
            <div className="progress-circle relative w-24 h-24" data-value="50" data-goal="100">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle className="circle-bg" cx="18" cy="18" r="15.9155" strokeWidth="2" stroke="#e0e0e0" fill="none"></circle>
                {/* TODO: Implement dynamic strokeDashoffset for animation in useEffect */}
                <circle className="circle" cx="18" cy="18" r="15.9155" strokeWidth="2" stroke="#FFC107" fill="none" strokeDasharray="100" strokeDashoffset="50"></circle>
                <text x="18" y="20.35" className="text-center text-sm font-bold fill-gray-800" textAnchor="middle">50%</text>
              </svg>
              <p className="text-sm mt-1 text-gray-600">Meta</p>
            </div>
          </div>
        </div>

        {/* Routine (Missions) Card */}
        <div className="card-routine bg-white p-4 rounded-lg shadow-md col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Minhas Rotinas Diárias</h3>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full h-2 bg-gray-200 rounded-full">
              <div id="routine-progress-fill" className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${routineProgressPercentage}%` }}></div>
            </div>
            <span id="routine-progress-text" className="ml-3 text-sm font-medium text-gray-700">{completedMissionsCount}/{totalMissionsCount} concluídas</span>
          </div>
          <div className="space-y-3">
            {missions.map(mission => (
              <div key={mission.id} className={`mission-item flex items-center justify-between p-3 bg-gray-50 rounded-md transition-all duration-500 ease-in-out ${mission.completed ? 'opacity-0 transform -translate-x-5' : ''}`} data-routine-id={mission.id}
                style={{ pointerEvents: mission.completed ? 'none' : 'auto' }}
              >
                <span>{mission.text}</span>
                <button
                  className={`complete-mission-btn px-3 py-1 rounded-full text-xs disabled:opacity-50 disabled:cursor-not-allowed
                    ${mission.completed ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'}`}
                  onClick={() => handleCompleteMission(mission.id)}
                  disabled={mission.completed}
                >
                  {mission.completed ? 'Concluída!' : 'Concluir'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Video Carousel Banners (functional buttons) */}
        <div className="bg-white p-4 rounded-lg shadow-md col-span-full">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Descubra Mais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => handleBannerClick(1)} className="flex flex-col items-center justify-center bg-blue-200 p-4 rounded-lg text-blue-800 font-semibold hover:bg-blue-300 transition-colors h-24">
              <img src="https://placehold.co/60x60?text=Receitas" alt="Receitas" className="mb-2" />
              <span>Receitas Deliciosas</span>
            </button>
            <button onClick={() => handleBannerClick(2)} className="flex flex-col items-center justify-center bg-gray-200 p-4 rounded-lg text-gray-800 font-semibold hover:bg-gray-300 transition-colors h-24">
              <img src="https://placehold.co/60x60?text=Dica" alt="Dica" className="mb-2" />
              <span>Dica do Dia</span>
            </button>
            <button onClick={() => handleBannerClick(3)} className="flex flex-col items-center justify-center bg-green-200 p-4 rounded-lg text-green-800 font-semibold hover:bg-green-300 transition-colors h-24">
              <img src="https://placehold.co/60x60?text=Rotinas" alt="Rotinas" className="mb-2" />
              <span>Minhas Rotinas</span>
            </button>
            <button onClick={() => handleBannerClick(4)} className="flex flex-col items-center justify-center bg-purple-200 p-4 rounded-lg text-purple-800 font-semibold hover:bg-purple-300 transition-colors h-24">
              <img src="https://placehold.co/60x60?text=Progresso" alt="Progresso" className="mb-2" />
              <span>Meu Progresso</span>
            </button>
          </div>
          {/* TODO: If a full Lottie animation carousel is needed, implement it here using a Lottie component */}
        </div>

        {/* Current Weight Display (example, trigger modal) */}
        <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center col-span-full">
          <h3 className="text-lg font-semibold text-gray-800">Meu Peso Atual:</h3>
          <div className="flex items-center">
            <span id="current-weight-value" className="text-2xl font-bold text-gray-800 mr-2">{currentWeight || 'N/A'}kg</span>
            <button data-action="open-weight-modal" onClick={() => setIsWeightModalVisible(true)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition-colors">Editar</button>
          </div>
        </div>
      </div>

      {/* Edit Weight Modal */}
      {isWeightModalVisible && (
        <div id="edit-weight-modal" className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 visible animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h4 className="text-xl font-bold mb-4 text-gray-800">Atualizar Peso</h4>
            <input
              id="new-weight-input"
              type="number"
              step="0.1"
              placeholder="Digite seu novo peso (kg)"
              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:ring-blue-500 focus:border-blue-500"
              onChange={() => setWeightErrorMessage('')}
            />
            {weightErrorMessage && (
              <p id="weight-error-message" className="text-red-500 text-sm mb-3">{weightErrorMessage}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsWeightModalVisible(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors">Cancelar</button>
              <button id="save-weight-btn" onClick={handleSaveWeight} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Selectable Options (Placeholder) */}
      <div className="p-4 mt-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Configurações de Perfil (Exemplo)</h3>
        <div className="flex flex-wrap gap-3">
          <label className="selectable-option inline-flex items-center px-4 py-2 rounded-full border border-gray-300 cursor-pointer transition-colors has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-500">
            <input type="radio" name="example-group" value="option1" className="hidden" />
            <span>Opção A</span>
          </label>
          <label className="selectable-option inline-flex items-center px-4 py-2 rounded-full border border-gray-300 cursor-pointer transition-colors has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-500">
            <input type="radio" name="example-group" value="option2" className="hidden" />
            <span>Opção B</span>
          </label>
          <label className="selectable-option inline-flex items-center px-4 py-2 rounded-full border border-gray-300 cursor-pointer transition-colors has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-500">
            <input type="checkbox" name="example-checkbox" value="check1" className="hidden" />
            <span>Multi-seleção 1</span>
          </label>
          <label className="selectable-option inline-flex items-center px-4 py-2 rounded-full border border-gray-300 cursor-pointer transition-colors has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-blue-500">
            <input type="checkbox" name="example-checkbox" value="check2" className="hidden" />
            <span>Multi-seleção 2</span>
          </label>
        </div>
      </div>

      <input type="hidden" id="csrf_token_main_app" value={csrfToken.current || ''} />
    </div>
  );
};
