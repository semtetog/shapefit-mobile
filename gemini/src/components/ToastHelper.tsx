import { Toast } from '@capacitor/toast';
import React from 'react';

const showNativeToast = (text: string) => {
  Toast.show({
    text,
    duration: 'short',
    position: 'bottom'
  });
};

export const ToastHelper = ({ setView }: { setView: (view: string) => void }) => {
  const handleShowToast = () => {
    showNativeToast('This is a native toast from ToastHelper!');
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Toast Helper Component</h1>
      <p className="text-lg mb-8 text-center max-w-md">Demonstrates how to trigger a native toast and navigate using the setView prop.</p>
      
      <div className="flex space-x-4 mb-8">
        <button
          onClick={handleShowToast}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Show Native Toast
        </button>
        
        <button
          onClick={() => setView('AnotherPage')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Go to Another Page
        </button>
      </div>

      <div className="w-full max-w-xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Click 'Show Native Toast' to see a Capacitor toast appear at the bottom.</li>
          <li>Click 'Go to Another Page' to simulate navigation using the <code>setView</code> prop.</li>
        </ul>
      </div>
    </div>
  );
};
