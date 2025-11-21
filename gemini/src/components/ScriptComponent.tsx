import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PopupState {
  message: string;
  type: 'gain' | 'loss' | 'bonus' | 'info' | 'success' | 'error';
  points?: number;
  visible: boolean;
  id: string;
}

export const ScriptComponent = ({ setView }: { setView: (view: string) => void }) => {
  // TODO: Replace with actual CSRF token retrieval (e.g., from context, prop, or initial fetch)
  const csrfToken = "YOUR_CSRF_TOKEN_HERE"; 

  const [popups, setPopups] = useState<PopupState[]>([]);
  const [appNotifications, setAppNotifications] = useState<PopupState[]>([]);
  const [loaderVisible, setLoaderVisible] = useState(true);

  // TODO: Initialize with actual user points
  const [userTotalPoints, setUserTotalPoints] = useState(0);

  // Water hydration states
  // TODO: Initialize with actual consumed water
  const [currentCups, setCurrentCups] = useState(0); 
  // TODO: Initialize with actual water goal
  const [waterGoalCups, setWaterGoalCups] = useState(8); 
  const maxWaterHeight = 140; // px
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Routine states (example, assuming a simple list)
  const [missions, setMissions] = useState([
    { id: '1', name: 'Beber 2L de água', completed: false, points: 50 },
    { id: '2', name: 'Treino de Pernas', completed: false, points: 100 },
    { id: '3', name: 'Meditar por 10min', completed: false, points: 30 },
  ]);
  const completedMissionsCount = missions.filter(m => m.completed).length;
  const totalMissionsCount = missions.length;
  const routineProgressPercentage = totalMissionsCount > 0 ? (completedMissionsCount / totalMissionsCount) * 100 : 0;

  // Weight modal states
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [newWeightInput, setNewWeightInput] = useState('');
  const [weightErrorMessage, setWeightErrorMessage] = useState('');
  // TODO: Initialize with actual user weight
  const [currentWeight, setCurrentWeight] = useState(70.5); 

  // Ref for selectable options (mostly for potential direct DOM interaction, but not used in React's idiomatic way here)
  const selectableOptionsRef = useRef<HTMLDivElement>(null);

  // =========================================================================
  //         BLOCO 0: FUNÇÕES GLOBAIS DE AJUDA (Adaptadas para React State)
  // =========================================================================

  const showSinglePopup = useCallback((points: number, eventType: 'gain' | 'loss' | 'bonus' = 'gain') => {
    if (points === 0) return;

    const absPoints = Math.abs(points);
    let message = '';
    if (eventType === 'bonus') { message = `+${absPoints} PONTOS BÔNUS!`; }
    else if (eventType === 'loss') { message = `-${absPoints} Pontos`; }
    else { message = `+${absPoints} Pontos`; }

    const newPopup: PopupState = { message, type: eventType, points, visible: true, id: Math.random().toString(36).substring(2, 9) };
    setPopups(prev => [...prev, newPopup]);

    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== newPopup.id));
    }, 3000);
  }, []);

  const showAppNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    // Clear existing notifications before showing a new one
    setAppNotifications([]); // Or implement a queue if multiple are allowed

    const newNotification: PopupState = { message, type, visible: true, id: Math.random().toString(36).substring(2, 9) };
    setAppNotifications([newNotification]);

    setTimeout(() => {
      setAppNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 4000);
  }, []);

  const updateUserPointsDisplay = useCallback((newTotal: number) => {
    setUserTotalPoints(newTotal);
  }, []);

  // =========================================================================
  //         BLOCO 1: INICIALIZADOR DE PÁGINA (LOADER)
  // =========================================================================
  useEffect(() => {
    const handleLoad = () => {
      setLoaderVisible(false);
    };

    // Simulate window.load event for React or use actual if needed
    // In a real app, this might be based on data fetching status.
    // For now, let's just trigger it after a short delay for demonstration.
    const timer = setTimeout(() => {
      handleLoad();
    }, 500); // Simulate page load time

    return () => clearTimeout(timer);
  }, []);

  // =========================================================================
  //         BLOCO 2: LÓGICA ESPECÍFICA DO DASHBOARD
  // =========================================================================

  // --- LÓGICA DE HIDRATAÇÃO ---
  const updateWaterVisuals = useCallback(() => {
    const percentage = waterGoalCups > 0 ? Math.min(currentCups / waterGoalCups, 1) : 0;
    // In React, we manage this with CSS variables or direct style objects.
    // Here, we return the calculated translateY for inline style.
    const translateY = maxWaterHeight - (percentage * maxWaterHeight);
    return translateY;
  }, [currentCups, waterGoalCups]);

  const updateWaterOnServer = useCallback(async (newAmount: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/update_water.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `water_consumed=${newAmount}&csrf_token=${csrfToken}`
        });
        const result = await response.json();
        if (result.success) {
          if (result.points_awarded !== 0) {
            showSinglePopup(result.points_awarded, result.points_awarded > 0 ? 'gain' : 'loss');
          }
          updateUserPointsDisplay(result.new_total_points);
        } else {
          showAppNotification(result.message || 'Erro ao salvar.', 'error');
        }
      } catch (error) {
        console.error("Erro ao atualizar água:", error);
        showAppNotification('Erro de conexão.', 'error');
      }
    }, 500);
  }, [csrfToken, showSinglePopup, showAppNotification, updateUserPointsDisplay]);

  const handleIncreaseWater = () => {
    setCurrentCups(prev => {
      const newAmount = prev + 1;
      updateWaterOnServer(newAmount);
      return newAmount;
    });
  };

  const handleDecreaseWater = () => {
    setCurrentCups(prev => {
      if (prev > 0) {
        const newAmount = prev - 1;
        updateWaterOnServer(newAmount);
        return newAmount;
      }
      return prev;
    });
  };

  // --- LÓGICA DOS CÍRCULOS DE PROGRESSO ---
  // This is a reusable component for each progress circle.
  const ProgressCircle = React.memo(({ value, goal }: { value: number, goal: number }) => {
    const circleRef = useRef<SVGCircleElement>(null);
    const percentage = goal > 0 ? value / goal : 0;
    const circumference = 2 * Math.PI * 15.9155;
    const offset = circumference * (1 - Math.min(percentage, 1));
    const [dashOffset, setDashOffset] = useState(circumference);

    useEffect(() => {
      // Simulate the delayed animation from original JS
      const timeout = setTimeout(() => {
        setDashOffset(offset);
      }, 200);
      return () => clearTimeout(timeout);
    }, [offset]);

    return (
      <svg className="progress-circle w-20 h-20" viewBox="0 0 36 36">
        <path className="circle-bg text-gray-300" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          ref={circleRef}
          className="circle text-green-500 transition-all duration-1000 ease-out"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
        <text x="18" y="20.35" className="text-sm font-semibold text-gray-700 fill-current" textAnchor="middle" alignmentBaseline="middle">{Math.round(percentage * 100)}%</text>
      </svg>
    );
  });


  // --- LÓGICA DA ROTINA (MISSÕES) ---
  const handleCompleteMission = useCallback(async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    // Optimistic UI update
    setMissions(prev => prev.map(m =>
      m.id === missionId ? { ...m, completed: true } : m
    ));

    try {
      const response = await fetch('/api/update_routine_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `routine_id=${missionId}&status=1&csrf_token=${csrfToken}`
      });
      const result = await response.json();

      if (result.success) {
        if (result.points_awarded > 0) {
          showSinglePopup(result.points_awarded, 'gain');
          updateUserPointsDisplay(result.new_total_points);
        }
        // No need to revert optimistic update
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showAppNotification(error.message || 'Erro ao atualizar missão.', 'error');
      // Revert optimistic update on error
      setMissions(prev => prev.map(m =>
        m.id === missionId ? { ...m, completed: false } : m
      ));
    }
  }, [missions, csrfToken, showSinglePopup, showAppNotification, updateUserPointsDisplay]);

  // =========================================================================
  //         BLOCO 3: LÓGICA DO CARROSSEL DE VÍDEO (DESABILITADO - USANDO LOTTIE)
  // =========================================================================

  // Função para lidar com cliques nos banners (mantida para compatibilidade)
  // Replaced window.location.href with setView prop
  const handleBannerClick = useCallback((bannerNumber: number) => {
    switch (bannerNumber) {
      case 1:
        setView('ExploreRecipes'); // Banner 1: Página de receitas
        break;
      case 2:
        // Banner 2: Sem funcionalidade
        return;
      case 3:
        setView('RoutinePage'); // Banner 3: Página de rotinas
        break;
      case 4:
        setView('ProgressPage'); // Banner 4: Página de progresso
        break;
      default:
        break;
    }
  }, [setView]);

  // =========================================================================
  //         BLOCO 4: LÓGICA DE COMPONENTES GERAIS (MODAIS, FORMS)
  // =========================================================================

  // --- LÓGICA DE ATUALIZAÇÃO DE PESO ---
  const handleSaveWeight = useCallback(async () => {
    setWeightErrorMessage('');

    const parsedWeight = parseFloat(newWeightInput);
    if (!newWeightInput || isNaN(parsedWeight) || parsedWeight <= 0) {
      setWeightErrorMessage('Por favor, insira um peso válido.');
      return;
    }

    try {
      const response = await fetch('/api/update_weight.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `new_weight=${newWeightInput}&csrf_token=${csrfToken}`
      });
      const result = await response.json();

      if (result.success) {
        setCurrentWeight(parsedWeight); // Assuming result.new_weight_formatted is parsed and stored
        setIsWeightModalVisible(false);
        if (result.points_awarded > 0) {
          showSinglePopup(result.points_awarded, 'gain');
          updateUserPointsDisplay(result.new_total_points);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setWeightErrorMessage(error.message || 'Erro de conexão.');
    }
  }, [newWeightInput, csrfToken, showSinglePopup, showAppNotification, updateUserPointsDisplay]);

  // --- LÓGICA DE OPÇÕES SELECIONÁVEIS (PARA PÁGINAS DE ONBOARDING/PERFIL) ---
  // This logic is typically handled by React's controlled components (useState for checked state).
  // The original JS directly manipulated classes based on input checked state.
  // In React, you'd bind the checked state of radio/checkbox inputs to state and apply classes conditionally.
  const handleSelectableOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // This is a placeholder for how you'd handle form inputs in React.
    // In a real app, you'd manage individual input states or a form state.
    console.log(`Option ${event.target.name} with value ${event.target.value} changed to ${event.target.checked}`);
    // You would update a state variable here, which then conditionally applies classes to the parent label.
  };

  // =========================================================================
  //         RENDERIZAÇÃO DO COMPONENTE
  // =========================================================================

  return (
    <div className="min-h-screen bg-gray-100 font-sans relative">

      {/* LOADER OVERLAY */}
      {loaderVisible && (
        <div id="loader-overlay" className="fixed inset-0 bg-white flex items-center justify-center z-50 transition-opacity duration-500 ease-out">
          <div className="loader border-4 border-gray-200 border-t-4 border-t-indigo-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      )}

      {/* GLOBAL POPUPS */}
      {popups.map(popup => (
        <div key={popup.id} className={`points-popup fixed top-4 right-4 bg-white p-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 transition-transform transform ${popup.type === 'loss' ? 'text-red-600' : 'text-green-600'} ${popup.type === 'bonus' ? 'bg-yellow-100' : ''}`}>
          <img src="https://i.ibb.co/8LXQt0Xy/POINTS.webp" alt="Pontos" className="w-6 h-6" />
          <span className="font-bold">{popup.message}</span>
        </div>
      ))}

      {/* APP NOTIFICATIONS */}
      {appNotifications.map(notification => (
        <div key={notification.id} className={`app-notification-popup fixed top-4 left-4 bg-white p-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 transition-transform transform ${notification.type === 'success' ? 'text-green-600' : notification.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
          {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
          {notification.type === 'error' && <i className="fas fa-exclamation-triangle"></i>}
          {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
          <span>{notification.message}</span>
        </div>
      ))}


      <div className="container mx-auto p-4">
        {/* User Points Display - assuming a header or dedicated area */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Meu Dashboard</h1>
            <div className="flex items-center space-x-2 text-lg font-semibold text-indigo-600">
                <span>Pontos:</span>
                <span id="user-points-display" className="text-3xl font-extrabold">{userTotalPoints.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}</span>
            </div>
        </div>

        <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Water Hydration Card */}
          <div id="water-card" className="card bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Hidratação</h3>
            <div className="relative w-32 h-40 bg-blue-100 rounded-b-full overflow-hidden flex items-end justify-center">
              <div
                id="water-level-group"
                className="absolute bottom-0 w-full bg-blue-500 transition-transform duration-700 ease-in-out"
                style={{ height: `${maxWaterHeight}px`, transform: `translateY(${updateWaterVisuals()}px)` }}
              ></div>
              <span id="water-amount-display" className="absolute text-2xl font-bold text-white z-10">{currentCups}</span>
            </div>
            <div className="flex items-center justify-center mt-4 space-x-4">
              <button
                id="decrease-water"
                onClick={handleDecreaseWater}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
              >-</button>
              <span className="text-lg font-medium">de <span id="water-goal-display-total">{waterGoalCups}</span> copos</span>
              <button
                id="increase-water"
                onClick={handleIncreaseWater}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
              >+</button>
            </div>
          </div>

          {/* Progress Circles (Example) */}
          <div className="card bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-4">Seu Progresso</h3>
            <div className="flex space-x-4">
              <ProgressCircle value={75} goal={100} />
              <ProgressCircle value={1500} goal={2000} />
            </div>
          </div>

          {/* Routine Card */}
          <div className="card card-routine bg-white rounded-lg shadow p-6 col-span-1 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Minhas Rotinas Diárias</h3>
            <div className="space-y-3">
              {missions.map(mission => (
                <div key={mission.id} data-routine-id={mission.id} className={`mission-item flex items-center justify-between p-3 rounded-lg ${mission.completed ? 'bg-green-50 opacity-70' : 'bg-gray-50'}`}>
                  <span className={`text-gray-800 ${mission.completed ? 'line-through text-gray-500' : ''}`}>{mission.name}</span>
                  <button
                    onClick={() => handleCompleteMission(mission.id)}
                    disabled={mission.completed}
                    className={`complete-mission-btn py-1 px-3 rounded-full text-sm font-semibold transition-all ${mission.completed ? 'bg-green-500 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
                  >
                    {mission.completed ? 'Concluído' : 'Completar'}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div id="routine-progress-fill" className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${routineProgressPercentage}%` }}></div>
              </div>
              <p id="routine-progress-text" className="text-sm text-gray-600 mt-2 text-center">{completedMissionsCount}/{totalMissionsCount} concluídas</p>
            </div>
          </div>

          {/* Banner Clicks - using placeholder buttons */}
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <button onClick={() => handleBannerClick(1)} className="card bg-purple-200 p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center font-bold text-purple-800">
              Receitas Deliciosas
            </button>
            <button onClick={() => handleBannerClick(2)} className="card bg-orange-200 p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center font-bold text-orange-800">
              Desafios Semanais
            </button>
            <button onClick={() => handleBannerClick(3)} className="card bg-yellow-200 p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center font-bold text-yellow-800">
              Minha Rotina
            </button>
            <button onClick={() => handleBannerClick(4)} className="card bg-teal-200 p-4 rounded-lg shadow hover:shadow-md transition-shadow text-center font-bold text-teal-800">
              Ver Progresso
            </button>
          </div>

          {/* Example of opening weight modal */}
          <div className="card bg-white rounded-lg shadow p-6 flex items-center justify-between">
            <span className="font-semibold text-gray-700">Meu Peso Atual: <span id="current-weight-value" className="font-bold text-indigo-600">{currentWeight}kg</span></span>
            <button
              data-action="open-weight-modal"
              onClick={() => setIsWeightModalVisible(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm"
            >
              Editar Peso
            </button>
          </div>

        </div> {/* End dashboard-grid */}

        {/* Selectable Options Example (for onboarding/profile pages) */}
        <div ref={selectableOptionsRef} className="mt-8 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Preferências de Dieta</h3>
          <div className="flex flex-wrap gap-4">
            <label className="selectable-option inline-flex items-center cursor-pointer p-3 rounded-lg border border-gray-300 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-500 transition-colors">
              <input type="radio" name="diet_pref" value="vegan" className="hidden" onChange={handleSelectableOptionChange} />
              <span className="ml-2 text-gray-700">Vegano</span>
            </label>
            <label className="selectable-option inline-flex items-center cursor-pointer p-3 rounded-lg border border-gray-300 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-500 transition-colors">
              <input type="radio" name="diet_pref" value="vegetarian" className="hidden" onChange={handleSelectableOptionChange} />
              <span className="ml-2 text-gray-700">Vegetariano</span>
            </label>
            <label className="selectable-option inline-flex items-center cursor-pointer p-3 rounded-lg border border-gray-300 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-500 transition-colors">
              <input type="radio" name="diet_pref" value="keto" className="hidden" onChange={handleSelectableOptionChange} />
              <span className="ml-2 text-gray-700">Keto</span>
            </label>
            {/* ... more options */}
          </div>
        </div>

      </div> {/* End container */}

      {/* Edit Weight Modal */}
      {isWeightModalVisible && (
        <div id="edit-weight-modal" className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
            <h3 className="text-xl font-bold mb-4">Atualizar Peso</h3>
            <input
              id="new-weight-input"
              type="number"
              step="0.1"
              value={newWeightInput}
              onChange={(e) => setNewWeightInput(e.target.value)}
              placeholder="Digite seu novo peso em kg"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            />
            {weightErrorMessage && (
              <p id="weight-error-message" className="text-red-500 text-sm mb-4">{weightErrorMessage}</p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                data-action="close-modal"
                onClick={() => setIsWeightModalVisible(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                id="save-weight-btn"
                onClick={handleSaveWeight}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md"
              >
                Salvar
              </button>
            </div>
            {/* Close button inside modal for better UX */}
            <button data-action="close-modal" onClick={() => setIsWeightModalVisible(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
