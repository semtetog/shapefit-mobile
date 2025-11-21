import React, { useEffect, useRef } from 'react';

export const AppState = ({ setView }: { setView: (view: string) => void }) => {
  const dataCacheRef = useRef(new Map<string, { data: any; timestamp: number }>());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  useEffect(() => {
    const dataCache = dataCacheRef.current;

    const cachePageData = (pageKey: string, data: any) => {
      dataCache.set(pageKey, {
        data: data,
        timestamp: Date.now()
      });
    };

    const getCachedPageData = (pageKey: string) => {
      const cached = dataCache.get(pageKey);
      if (!cached) return null;

      const age = Date.now() - cached.timestamp;
      if (age > CACHE_DURATION) {
        dataCache.delete(pageKey);
        return null;
      }
      return cached.data;
    };

    const clearPageCache = (pageKey?: string) => {
      if (pageKey) {
        dataCache.delete(pageKey);
      } else {
        dataCache.clear();
      }
    };

    const shouldReloadData = (pageKey: string) => {
      const cached = getCachedPageData(pageKey);
      if (!cached) return true;
      const age = Date.now() - cached.timestamp;
      return age > 30000; // 30 segundos
    };

    // Expose functions globally as per original JS, but note this is generally discouraged in React.
    (window as any).cachePageData = cachePageData;
    (window as any).getCachedPageData = getCachedPageData;
    (window as any).clearPageCache = clearPageCache;
    (window as any).shouldReloadData = shouldReloadData;

    let wasHidden = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHidden = true;
      } else if (wasHidden) {
        wasHidden = false;
        // App voltou do segundo plano - mantendo estado
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        console.log('[App State] Página restaurada do cache - mantendo estado');
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      // Optional: Clean up global assignments if this component were frequently mounted/unmounted
      // delete (window as any).cachePageData;
      // delete (window as any).getCachedPageData;
      // delete (window as any).clearPageCache;
      // delete (window as any).shouldReloadData;
    };
  }, []); // Empty dependency array ensures this runs once on mount, mimicking the IIFE

  // This component's primary function is to initialize global state management
  // and event listeners, not to render visual UI based on the original input.
  // The `setView` prop is provided but not utilized by this specific component's logic.
  return (
    <div className="hidden">
      {/* This component handles global app state and does not render visible UI. */}
    </div>
  );
};