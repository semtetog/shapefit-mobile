import React, { useEffect, useState, useRef, useCallback } from 'react';

// TODO: Implement authentication functions (e.g., using Context API or Redux)
const getAuthToken = (): string | null => {
    // return localStorage.getItem('authToken');
    console.warn('TODO: getAuthToken() not implemented.');
    return null;
};

const clearAuthToken = (): void => {
    // localStorage.removeItem('authToken');
    console.warn('TODO: clearAuthToken() not implemented.');
};

// TODO: Implement requireAuth function (e.g., check token validity with backend)
const requireAuth = async (): Promise<boolean> => {
    console.warn('TODO: requireAuth() not implemented. Returning true for now.');
    return true; // Simulate authenticated
};


export const Common = ({ setView }: { setView: (view: string) => void }) => {
    // --- State and Refs for component lifecycle and global-like variables --- 
    const BASE_APP_URL_REF = useRef<string | null>(null);
    const [serverDate, setServerDate] = useState<string | null>(null);

    // --- Utility Functions (extracted from common.js) --- 

    // Função helper para fazer requisições autenticadas
    const apiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
        const token = getAuthToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (response.status === 401) {
                clearAuthToken();
                setView('Login'); // Use setView instead of window.location.href
                return null;
            }

            return response;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }, [setView]); // Depend on setView for useCallback

    // Função helper para escape HTML
    const escapeHtml = useCallback((text: string | null | undefined): string => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }, []);

    // Função para obter data local no formato YYYY-MM-DD (não UTC)
    const getLocalDateString = useCallback((date: Date | null = null): string => {
        const d = date ? new Date(date) : new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    // Função para adicionar/subtrair dias (local)
    const addDaysLocal = useCallback((dateStr: string, days: number): string => {
        const d = new Date(dateStr + 'T00:00:00'); // Ensure local date interpretation
        d.setDate(d.getDate() + days);
        return getLocalDateString(d);
    }, [getLocalDateString]);

    // Função helper para formatar data
    const formatDate = useCallback((dateStr: string): string => {
        const date = new Date(dateStr);
        const todayStr = getLocalDateString();
        const yesterdayStr = addDaysLocal(todayStr, -1);

        if (dateStr === todayStr) {
            return 'Hoje';
        } else if (dateStr === yesterdayStr) {
            return 'Ontem';
        } else {
            return date.toLocaleDateString('pt-BR');
        }
    }, [getLocalDateString, addDaysLocal]);

    // Função para obter data/hora do servidor (para validações críticas)
    // IMPORTANTE: Use esta função para validações que não podem ser burladas pelo cliente
    // (ex: restrição de 7 dias para atualizar peso)
    const getServerDateFn = useCallback(async (): Promise<string> => {
        const SERVER_DATE_CACHE_DURATION = 60000; // Cache por 1 minuto
        
        // Note: For a real app, this cache might be better managed in a global store
        // or a custom hook if this function is called frequently across components.
        // For this single component, we'll use useRef for internal cache state.
        const serverDateCacheRef = useRef<{ date: string | null; time: number | null }>({ date: null, time: null });

        // Se temos cache válido, retornar
        if (serverDateCacheRef.current.date && serverDateCacheRef.current.time && (Date.now() - serverDateCacheRef.current.time) < SERVER_DATE_CACHE_DURATION) {
            return serverDateCacheRef.current.date;
        }

        try {
            const baseUrl = BASE_APP_URL_REF.current || '';
            const response = await fetch(`${baseUrl}/api/get_server_time.php`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken() || ''}`
                }
            });

            if (response && response.ok) {
                const result = await response.json();
                if (result.success && result.server_date) {
                    serverDateCacheRef.current = { date: result.server_date, time: Date.now() };
                    console.log('[Server Date] Data do servidor obtida:', serverDateCacheRef.current.date);
                    return serverDateCacheRef.current.date;
                }
            }
        } catch (error) {
            console.warn('[Server Date] Erro ao obter data do servidor, usando data local:', error);
        }

        // Fallback: usar data local (mas avisar que não é seguro para validações)
        const localDate = getLocalDateString();
        console.warn('[Server Date] Usando data local como fallback (não seguro para validações críticas):', localDate);
        return localDate;
    }, [getLocalDateString]);


    // --- useEffect for initial setup (like the IIFE in common.js) --- 
    useEffect(() => {
        // Initialize BASE_APP_URL if not defined
        if (!BASE_APP_URL_REF.current) {
            const origin = window.location.origin;
            const pathSegments = window.location.pathname.split('/');
            let basePath = pathSegments.slice(0, -1).join('/');
            if (basePath.endsWith('/')) {
                basePath = basePath.slice(0, -1);
            }
            BASE_APP_URL_REF.current = origin + basePath;
            console.log("BASE_APP_URL initialized:", BASE_APP_URL_REF.current);
        }

        // Check authentication
        const publicPages = ['login', 'register', 'index']; // Using view names instead of .html
        const currentView = window.location.pathname.split('/').pop()?.replace('.html', '') || 'index'; // Dummy for example

        if (!publicPages.includes(currentView)) {
            requireAuth().then(authenticated => {
                if (!authenticated) {
                    setView('Login'); // Redirect if not authenticated
                }
            });
        }

        // Example of fetching server date
        getServerDateFn().then(date => setServerDate(date));

        // Note: In a real React app, these utilities would likely be 
        // provided via a Context Provider or imported as standalone functions, 
        // rather than being defined inside a component like this (unless they depend 
        // heavily on component state/props). 
        // For this exercise, defining them inside and using useCallback 
        // fulfills the requirement of converting the common.js file into a component.
    }, [setView, getServerDateFn]);

    // --- Render part --- 
    return (
        <div className="p-6 bg-gray-100 min-h-screen font-sans">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Common Utilities Component</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Authentication & Navigation</h2>
                <p className="text-gray-600 mb-2">
                    This component integrates common utility functions, including API request handling and authentication checks.
                </p>
                <div
                    onClick={() => setView("Dashboard")}
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mr-2 transition-colors duration-200"
                >
                    Go to Dashboard
                </div>
                <div
                    onClick={() => setView("Login")}
                    className="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer transition-colors duration-200"
                >
                    Simulate Logout
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Date Utilities Example</h2>
                <p className="text-gray-600 mb-1">
                    Today's local date: <span className="font-mono text-blue-700 text-sm">{getLocalDateString()}</span>
                </p>
                <p className="text-gray-600 mb-1">
                    Tomorrow's local date: <span className="font-mono text-blue-700 text-sm">{addDaysLocal(getLocalDateString(), 1)}</span>
                </p>
                <p className="text-gray-600 mb-1">
                    Formatted 'Today': <span className="font-mono text-green-700 text-sm">{formatDate(getLocalDateString())}</span>
                </p>
                <p className="text-gray-600 mb-1">
                    Formatted 'Yesterday': <span className="font-mono text-green-700 text-sm">{formatDate(addDaysLocal(getLocalDateString(), -1))}</span>
                </p>
                <p className="text-gray-600">
                    Server Date (cached for 1 min): <span className="font-mono text-purple-700 text-sm">{serverDate || 'Loading...'}</span>
                </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">HTML Escaping Example</h2>
                <p className="text-gray-600 mb-1">
                    Original text: <span className="font-mono text-gray-800 text-sm">{'<script>alert("XSS")</script>'}</span>
                </p>
                <p className="text-gray-600">
                    Escaped text: <span className="font-mono text-gray-800 text-sm">{escapeHtml('<script>alert("XSS")</script>')}</span>
                </p>
            </div>

            {/* TODO: Add an example usage for apiRequest if needed, perhaps triggered by a button */}
        </div>
    );
};