import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface PointsHistoryProps {
  setView: (view: string) => void;
  // Assuming authenticatedFetch is a utility or passed via context/props
  // For this component, we'll mock it or leave a TODO.
  authenticatedFetch?: (url: string, options?: RequestInit) => Promise<Response | undefined>;
}

// Mocks for external dependencies, as per rule 6
// TODO: Replace with actual authenticatedFetch implementation
const mockAuthenticatedFetch = async (url: string, options?: RequestInit): Promise<Response | undefined> => {
  console.log('Mock authenticatedFetch called with:', url, options);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate different responses based on URL/month
  const urlParams = new URLSearchParams(url.split('?')[1]);
  const month = urlParams.get('month');

  if (month === '2023-10') {
    return new Response(JSON.stringify({
      success: true,
      data: {
        user_points: 12345,
        level: {
          name: 'Atleta Elite',
          progress_percentage: 75,
          is_max_level: false,
          points_remaining: 500
        },
        available_months: [
          { month_key: '2024-03', month_display: 'Março de 2024' },
          { month_key: '2024-02', month_display: 'Fevereiro de 2024' },
          { month_key: '2024-01', month_display: 'Janeiro de 2024' },
          { month_key: '2023-12', month_display: 'Dezembro de 2023' },
          { month_key: '2023-11', month_display: 'Novembro de 2023' },
          { month_key: '2023-10', month_display: 'Outubro de 2023' }
        ],
        points_log: [
          {
            date: '2023-10-26',
            entries: [
              { timestamp: '2023-10-26T14:30:00Z', points_awarded: 500, details: { icon: 'fa-running', text: 'Treino Concluído', color: '#1E88E5' } },
              { timestamp: '2023-10-26T10:00:00Z', points_awarded: 100, details: { icon: 'fa-check-circle', text: 'Check-in Diário', color: '#4CAF50' } }
            ]
          },
          {
            date: '2023-10-25',
            entries: [
              { timestamp: '2023-10-25T19:00:00Z', points_awarded: 300, details: { icon: 'fa-utensils', text: 'Refeição Saudável', color: '#FFC107' } }
            ]
          }
        ]
      }
    }), { status: 200 });
  } else if (month === '2024-02') {
     return new Response(JSON.stringify({
      success: true,
      data: {
        user_points: 2500,
        level: {
          name: 'Iniciante Fitness',
          progress_percentage: 25,
          is_max_level: false,
          points_remaining: 1500
        },
        available_months: [
          { month_key: '2024-03', month_display: 'Março de 2024' },
          { month_key: '2024-02', month_display: 'Fevereiro de 2024' },
          { month_key: '2024-01', month_display: 'Janeiro de 2024' },
          { month_key: '2023-12', month_display: 'Dezembro de 2023' },
          { month_key: '2023-11', month_display: 'Novembro de 2023' },
          { month_key: '2023-10', month_display: 'Outubro de 2023' }
        ],
        points_log: [
          {
            date: '2024-02-15',
            entries: [
              { timestamp: '2024-02-15T08:00:00Z', points_awarded: 100, details: { icon: 'fa-dumbbell', text: 'Treino de Força', color: '#8BC34A' } }
            ]
          }
        ]
      }
    }), { status: 200 });
  } else if (month === '2024-03') {
    return new Response(JSON.stringify({
      success: true,
      data: {
        user_points: 50000,
        level: {
          name: 'Mestre Fitness',
          progress_percentage: 100,
          is_max_level: true,
          points_remaining: 0
        },
        available_months: [
          { month_key: '2024-03', month_display: 'Março de 2024' },
          { month_key: '2024-02', month_display: 'Fevereiro de 2024' },
          { month_key: '2024-01', month_display: 'Janeiro de 2024' }
        ],
        points_log: [] // Empty log for max level example
      }
    }), { status: 200 });
  }
  
  return new Response(JSON.stringify({
    success: true,
    data: {
      user_points: 0,
      level: {
        name: 'Iniciante',
        progress_percentage: 0,
        is_max_level: false,
        points_remaining: 1000
      },
      available_months: [
        { month_key: '2024-03', month_display: 'Março de 2024' },
        { month_key: '2024-02', month_display: 'Fevereiro de 2024' },
        { month_key: '2024-01', month_display: 'Janeiro de 2024' }
      ],
      points_log: []
    }
  }), { status: 200 });
};

