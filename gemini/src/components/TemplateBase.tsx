import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    BASE_APP_URL?: string;
  }
}

export const TemplateBase = ({ setView }: { setView: (view: string) => void }) => {

  const alertContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // --- Script Critical - Define altura real do viewport ---
    const setRealViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setRealViewportHeight();
    window.addEventListener('resize', setRealViewportHeight);

    // For orientationchange, wrap it in a function to allow cleanup
    const handleOrientationChange = () => {
      setTimeout(setRealViewportHeight, 100);
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    // --- Prevent iOS scroll ---
    const handleTouchMove = (event: TouchEvent) => {
      const scrollable = (event.target as HTMLElement).closest('.app-container, .container');
      if (!scrollable) {
        event.preventDefault();
      }
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    const preventIOSScrollFocus = () => { setTimeout(() => { window.scrollTo(0, 0); }, 0); };
    const preventIOSScrollBlur = () => { window.scrollTo(0, 0); };
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focusin', preventIOSScrollFocus);
      input.addEventListener('blur', preventIOSScrollBlur);
    });

    // --- Script para detectar Android ---
    const detectAndroid = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isAndroid = /android/i.test(userAgent);
      if (isAndroid) {
        document.body.classList.add('android-mobile');
      }
    };
    detectAndroid(); // Run immediately

    // --- Global event listeners from DOMContentLoaded ---
    const handleContextMenu = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a, button, .btn, [role="button"]');
      if (target) {
        e.preventDefault();
      }
    };
    const handleSelectStart = (e: Event) => {
      const target = (e.target as HTMLElement).closest('a, button, .btn, [role="button"]');
      if (target) {
        e.preventDefault();
      }
    };
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // --- Cleanup function for useEffect ---
    return () => {
      window.removeEventListener('resize', setRealViewportHeight);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('touchmove', handleTouchMove);

      inputs.forEach(input => {
        input.removeEventListener('focusin', preventIOSScrollFocus);
        input.removeEventListener('blur', preventIOSScrollBlur);
      });

      document.body.classList.remove('android-mobile'); // Clean up class if added

      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // --- Service Worker ---
  // TODO: Implement Service Worker registration in public/index.html or root App.tsx
  // if ('serviceWorker' in navigator) {
  //     window.addEventListener('load', function() {
  //         navigator.serviceWorker.register('./sw.js')
  //             .then(function(registration) {
  //                 console.log('ServiceWorker registrado:', registration.scope);
  //             })
  //             .catch(function(error) {
  //                 console.log('Falha no registro do ServiceWorker:', error);
  //             });
  //     });
  // }

  // --- Global Variables (www-config.js and fallback) ---
  // This logic is ported to useEffect, assuming BASE_APP_URL is a global script property.
  // For a React app, consider using environment variables or a Context Provider.
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.BASE_APP_URL) {
      let baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      window.BASE_APP_URL = baseUrl;
      console.log('[template_base] BASE_APP_URL (fallback):', window.BASE_APP_URL);
    }
  }, []);

  // --- Auth Script ---
  // TODO: `auth.js` likely contains global authentication logic.
  // This should be refactored into React Context, Redux, or a custom hook for authentication.
  // Loading it via script tag within a component is not a React idiomatic way.

  // --- Global Styles (`body`, `a, button, .btn, [role="button"]`) ---
  // TODO: Global styles for user-select and tap-highlight-color should be moved to global CSS (e.g., index.css or equivalent).
  // Example of global CSS:
  // body { -webkit-user-select: none; -ms-user-select: none; user-select: none; -webkit-touch-callout: none; }
  // a, button, .btn, [role="button"] { -webkit-touch-callout: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }

  return (
    <div className="relative min-h-screen font-montserrat" style={{ '--vh': '1vh' } as React.CSSProperties}> 
      <div className="fixed inset-0 z-0 bg-gray-100 dark:bg-gray-900">
      </div>

      <div id="alert-container" ref={alertContainerRef} className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        {/* Alerts will be rendered here via React Portals or similar alert system */}
      </div>

      {/* Conteúdo principal da página começa aqui */}
      <div className="relative z-10">
        {/* Placeholder for the actual page content that was truncated in the input HTML */}
        <p className="p-4 text-center text-gray-700 dark:text-gray-300">
          Conteúdo principal da página (truncado no input)
          <br />
          Exemplo de navegação:
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            onClick={() => setView("OutraPagina")}
          >
            Ir para Outra Página
          </button>
        </p>
      </div>

      {/* Script libraries (jQuery, Chart.js, Lottie) */}
      {/* TODO: In a React project, these libraries would typically be installed via npm and imported. */}
      {/* For instance, Chart.js would be used in a component responsible for rendering charts. */}
      {/* Lottie would be used in a component displaying animations. */}
      {/* Direct script loading is an anti-pattern in React and should be refactored. */}
    </div>
  );
};