import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export const Progress = ({ setView }: { setView: (view: string) => void }) => {
  const [activePeriod, setActivePeriod] = useState<'today' | 'week' | 'month'>('today');
  const [progressData, setProgressData] = useState<any>(null); // TODO: Define proper type for progressData
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weightChartRef = useRef<HTMLCanvasElement>(null);
  const weightChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Implement authentication logic (e.g., replace with your actual API call)
        // const authenticated = await requireAuth(); // Assuming requireAuth() exists globally or is imported
        // if (!authenticated) {
        //   setError('User not authenticated.');
        //   setLoading(false);
        //   return;
        // }

        // const BASE_URL = window.BASE_APP_URL || window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        // if (BASE_URL.endsWith('/')) {
        //   BASE_URL = BASE_URL.slice(0, -1);
        // }

        // const response = await authenticatedFetch(`${BASE_URL}/api/get_progress_data.php`); // Assuming authenticatedFetch() exists
        // if (!response) throw new Error('Network error or empty response');
        // const result = await response.json();

        // Mocking data for demonstration
        const mockData = {
          success: true,
          data: {
            goals: { target_water_cups: 8 },
            today: {
              calories: { consumed: 1500, target: 2000 },
              water: { consumed_ml: 1200, target_ml: 2000 },
              sleep: { hours: 6, target_hours: 8 },
            },
            week: {
              calories: { consumed: 10500, target: 14000 },
              water: { consumed_ml: 8400, target_ml: 14000 },
              sleep: { hours: 42, target_hours: 56 },
            },
            month: {
              calories: { consumed: 45000, target: 60000 },
              water: { consumed_ml: 36000, target_ml: 60000 },
              sleep: { hours: 180, target_hours: 240 },
            },
            weight_history: [
              { date: '2023-10-01', weight: 70 },
              { date: '2023-10-05', weight: 69.5 },
              { date: '2023-10-10', weight: 69 },
              { date: '2023-10-15', weight: 68.8 },
              { date: '2023-10-20', weight: 68.5 },
              { date: '2023-10-25', weight: 68.2 }
            ],
            current_weight: 68.2,
            weight_change: '-1.8kg (últimos 30 dias)',
            weight_records: 6,
            water_goal_ml: 2000 // Example from backend
          }
        };

        const result = mockData; // Use mock data for now
        if (!result.success) {
          throw new Error(result.message || 'Erro ao carregar dados');
        }

        const data = result.data;
        setProgressData(data);
        setLoading(false);

      } catch (err: any) {
        console.error('Erro ao carregar progresso:', err);
        setError(err.message || 'Erro ao carregar dados. Tente novamente.');
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []); // Empty dependency array means this runs once on mount

  // Effect for Chart.js initialization
  useEffect(() => {
    if (weightChartRef.current && progressData?.weight_history?.length > 0) {
      if (weightChartInstance.current) {
        weightChartInstance.current.destroy(); // Destroy previous instance
      }
      const ctx = weightChartRef.current.getContext('2d');
      if (ctx) {
        weightChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: progressData.weight_history.map((entry: any) => entry.date),
            datasets: [{
              label: 'Peso (kg)',
              data: progressData.weight_history.map((entry: any) => entry.weight),
              borderColor: '#F97316', // Tailwind orange-500
              backgroundColor: 'rgba(249, 115, 22, 0.2)',
              tension: 0.4,
              fill: true,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.7)' }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.7)' }
              }
            },
            plugins: {
              legend: {
                labels: { color: 'rgba(255, 255, 255, 0.9)' }
              }
            }
          },
        });
      }
    }

    // Cleanup function for Chart.js instance
    return () => {
      if (weightChartInstance.current) {
        weightChartInstance.current.destroy();
      }
    };
  }, [progressData?.weight_history]); // Re-run when weight_history changes

  // Helper to calculate progress percentage and fill style
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return { percentage: 0, fillStyle: 'bg-gray-500' };
    const percentage = Math.min(100, (current / target) * 100);
    let fillStyle = 'bg-orange-500'; // Default for progress
    if (percentage >= 100) {
      fillStyle = 'bg-green-500'; // Example for completed goal
    }
    return { percentage, fillStyle };
  };

  const currentPeriodData = progressData ? progressData[activePeriod] : null;

  // Reusable component for unified progress cards
  const ProgressCardUnified = ({ icon, label, value, target, progressCurrent, progressTarget, unit = '' }: any) => {
    const { percentage, fillStyle } = calculateProgress(progressCurrent, progressTarget);
    return (
      <div className="flex flex-col items-center justify-between p-5 sm:p-3 bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-2xl text-center shadow-lg min-h-40 sm:min-h-32 transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl">
        <span className="text-4xl mb-3 flex-shrink-0">{icon}</span>
        <h4 className="text-base font-semibold text-gray-100 mb-2 flex-shrink-0">{label}</h4>
        <p className="text-xl font-bold text-gray-100 mb-1 flex-shrink-0">{value} {unit}</p>
        {target && <p className="text-xs text-gray-400 mb-3 leading-tight flex-shrink-0">{target}</p>}
        <div className="w-full h-2 bg-white/[0.1] rounded-md overflow-hidden mb-3 flex-shrink-0">
          <div className={`${fillStyle} h-full rounded-md`} style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-sm font-semibold text-gray-100 flex-shrink-0">{Math.round(percentage)}%</p>
      </div>
    );
  };

  // Reusable component for summary progress cards
  const SummaryProgressCard = ({ icon, label, value, target }: any) => (
    <div className="flex flex-col items-center justify-between p-5 sm:p-4 bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-2xl text-center shadow-lg min-h-36 transition-all duration-300 ease-in-out">
      <span className="text-3xl mb-2">{icon}</span>
      <h4 className="text-sm font-semibold text-gray-100 mb-2">{label}</h4>
      <p className="text-lg font-bold text-gray-100 mb-1">{value}</p>
      <p className="text-xs text-gray-400 m-0">{target}</p>
    </div>
  );

  return (
    <div className="app-container" id="progress-container">
      <section className="flex flex-col gap-5 px-2 py-5 sm:px-6 sm:py-10">
        {/* Header da página */}
        <header className="w-full text-left mb-1">
          <h1 className="text-3xl font-bold text-gray-100 m-0">Meu Progresso</h1>

          {/* Seletor de Período */}
          <div className="mt-5 mb-2">
            <div className="flex bg-white/[0.05] rounded-xl p-1 gap-1 backdrop-blur-lg border border-white/[0.1]">
              <button
                className={`flex-1 p-3 sm:p-4 bg-transparent border-none rounded-lg text-gray-400 text-sm font-semibold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 min-h-12 ${activePeriod === 'today' ? 'bg-orange-500 text-white translate-y-[-1px]' : 'hover:bg-white/[0.1] hover:text-gray-100 hover:translate-y-[-1px]'}`}
                onClick={() => setActivePeriod('today')}
              >
                <span className="tab-icon">📅</span>
                <span className="tab-text">Hoje</span>
              </button>
              <button
                className={`flex-1 p-3 sm:p-4 bg-transparent border-none rounded-lg text-gray-400 text-sm font-semibold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 min-h-12 ${activePeriod === 'week' ? 'bg-orange-500 text-white translate-y-[-1px]' : 'hover:bg-white/[0.1] hover:text-gray-100 hover:translate-y-[-1px]'}`}
                onClick={() => setActivePeriod('week')}
              >
                <span className="tab-icon">📊</span>
                <span className="tab-text">Semana</span>
              </button>
              <button
                className={`flex-1 p-3 sm:p-4 bg-transparent border-none rounded-lg text-gray-400 text-sm font-semibold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 min-h-12 ${activePeriod === 'month' ? 'bg-orange-500 text-white translate-y-[-1px]' : 'hover:bg-white/[0.1] hover:text-gray-100 hover:translate-y-[-1px]'}`}
                onClick={() => setActivePeriod('month')}
              >
                <span className="tab-icon">📈</span>
                <span className="tab-text">Mês</span>
              </button>
            </div>
          </div>
        </header>

        {/* CARD UNIFICADO DE PROGRESSO */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-6 sm:p-4 mb-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-100 m-0 mb-5 uppercase tracking-wide text-center">📊 Meu Progresso</h3>
          <p className="text-sm text-gray-400 m-0 mb-4 text-center" id="period-subtitle">
            Consumo vs Meta - {activePeriod === 'today' ? 'Hoje' : activePeriod === 'week' ? 'Esta Semana' : 'Este Mês'}
          </p>

          <div className="grid grid-cols-2 gap-5 mt-5 w-full auto-rows-auto sm:gap-4">
            {loading && (
              <div className="col-span-2 flex flex-col items-center justify-center p-10 text-gray-400">
                <div className="w-10 h-10 border-4 border-white/[0.1] border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p>Carregando dados...</p>
              </div>
            )}

            {error && (
              <div className="col-span-2 text-center p-10">
                <p className="text-red-500">{error}</p>
              </div>
            )}

            {!loading && !error && currentPeriodData && progressData && (
              <>
                <ProgressCardUnified
                  icon="🔥"
                  label="Calorias"
                  value={currentPeriodData.calories?.consumed || 0}
                  unit="kcal"
                  target={`Meta: ${currentPeriodData.calories?.target || 0} kcal`}
                  progressCurrent={currentPeriodData.calories?.consumed || 0}
                  progressTarget={currentPeriodData.calories?.target || 0}
                />
                <ProgressCardUnified
                  icon="💧"
                  label="Água"
                  value={Math.round((currentPeriodData.water?.consumed_ml || 0) / 1000)}
                  unit="L"
                  target={`Meta: ${Math.round((progressData.water_goal_ml || 0) / 1000)} L`}
                  progressCurrent={currentPeriodData.water?.consumed_ml || 0}
                  progressTarget={progressData.water_goal_ml || 0}
                />
                <ProgressCardUnified
                  icon="😴"
                  label="Sono"
                  value={currentPeriodData.sleep?.hours || 0}
                  unit="h"
                  target={`Meta: ${currentPeriodData.sleep?.target_hours || 0} h`}
                  progressCurrent={currentPeriodData.sleep?.hours || 0}
                  progressTarget={currentPeriodData.sleep?.target_hours || 0}
                />
                {/* Add more progress cards here if needed, based on progressData structure */}
              </>
            )}
            {!loading && !error && (!currentPeriodData || !progressData) && (
              <div className="col-span-2 text-center p-10 text-gray-400">
                <p>Nenhum dado disponível para o período selecionado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Evolução do Peso */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-6 sm:p-4 mb-5 shadow-lg"
          style={{ display: !loading && progressData?.weight_history?.length > 0 ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold text-gray-100 m-0 mb-5 uppercase tracking-wide text-center">Evolução do Peso</h3>
          <p className="text-sm text-gray-400 m-0 mb-4 text-center">Últimos 30 dias</p>
          <div className="relative h-64 w-full my-3">
            <canvas id="weightChart" ref={weightChartRef}></canvas>
          </div>
        </div>

        {/* Resumo de Peso */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/[0.05] rounded-2xl p-6 sm:p-4 mb-5 shadow-lg"
          style={{ display: !loading && progressData?.current_weight ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold text-gray-100 m-0 mb-5 uppercase tracking-wide text-center">Resumo de Peso</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <SummaryProgressCard
              icon="⚖️"
              label="Peso Atual"
              value={progressData?.current_weight ? `${progressData.current_weight} kg` : '-'}
              target={progressData?.weight_change || '-'}
            />

            <SummaryProgressCard
              icon="📊"
              label="Registros"
              value={progressData?.weight_records || 0}
              target="pesagens em 30 dias"
            />
          </div>
        </div>
      </section>
    </div>
  );
};