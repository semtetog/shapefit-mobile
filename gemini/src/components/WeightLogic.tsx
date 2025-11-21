import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    showAppNotification?: (message: string, type: 'success' | 'error') => void;
    BASE_APP_URL?: string;
  }
}

export const WeightLogic = ({ setView }: { setView: (view: string) => void }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenElement = document.getElementById('csrf_token_main_app') as HTMLInputElement;
    if (tokenElement) {
      setCsrfToken(tokenElement.value);
    }
  }, []);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => {
    setIsModalVisible(false);
    setNewWeight('');
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewWeight(e.target.value);
  };

  const handleSaveWeight = async () => {
    if (!window.BASE_APP_URL) {
      console.error('BASE_APP_URL is not defined in the window object.');
      if (typeof window.showAppNotification === 'function') {
        window.showAppNotification('Erro: URL da API não configurada.', 'error');
      }
      return;
    }

    const apiUrl = `${window.BASE_APP_URL}/api/update_weight.php`;
    const trimmedWeight = newWeight.trim().replace(',', '.');
    const parsedWeight = parseFloat(trimmedWeight);

    if (trimmedWeight === '' || isNaN(parsedWeight) || parsedWeight <= 20 || parsedWeight >= 300) {
      if (typeof window.showAppNotification === 'function') {
        window.showAppNotification('Por favor, insira um peso válido.', 'error');
      }
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append('weight', trimmedWeight);
    if (csrfToken) {
      formData.append('csrf_token', csrfToken);
    } else {
      console.warn('CSRF token not found. The request might fail.');
    }

    try {
      const response = await fetch(apiUrl, { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocorreu um erro.');
      }

      if (typeof window.showAppNotification === 'function') {
        window.showAppNotification(data.message, 'success');
      }
      // Original behavior: full page reload. In a modern React app, you might re-fetch data or update parent state.
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      console.error('Erro ao salvar peso:', err);
      if (typeof window.showAppNotification === 'function') {
        window.showAppNotification(err.message, 'error');
      }
      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Gerenciamento de Peso</h1>
      <p className="text-lg text-gray-600 mb-8">
        Clique no botão abaixo para registrar ou atualizar seu peso.
      </p>

      <button
        onClick={openModal}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300"
      >
        Registrar Peso
      </button>

      {isModalVisible && (
        <div
          id="edit-weight-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="modal-overlay absolute inset-0 bg-gray-900 bg-opacity-75"
            onClick={closeModal}
          ></div>

          <div className="bg-white rounded-lg shadow-xl p-6 relative z-10 w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Editar Peso</h2>

            <div className="mb-4">
              <label htmlFor="new-weight-input" className="block text-gray-700 text-sm font-bold mb-2">
                Novo Peso (kg)
              </label>
              <input
                type="number"
                id="new-weight-input"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 75.5"
                value={newWeight}
                onChange={handleWeightChange}
                disabled={isSaving}
                step="0.1"
                min="20"
                max="300"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                id="close-weight-modal"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition duration-300"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                id="save-weight-btn"
                onClick={handleSaveWeight}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300"
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => setView("Dashboard")}
          className="text-blue-600 hover:underline px-4 py-2"
        >
          Voltar para o Dashboard
        </button>
      </div>
    </div>
  );
};
