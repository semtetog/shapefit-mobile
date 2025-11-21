import React, { useState, useEffect, useCallback, useRef } from 'react';

// Assuming BASE_URL is defined globally or passed as an environment variable
// For this example, let's define a placeholder.
const BASE_URL = '/api'; 

// Mock data for initial routines
interface RoutineItem {
  id: string;
  title: string;
  isCompleted: boolean;
  type?: 'cardio' | 'strength' | 'other'; // Added type for exercise duration logic
}

export const RoutineWithExerciseTime = ({ setView }: { setView: (view: string) => void }) => {
  // State for routines
  const [todoRoutines, setTodoRoutines] = useState<RoutineItem[]>([
    { id: '1', title: 'Fazer 30 minutos de cardio', isCompleted: false, type: 'cardio' },
    { id: '2', title: 'Treino de pernas (academia)', isCompleted: false, type: 'strength' },
    { id: '3', title: 'Estudar React por 1 hora', isCompleted: false, type: 'other' },
    { id: '4', title: 'Planejar refeições da semana', isCompleted: false, type: 'other' }
  ]);
  const [completedRoutines, setCompletedRoutines] = useState<RoutineItem[]>([]);

  // State for the exercise duration modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRoutineId, setModalRoutineId] = useState<string | null>(null);
  const [modalRoutineTitle, setModalRoutineTitle] = useState('');
  const [modalExerciseType, setModalExerciseType] = useState<'cardio' | 'strength' | 'other'>('other');
  const [exerciseDuration, setExerciseDuration] = useState<number | ''>('');

  // State for CSRF token (mocking it from a hidden input, normally would be from server-side or context)
  const [csrfToken, setCsrfToken] = useState<string>('mock_csrf_token_123'); // TODO: Implement actual CSRF token handling if needed

  // State for toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for points display (mocked)
  const [totalPoints, setTotalPoints] = useState(1250);

  // Refs for DOM elements if direct manipulation is needed (e.g., focus)
  const exerciseDurationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate fetching CSRF token if it were truly from the DOM
    // const tokenElement = document.getElementById('csrf_token_routine_page') as HTMLInputElement;
    // if (tokenElement?.value) {
    //   setCsrfToken(tokenElement.value);
    // } else {
    //   console.error('CSRF token não encontrado!');
    // }

    // Clean up toast timeout
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showSuccessMessage = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000); // Hide after 3 seconds
  }, []);

  const updatePointsDisplay = useCallback((newPoints: number) => {
    setTotalPoints(newPoints);
  }, []);

  const closeExerciseModal = useCallback(() => {
    setIsModalOpen(false);
    setExerciseDuration('');
    setModalRoutineId(null);
  }, []);

  const openExerciseModal = useCallback((id: string, title: string, type: 'cardio' | 'strength' | 'other') => {
    setModalRoutineId(id);
    setModalRoutineTitle(title);
    setModalExerciseType(type);
    setIsModalOpen(true);
    setTimeout(() => {
      exerciseDurationInputRef.current?.focus();
    }, 300);
  }, []);

  const completeRoutineWithDuration = useCallback(async (routineId: string, durationMinutes: number) => {
    if (!csrfToken) {
      alert('CSRF token não encontrado. Não é possível completar a rotina.');
      return;
    }

    const formData = new FormData();
    formData.append('routine_id', routineId);
    formData.append('exercise_duration_minutes', String(durationMinutes));
    formData.append('csrf_token', csrfToken);

    try {
      const response = await fetch(`${BASE_URL}/actions/complete_routine_item_v2.php`, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      const data = await response.json();

      if (data.success) {
        // Move item to completed list
        const routineToMove = todoRoutines.find(r => r.id === routineId);
        if (routineToMove) {
          setTodoRoutines(prev => prev.filter(r => r.id !== routineId));
          setCompletedRoutines(prev => [...prev, { ...routineToMove, isCompleted: true }]);
        }
        showSuccessMessage(data.message);
        updatePointsDisplay(data.new_total_points);
      } else {
        alert(data.message || 'Erro ao completar rotina com duração.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar a rotina com duração.');
    }
    closeExerciseModal();
  }, [csrfToken, todoRoutines, closeExerciseModal, showSuccessMessage, updatePointsDisplay]);

  const handleConfirmExerciseDuration = useCallback(() => {
    const duration = parseInt(String(exerciseDuration));

    if (!duration || duration < 1) {
      alert('Por favor, informe uma duração válida (mínimo 1 minuto)');
      return;
    }

    if (duration > 600) {
      alert('Duração máxima: 600 minutos (10 horas)');
      return;
    }

    if (modalRoutineId) {
      completeRoutineWithDuration(modalRoutineId, duration);
    }
  }, [exerciseDuration, modalRoutineId, completeRoutineWithDuration]);

  const completeRoutine = useCallback(async (routineId: string) => {
    if (!csrfToken) {
      alert('CSRF token não encontrado. Não é possível completar a rotina.');
      return;
    }

    const formData = new FormData();
    formData.append('routine_id', routineId);
    formData.append('csrf_token', csrfToken);

    try {
      const response = await fetch(`${BASE_URL}/actions/complete_routine_item_v2.php`, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      const data = await response.json();

      if (data.needs_duration) {
        // It's an exercise! Open modal to ask duration
        const routineItem = todoRoutines.find(r => r.id === routineId);
        if (routineItem) {
          openExerciseModal(
            routineId,
            data.routine_title || routineItem.title,
            data.exercise_type || routineItem.type || 'other'
          );
        }
      } else if (data.success) {
        // Completed successfully
        const routineToMove = todoRoutines.find(r => r.id === routineId);
        if (routineToMove) {
          setTodoRoutines(prev => prev.filter(r => r.id !== routineId));
          setCompletedRoutines(prev => [...prev, { ...routineToMove, isCompleted: true }]);
        }
        showSuccessMessage(data.message);
        updatePointsDisplay(data.new_total_points);
      } else {
        alert(data.message || 'Erro ao completar rotina.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar a rotina.');
    }
  }, [csrfToken, todoRoutines, openExerciseModal, showSuccessMessage, updatePointsDisplay]);

  const skipRoutine = useCallback((routineId: string) => {
    setTodoRoutines(prev => prev.filter(r => r.id !== routineId));
  }, []);

  const uncompleteRoutine = useCallback(async (routineId: string) => {
    if (!csrfToken) {
      alert('CSRF token não encontrado. Não é possível desmarcar a rotina.');
      return;
    }

    const formData = new FormData();
    formData.append('routine_id', routineId);
    formData.append('csrf_token', csrfToken);

    try {
      const response = await fetch(`${BASE_URL}/actions/uncomplete_routine_item.php`, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      const data = await response.json();

      if (data.success) {
        const routineToMove = completedRoutines.find(r => r.id === routineId);
        if (routineToMove) {
          setCompletedRoutines(prev => prev.filter(r => r.id !== routineId));
          setTodoRoutines(prev => [...prev, { ...routineToMove, isCompleted: false }]);
        }
        updatePointsDisplay(data.new_total_points);
      } else {
        alert(data.message || 'Erro ao desmarcar rotina.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar a rotina.');
    }
  }, [csrfToken, completedRoutines, updatePointsDisplay]);

  // Calculate progress
  const totalItems = todoRoutines.length + completedRoutines.length;
  const completedItems = completedRoutines.length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300 animate-fade-in-down">
          {toastMessage}
        </div>
      )}

      {/* Header and Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">Minha Rotina Diária</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setView("Dashboard")} // Example navigation
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
          >
            <i className="fas fa-arrow-left mr-2"></i> Voltar
          </button>
          <div className="bg-yellow-400 dark:bg-yellow-500 text-gray-900 font-bold py-1 px-3 rounded-full text-sm flex items-center points-counter-badge">
            <i className="fas fa-star mr-2"></i>
            <span>{totalPoints}</span> Pontos
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Progresso da Rotina</h2>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
            id="progress-bar"
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span id="progress-text">{completedItems}/{totalItems} concluídas</span>
          <span className="font-semibold" id="progress-percentage">{progressPercentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* TO-DO List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-5 text-blue-700 dark:text-blue-300 flex items-center">
            <i className="fas fa-list-ul mr-3"></i> A Fazer
          </h2>
          <ul id="routine-list-todo" className="space-y-4">
            {todoRoutines.length === 0 && (
              <li id="all-done-placeholder" className="p-4 bg-blue-100 dark:bg-blue-900 rounded-md text-blue-800 dark:text-blue-200 text-center italic border-l-4 border-blue-500 placeholder-card">
                🎉 Tudo pronto! Que tal adicionar novas tarefas ou relaxar?
              </li>
            )}
            {todoRoutines.map((routine) => (
              <li
                key={routine.id}
                data-routine-id={routine.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow duration-200 routine-list-item"
              >
                <p className="text-lg font-medium flex-grow">{routine.title}</p>
                <div className="flex space-x-2 routine-actions">
                  <button
                    onClick={() => skipRoutine(routine.id)}
                    className="action-btn skip-btn w-9 h-9 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200"
                    aria-label="Ignorar"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  <button
                    onClick={() => completeRoutine(routine.id)}
                    className="action-btn complete-btn w-9 h-9 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700 transition-colors duration-200"
                    aria-label="Concluir"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* COMPLETED List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-5 text-green-700 dark:text-green-300 flex items-center">
            <i className="fas fa-clipboard-check mr-3"></i> Concluídas
          </h2>
          <ul id="routine-list-completed" className="space-y-4">
            {completedRoutines.length === 0 && (
              <li id="none-completed-placeholder" className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-md text-yellow-800 dark:text-yellow-200 text-center italic border-l-4 border-yellow-500 placeholder-card">
                Comece a completar suas rotinas para vê-las aqui!
              </li>
            )}
            {completedRoutines.map((routine) => (
              <li
                key={routine.id}
                data-routine-id={routine.id}
                className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm border-l-4 border-green-500 is-completed routine-list-item"
              >
                <p className="text-lg font-medium flex-grow line-through">{routine.title}</p>
                <div className="flex space-x-2 routine-actions">
                  <button
                    onClick={() => uncompleteRoutine(routine.id)}
                    className="action-btn uncomplete-btn w-9 h-9 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200"
                    aria-label="Desfazer"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Exercise Duration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 exercise-modal-overlay">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 exercise-modal-content">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700 mb-4 exercise-modal-header">
              <h3 id="exerciseModalTitle" className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                {modalRoutineTitle}
              </h3>
              <button
                onClick={closeExerciseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 exercise-modal-close"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="exercise-modal-body">
              <p id="exerciseModalDescription" className="text-gray-600 dark:text-gray-300 mb-4">
                {modalExerciseType === 'cardio' ? '🏃 Informe quanto tempo durou o cardio' : '💪 Informe quanto tempo durou o treino'}
              </p>

              <div className="mb-4 duration-input-container">
                <label htmlFor="exerciseDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  id="exerciseDuration"
                  ref={exerciseDurationInputRef}
                  min="1"
                  max="600"
                  placeholder="Ex: 45"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 duration-input"
                  value={exerciseDuration}
                  onChange={(e) => setExerciseDuration(parseInt(e.target.value) || '')}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirmExerciseDuration();
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6 quick-duration-buttons">
                {[15, 30, 45, 60, 90, 120].map((minutes) => (
                  <button
                    key={minutes}
                    className="quick-duration-btn bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors duration-200 text-sm"
                    onClick={() => setExerciseDuration(minutes)}
                  >
                    {minutes} {minutes < 60 ? 'min' : `h${minutes / 60}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 exercise-modal-footer">
              <button
                onClick={closeExerciseModal}
                className="btn-cancel px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                id="confirmExerciseDuration"
                onClick={handleConfirmExerciseDuration}
                className="btn-confirm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
