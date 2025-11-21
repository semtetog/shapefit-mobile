import React, { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  LineController,
  BarElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components and scales
Chart.register(
  BarController,
  LineController,
  BarElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Title
);

export const ProgressLogic = ({ setView }: { setView: (view: string) => void }) => {
  const consumptionChartRef = useRef<HTMLCanvasElement>(null);
  const weightChartRef = useRef<HTMLCanvasElement>(null);
  const consumptionChartInstance = useRef<Chart | null>(null);
  const weightChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Mock data based on the structure expected from original HTML script tags
    // TODO: Implement actual data fetching or parsing from a global state/context if this data is dynamic
    const consumptionData = {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      protein: [65, 59, 80, 81, 56, 55, 40],
      fat: [28, 48, 40, 19, 86, 27, 90],
      carbs: [12, 12, 10, 15, 20, 18, 15]
    };

    const weightData = [
      { x: '2023-10-01', y: 70 },
      { x: '2023-10-02', y: 70.5 },
      { x: '2023-10-03', y: 71 },
      { x: '2023-10-04', y: 70.8 },
      { x: '2023-10-05', y: 71.2 },
      { x: '2023-10-06', y: 71 },
      { x: '2023-10-07', y: 71.5 }
    ];

    // Default styles for charts
    Chart.defaults.font.family = 'Poppins, sans-serif';
    Chart.defaults.color = '#A0A0A0';

    // --- GRÁFICO DE CONSUMO (BARRAS EMPILHADAS) ---
    if (consumptionChartRef.current) {
      // Destroy previous instance to prevent memory leaks/re-render issues
      if (consumptionChartInstance.current) {
        consumptionChartInstance.current.destroy();
      }
      const consumptionCtx = consumptionChartRef.current.getContext('2d');
      if (consumptionCtx) {
        consumptionChartInstance.current = new Chart(consumptionCtx, {
          type: 'bar',
          data: {
            labels: consumptionData.labels,
            datasets: [{
              label: 'Proteína',
              data: consumptionData.protein,
              backgroundColor: '#34aadc',
              borderColor: '#34aadc',
              borderWidth: 1
            }, {
              label: 'Gordura',
              data: consumptionData.fat,
              backgroundColor: '#f0ad4e',
              borderColor: '#f0ad4e',
              borderWidth: 1
            }, {
              label: 'Carboidrato',
              data: consumptionData.carbs,
              backgroundColor: '#A0A0A0',
              borderColor: '#A0A0A0',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }, // Legenda customizada no HTML (assumindo que o componente a gerencia)
            scales: {
              x: {
                stacked: true,
                grid: { display: false }
              },
              y: {
                stacked: true,
                beginAtZero: true,
                grid: { color: '#333333' }
              }
            }
          }
        });
      }
    }

    // --- GRÁFICO DE PESO (LINHAS) ---
    if (weightChartRef.current) {
      // Destroy previous instance to prevent memory leaks/re-render issues
      if (weightChartInstance.current) {
        weightChartInstance.current.destroy();
      }
      const weightCtx = weightChartRef.current.getContext('2d');
      if (weightCtx) {
        weightChartInstance.current = new Chart(weightCtx, {
          type: 'line',
          data: {
            datasets: [{
              label: 'Peso (kg)',
              data: weightData,
              fill: false,
              borderColor: '#FF6B00',
              tension: 0.4, // Suaviza a linha
              pointRadius: 4,
              pointBackgroundColor: '#FF6B00'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                type: 'time',
                time: { unit: 'day' },
                grid: { display: false }
              },
              y: {
                beginAtZero: false, // Não precisa começar em 0kg
                grid: { color: '#333333' }
              }
            }
          }
        });
      }
    }

    // Cleanup function: destroy chart instances on component unmount
    return () => {
      if (consumptionChartInstance.current) {
        consumptionChartInstance.current.destroy();
      }
      if (weightChartInstance.current) {
        weightChartInstance.current.destroy();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header/Navigation */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Progresso</h1>
          <button
            onClick={() => setView("Dashboard")}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Consumption Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Consumo Diário (g)</h2>
            <div className="relative h-64"> {/* Tailwind class for responsive height */}
              <canvas ref={consumptionChartRef} id="consumptionChart"></canvas>
            </div>
            {/* Custom Legend for Consumption Chart (as mentioned in original JS options) */}
            <div className="flex justify-center space-x-4 mt-4 text-sm">
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#34aadc] rounded-full mr-2"></span> Proteína
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#f0ad4e] rounded-full mr-2"></span> Gordura
              </span>
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-[#A0A0A0] rounded-full mr-2"></span> Carboidrato
              </span>
            </div>
          </div>

          {/* Weight Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Progresso de Peso (kg)</h2>
            <div className="relative h-64"> {/* Tailwind class for responsive height */}
              <canvas ref={weightChartRef} id="weightChart"></canvas>
            </div>
          </div>
        </div>

        {/* Example of another navigation button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setView("Settings")}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ver Configurações
          </button>
        </div>
      </div>
    </div>
  );
};