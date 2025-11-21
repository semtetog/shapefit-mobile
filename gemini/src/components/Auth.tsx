import React, { useEffect, useCallback } from 'react';

// Core authentication functions (could be in a separate utility file in a real application).
// They are kept within this file to match the original single JS file structure.

const AUTH_TOKEN_KEY = 'shapefit_auth_token';

const getAuthToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

const setAuthToken = (token: string): void => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const clearAuthToken = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
};

const isAuthenticated = async (): Promise<boolean> => {
    const token = getAuthToken();
    if (!token) {
        console.log('isAuthenticated: Nenhum token encontrado');
        return false;
    }
    // As per the original logic, assume authenticated if a token exists.
    // Server verification happens during actual authenticated requests.
    return true;
};

// Helper to normalize headers from HeadersInit to a Headers object for consistent handling.
const normalizeHeaders = (headersInit?: HeadersInit): Headers => {
    const headers = new Headers();
    if (headersInit) {
        if (headersInit instanceof Headers) {
            headersInit.forEach((value, key) => headers.append(key, value));
        } else if (Array.isArray(headersInit)) {
            headersInit.forEach(([key, value]) => headers.append(key, value));
        } else { // Object literal
            Object.keys(headersInit).forEach(key => headers.append(key, headersInit[key as keyof HeadersInit] as string));
        }
    }
    return headers;
};

const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response | null> => {
    const token = getAuthToken();
    const isFormData = options.body instanceof FormData;
    
    const requestHeaders = normalizeHeaders(options.headers);
    
    if (!isFormData) {
        // Set Content-Type to application/json only if it's not FormData and not already present.
        if (!requestHeaders.has('Content-Type') && !requestHeaders.has('content-type')) {
            requestHeaders.set('Content-Type', 'application/json');
        }
    } else {
        // For FormData, the browser must set the Content-Type with the correct boundary.
        // Ensure we do not send one manually, as it will break the request.
        requestHeaders.delete('Content-Type');
        requestHeaders.delete('content-type');
    }
    
    if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
        console.log('Enviando requisição autenticada para:', url, isFormData ? '(FormData - sem Content-Type)' : '(JSON)');
    } else {
        console.warn('authenticatedFetch: Nenhum token disponível');
    }
    
    const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        body: options.body,
        ...options, // Spread existing options to include other properties like cache, mode, etc.
        headers: requestHeaders // Use the normalized and modified Headers object.
    };
    
    console.log('Fetch options:', {
        method: fetchOptions.method,
        hasBody: !!fetchOptions.body,
        isFormData: isFormData,
        headers: Array.from(requestHeaders.entries()) // Log headers as array for clarity.
    });
    
    const response = await fetch(url, fetchOptions);
    
    console.log('Response status:', response.status, 'URL:', url);
    
    if (response.status === 401) {
        console.error('Token inválido (401) - limpando token.');
        clearAuthToken();
        // The redirection due to a 401 error should typically be handled by a higher-level error handler
        // or by the component that initiated the authenticated fetch, possibly using `setView`.
        return null;
    }
    
    return response;
};


export const Auth = ({ setView }: { setView: (view: string) => void }) => {

    // `requireAuth` is defined as a useCallback because it depends on `setView` prop.
    const requireAuth = useCallback(async (): Promise<boolean> => {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            console.log('Redirecionando para Login');
            setView("Login"); // Use setView for navigation as per rule 3.
            return false;
        }
        return true;
    }, [setView]); // Dependency array for useCallback.

    // Export functions to the global window object, as per the original JavaScript file's behavior.
    useEffect(() => {
        // TODO: In a modern React application, it's generally better practice to use React Context or
        // custom hooks to provide authentication utilities instead of polluting the global window object.
        // This approach is taken here to adhere to the legacy behavior of exporting functions globally.

        (window as any).getAuthToken = getAuthToken;
        (window as any).setAuthToken = setAuthToken;
        (window as any).clearAuthToken = clearAuthToken;
        (window as any).isAuthenticated = isAuthenticated;
        // `requireAuth` is dependent on the `setView` prop, which is part of React's lifecycle.
        // Assigning it directly to `window` means it might lose its `setView` context if not managed carefully.
        // For strict adherence to the request, it's assigned, but this limitation is noted.
        (window as any).requireAuth = requireAuth; 
        (window as any).authenticatedFetch = authenticatedFetch;

        return () => {
            // Clean up global objects when the component unmounts to prevent memory leaks in SPAs.
            delete (window as any).getAuthToken;
            delete (window as any).setAuthToken;
            delete (window as any).clearAuthToken;
            delete (window as any).isAuthenticated;
            delete (window as any).requireAuth;
            delete (window as any).authenticatedFetch;
        };
    }, [requireAuth]); // `requireAuth` is a dependency because it's a memoized callback.


    // Side effect for loading `page-transitions.js` and `network-monitor.js`.
    useEffect(() => {
        // TODO: Re-evaluate the need for dynamic script loading in a modern React application.
        // External scripts can lead to global side effects that are hard to manage in React.
        // Consider integrating their functionalities via npm packages or React-specific solutions,
        // or ensure they are properly loaded and scoped if they are truly global utilities.

        const loadScript = (src: string, id: string | null = null): Promise<void> => {
            return new Promise((resolve, reject) => {
                const existingScript = id ? document.getElementById(id) : document.querySelector(`script[src="${src}"]`);
                if (existingScript) {
                    resolve(); // Script is already loaded or being loaded.
                    return;
                }

                const script = document.createElement('script');
                script.src = src;
                if (id) script.id = id;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.head.appendChild(script);
            });
        };

        // Load `page-transitions.js`.
        // The original logic checked for `(window as any).pageTransitionsLoaded`.
        if (!(window as any).pageTransitionsLoaded) {
            loadScript('./assets/js/page-transitions.js')
                .then(() => { (window as any).pageTransitionsLoaded = true; })
                .catch(() => loadScript('../assets/js/page-transitions.js'))
                .then(() => { (window as any).pageTransitionsLoaded = true; })
                .catch(error => console.warn('Failed to load page-transitions.js:', error.message));
        }

        // Load `network-monitor.js`.
        loadScript('./assets/js/network-monitor.js', 'network-monitor-script')
            .catch(() => loadScript('../assets/js/network-monitor.js', 'network-monitor-script'))
            .catch(error => console.warn('Failed to load network-monitor.js:', error.message));

    }, []); // Empty dependency array ensures this effect runs only once on mount and cleans up on unmount.

    // This component primarily serves as a logical wrapper for authentication functionality and script initialization.
    // Since the input was a JavaScript file with no HTML, it does not render any visible UI directly.
    // A minimal, screen-reader-only div is returned to satisfy React component rendering requirements.
    return (
        <div className="sr-only">
            {/* The actual authentication UI (e.g., login form, user dashboard) would typically be rendered
                by other components that consume the authentication state and functions, possibly via React Context. */}
        </div>
    );
};