export const PointsHistory = ({ setView, authenticatedFetch = mockAuthenticatedFetch }: PointsHistoryProps) => {
  const getLocalMonthString = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const [pointsData, setPointsData] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('month') || getLocalMonthString();
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: `BASE_APP_URL` would ideally come from a config or environment variable.
  // For now, we'll hardcode a placeholder or assume relative API paths work.
  const BASE_APP_URL = "/api"; // Placeholder, adjust as needed

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: The `requireAuth()` call from the original HTML would happen upstream
        // or `authenticatedFetch` would handle the authentication state.
        const response = await authenticatedFetch(`${BASE_APP_URL}/get_points_history_data.php?month=${currentMonth}`);
        if (!response) {
          throw new Error('No response from fetch.');
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Erro ao carregar dados');
        }

        setPointsData(result.data);
      } catch (err: any) {
        console.error('Erro ao carregar histórico:', err);
        setError(err.message || 'Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, authenticatedFetch, BASE_APP_URL]);

  const formatNumber = useCallback((num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00'); // Ensure date is parsed as UTC to avoid timezone issues for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const inputDate = new Date(dateStr + 'T00:00:00');
    inputDate.setHours(0, 0, 0, 0);
    
    if (inputDate.getTime() === today.getTime()) {
      return 'Hoje';
    } else if (inputDate.getTime() === yesterday.getTime()) {
      return 'Ontem';
    } else {
      const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return days[date.getDay()] + ', ' + date.getDate() + ' de ' + months[date.getMonth()];
    }
  }, []);

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const escapeHtml = useCallback((text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }, []);

  const handleMonthChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(event.target.value);
    // Optionally update URL param without full page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('month', event.target.value);
    window.history.pushState({ path: newUrl.href }, '', newUrl.href);
  }, []);

  const feedContent = useMemo(() => {
    if (loading) {
      return (
        <div className="text-center py-10 px-5 opacity-70 text-gray-400">
          <div className="spinner animate-spin inline-block w-8 h-8 border-4 border-t-4 border-gray-200 border-opacity-50 rounded-full"></div>
          <p className="mt-4">Carregando histórico...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 px-5 opacity-70 text-gray-400">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p>Erro ao carregar dados. Tente novamente.</p>
        </div>
      );
    }

    if (!pointsData || !pointsData.points_log || pointsData.points_log.length === 0) {
      return (
        <div className="text-center py-10 px-5 opacity-70 text-gray-400">
          <i className="fas fa-calendar-times text-4xl mb-4"></i>
          <h3 className="text-xl font-semibold mt-4">Nenhuma Atividade</h3>
          <p className="mt-2">Não há registros de pontos para este período.</p>
        </div>
      );
    }

    return (
      <>
        {pointsData.points_log.map((group: any) => (
          <React.Fragment key={group.date}>
            <div className="text-sm font-semibold text-gray-400 mt-6 mb-3">
              {formatDate(group.date)}
            </div>
            <div className="bg-zinc-800 rounded-2xl">
              {group.entries.map((entry: any, index: number) => {
                const details = entry.details || { icon: 'fa-question-circle', text: 'Ação registrada', color: '#A0A0A0' };
                return (
                  <div
                    key={entry.timestamp + index}
                    className={`flex items-center p-3 md:p-4 gap-3 border-b border-zinc-700 ${index === group.entries.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${details.color}20` }}
                    >
                      <i className={`fas ${details.icon} text-lg`} style={{ color: details.color }}></i>
                    </div>
                    <div className="flex-grow">
                      <p className="m-0 font-medium text-white">{escapeHtml(details.text)}</p>
                      <span className="text-sm text-gray-400">{formatTime(entry.timestamp)}</span>
                    </div>
                    <span className="font-semibold text-base text-green-500">+{formatNumber(entry.points_awarded)}</span>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </>
    );
  }, [loading, error, pointsData, formatDate, formatTime, formatNumber, escapeHtml]);

  return (
    <div className="bg-zinc-900 min-h-screen text-white font-montserrat">
      <div className="max-w-md mx-auto py-6 md:py-8 min-h-screen box-border px-0">
        <div className="flex items-center gap-4 px-6 mb-8 pt-safe">
          <button
            type="button"
            onClick={() => setView("MainApp")}
            className="text-2xl text-white focus:outline-none"
            aria-label="Voltar à página principal"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-3xl font-bold m-0">Minha Jornada</h1>
        </div>

        <div className="px-6 pb-10 pb-safe">
          <div className="bg-zinc-800 rounded-2xl p-5 mb-6">
            <div className="text-center mb-4">
              <span className="text-6xl font-bold leading-none text-white" id="points-value">
                {pointsData ? formatNumber(pointsData.user_points) : '0'}
              </span>
              <span className="block text-sm font-semibold text-gray-400 tracking-wider mt-1">PONTOS</span>
            </div>
            <div className="hero-level-progress">
              <div className="flex justify-between items-center mb-3">
                <span className="bg-zinc-700/30 text-orange-500 px-3 py-1.5 rounded-lg font-semibold text-sm">
                  {pointsData?.level?.name || '-'}
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-700/30 rounded-md overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-md transition-all duration-500 ease-in-out"
                  style={{ width: pointsData ? `${pointsData.level.progress_percentage}%` : '0%' }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 text-center mt-2">
                {pointsData?.level?.is_max_level
                  ? 'Você está no nível máximo!'
                  : pointsData?.level?.points_remaining !== undefined
                    ? `Faltam ${formatNumber(pointsData.level.points_remaining)} pontos...`
                    : 'Carregando...'}
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-xl p-3">
            <select
              id="month-filter"
              value={currentMonth}
              onChange={handleMonthChange}
              className="w-full bg-zinc-700/30 border border-zinc-700 text-white rounded-lg px-3 py-2 text-base appearance-none cursor-pointer focus:outline-none focus:border-orange-500"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FF7A1A' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '12px',
                paddingRight: '40px' // Adjust padding to prevent text overlapping arrow
              }}
            >
              {loading && <option>Carregando...</option>}
              {!loading && pointsData?.available_months?.length > 0 ? (
                pointsData.available_months.map((month: any) => (
                  <option key={month.month_key} value={month.month_key}>
                    {month.month_display}
                  </option>
                ))
              ) : (
                !loading && <option>Nenhum mês disponível</option>
              )}
            </select>
          </div>

          <div className="mt-6">
            {feedContent}
          </div>
        </div>
      </div>
    </div>
  );
};
