import React, { useEffect } from 'react';

export const Index = ({ setView }: { setView: (view: string) => void }) => {
  // Original script was redirecting to main_app.html
  // We use useEffect to trigger the navigation via setView prop
  useEffect(() => {
    // Assuming 'MainApp' is the target view name for main_app.html
    setView("MainApp");
  }, [setView]);

  // No need for www-config.js in a React component in this context
  // TODO: If www-config.js contains critical global configurations, they might need to be migrated
  //       to React context, environment variables, or other React-friendly patterns.

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-gray-700">Carregando...</p>
    </div>
  );
};