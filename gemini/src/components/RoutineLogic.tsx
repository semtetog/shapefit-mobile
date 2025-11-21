import React, { useState, useRef } from 'react';

export const RoutineLogic = ({
  setView,
  initialTotalMissions = 3, // These should be passed as props from a parent component
  initialCompletedMissions = 0,
  initialCsrfToken = 'dummy_csrf_token',
  initialUserPoints = 1234.5,
  initialMissions = [
    { id: '1', text: 'Beber um copo de água ao acordar?' },
    { id: '2', text: 'Fazer 15 minutos de alongamento?' },\n    { id: '3', text: 'Ler 10 páginas de um livro?' },
  ]
}: {
  setView: (view: string) => void;
  initialTotalMissions?: number;
  initialCompletedMissions?: number;
  initialCsrfToken?: string;
  initialUserPoints?: number;
  initialMissions?: Array<{ id: string; text: string }>;
}) => {
  const [totalMissions, setTotalMissions] = useState(initialTotalMissions);
  const [completedMissions, setCompletedMissions] = useState(initialCompletedMissions);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userPoints, setUserPoints] = useState(initialUserPoints);
  const [missions] = useState(initialMissions); // Missions array is static for this component

  const csrfToken = useRef(initialCsrfToken);

  // Calculate progress percentage dynamically
  const percentage = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

  // Function to handle "Yes" button click
  const handleYesClick = async (routineId: string) => {
    // 1. Update UI immediately (optimistic feedback)
    setCompletedMissions(prev => prev + 1);

    // 2. Prepare data for API
    const formData = new FormData();
    formData.append('routine_id', routineId);
    formData.append('status', '1');
    formData.append('csrf_token', csrfToken.current);

    try {
      // 3. Send request to your API
      const response = await fetch('api/update_routine_status.php', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.status === 'success') {
        console.log('Missão atualizada com sucesso via API.');

        // Update total points on screen
        setUserPoints(data.new_total_points);

        // TODO: AQUI ESTÁ A ADIÇÃO: CHAMA O POPUP DE PONTOS
        // Verifica se a função global existe antes de chamar
        // if (typeof window.showSinglePopup === 'function' && data.points_awarded > 0) {
        //   window.showSinglePopup(data.points_awarded);
        // }
        console.log(`Pontos concedidos: ${data.points_awarded}`); // For testing in console

      } else {
        console.error('Falha ao atualizar missão:', data.message);
        // Revert UI in case of API failure
        setCompletedMissions(prev => prev - 1);
      }
    } catch (error) {
      console.error('Erro na requisição fetch:', error);
      // Revert UI in case of fetch error
      setCompletedMissions(prev => prev - 1);
    } finally {
      // 4. Show the next card (always move forward regardless of API success/failure)
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  // Function to handle "No" button click
  const handleNoClick = () => {
    setCurrentCardIndex(prev => prev + 1);
  };

  // Format user points for display
  const formattedUserPoints = Number(userPoints).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  return (
    <div
      className="routine-section-gamified min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative"
      // The data- attributes below are for reference; in React, data is typically managed via state/props
      data-csrf-token={csrfToken.current}
      data-total-missions={totalMissions}
      data-completed-missions={completedMissions}
    >
      {/* User Points Display */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md text-lg font-semibold">
        Pontos: <span id="user-points-display">{formattedUserPoints}</span>
      </div>

      {/* Progress Section */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Sua Rotina Diária</h2>
        <div className="relative w-full h-8 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            id="routine-progress-fill"
            className="absolute h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
          <div
            id="progress-character"
            className="absolute top-0 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm transition-all duration-500 ease-out"
            style={{ left: `${percentage}%` }}
          >
            XP
          </div>
        </div>
        <p id="routine-progress-text" className="text-gray-700">
          Você completou{' '}
          <strong className="text-green-600">{Math.round(percentage)}%</strong> da sua rotina hoje!
        </p>
      </div>

      {/* Mission Cards Container */}
      <div className="w-full max-w-md relative" style={{ height: '200px' }}> {/* Fixed height to accommodate absolute positioning */}
        {missions.map((mission, index) => (
          <div
            key={mission.id}
            className={`mission-card-interactive bg-white rounded-lg shadow-xl p-6 absolute w-full transition-all duration-300 ease-in-out
              ${index === currentCardIndex ? 'opacity-100 z-10' : 'opacity-0 -z-0 pointer-events-none'}`}
            style={{ left: `${(index - currentCardIndex) * 100}%` }} // Simple horizontal slide effect
            data-routine-id={mission.id}
          >
            <h3 className="text-xl font-semibold mb-4 text-center">Missão {index + 1}:</h3>
            <p className="text-gray-800 text-lg mb-6 text-center">{mission.text}</p>
            <div className="flex justify-around">
              <button
                data-action="yes"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
                onClick={() => handleYesClick(mission.id)}
              >
                Sim
              </button>
              <button
                data-action="no"
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
                onClick={handleNoClick}
              >
                Não
              </button>
            </div>
          </div>
        ))}

        {/* Celebration Card */}
        <div
          id="routine-celebration-card"
          className={`celebration bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-lg shadow-xl p-8 text-center absolute w-full transition-all duration-500 ease-in-out
            ${currentCardIndex >= missions.length ? 'opacity-100 z-10' : 'opacity-0 -z-0 pointer-events-none'}`}
          style={{ left: `${(missions.length - currentCardIndex) * 100}%` }} // Keep consistent slide effect
        >
          <h2 className="text-3xl font-extrabold mb-4 animate-bounce">Parabéns!</h2>
          <p className="text-xl mb-6">Você completou todas as suas missões hoje!</p>
          <div className="confetti-container relative h-24 w-full overflow-hidden"> {/* Added overflow-hidden */}
            {/* Simple CSS confetti or a placeholder. Original script just re-renders innerHTML for effect */}
            {currentCardIndex >= missions.length && (
              <>
                <div className="absolute top-0 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-confetti-fall" style={{ animationDelay: '0.1s', '--tw-translate-x': '50px', '--tw-translate-y': '100px' }}></div>
                <div className="absolute top-1/2 left-3/4 w-2 h-2 bg-pink-300 rounded-full animate-confetti-fall" style={{ animationDelay: '0.3s', '--tw-translate-x': '-30px', '--tw-translate-y': '120px' }}></div>
                <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-green-300 rounded-full animate-confetti-fall" style={{ animationDelay: '0.5s', '--tw-translate-x': '20px', '--tw-translate-y': '110px' }}></div>
                <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-confetti-fall" style={{ animationDelay: '0.7s', '--tw-translate-x': '-60px', '--tw-translate-y': '90px' }}></div>
              </>
            )}
          </div>
          <button
            onClick={() => setView('Home')} // Example navigation
            className="mt-6 bg-white text-purple-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Voltar para a Home
          </button>
        </div>
      </div>

      {/* Tailwind CSS keyframes for confetti animations (add this to your global CSS or an inline style) */}
      {/* This style block should ideally be in your main CSS or a CSS-in-JS solution */}
      <style>
        {`
        @keyframes confetti-fall {
          0% { transform: translate(0, -100px) rotate(0deg); opacity: 0; }
          100% { transform: translate(var(--tw-translate-x, 0), var(--tw-translate-y, 0)) rotate(720deg); opacity: 1; }
        }
        .animate-confetti-fall { animation: confetti-fall 2s ease-out forwards; }
      `}
      </style>
    </div>
  );
};
