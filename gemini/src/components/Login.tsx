import React, { useState, useEffect } from 'react';

// Assumimos que o Font Awesome CSS está globalmente disponível ou importado no seu projeto principal.
// Ex: import '@fortawesome/fontawesome-free/css/all.min.css';

// Funções de autenticação mock para este componente. Em uma aplicação real, elas seriam importadas
// de um serviço de autenticação ou de um contexto global.
const setAuthToken = (token: string) => { console.log('Salvando token:', token); localStorage.setItem('authToken', token); };
const getAuthToken = () => { console.log('Recuperando token...'); return localStorage.getItem('authToken'); };

export const Login = ({ setView }: { setView: (view: string) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formErrorMessage, setFormErrorMessage] = useState('');
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // TODO: Lógica do Service Worker do HTML original. Isso geralmente pertence ao nível raiz da aplicação
    // (por exemplo, index.tsx ou App.tsx) e seria gerenciado por uma ferramenta de build ou bibliotecas PWA específicas.
    useEffect(() => {
        /*
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('../sw.js?v=7')
                    .then(function(registration) {
                        console.log('ServiceWorker registrado:', registration.scope);
                        setInterval(function() { registration.update(); }, 1000);
                        registration.addEventListener('updatefound', function() {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    window.location.reload();
                                }
                            });
                        });
                    })
                    .catch(function(error) {
                        console.log('Falha no registro do ServiceWorker:', error);
                    });
                window.addEventListener('focus', function() {
                    navigator.serviceWorker.getRegistration().then(function(registration) {
                        if (registration) { registration.update(); }
                    });
                });
            });
        }
        */

        // TODO: Variáveis CSS e estilos globais (por exemplo, --vh, background do body, font-family)
        // Estes são tipicamente tratados pela configuração do Tailwind ou arquivos CSS globais.
        // Por exemplo, a fonte Montserrat precisaria ser adicionada ao tailwind.config.js.
        /*
        function setRealViewportHeight() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        window.addEventListener('resize', setRealViewportHeight);
        setRealViewportHeight();
        document.body.addEventListener('touchmove', function(event) { event.preventDefault(); }, { passive: false });
        */

        // TODO: Lógica de prevenção de rolagem do iOS - pode entrar em conflito com inputs controlados do React ou ser desnecessária com o comportamento moderno de rolagem.
        /*
        (function preventIOSScroll() {
            const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
            inputs.forEach(input => {
                input.addEventListener('focusin', () => { setTimeout(() => { window.scrollTo(0, 0); }, 0); });
                input.addEventListener('blur', () => { window.scrollTo(0, 0); });
            });
        })();
        */

        // Cleanup para listeners de eventos, se adicionados
        return () => {
            // window.removeEventListener('resize', setRealViewportHeight);
            // document.body.removeEventListener('touchmove', ...);
        };
    }, []); // Array de dependências vazio significa que isso é executado uma vez na montagem

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setFormErrorMessage('');
        setEmailErrorMessage('');
        setPasswordErrorMessage('');

        let hasErrors = false;
        if (!email || !email.includes('@')) {
            setEmailErrorMessage('Por favor, insira um email válido.');
            hasErrors = true;
        }
        if (!password) {
            setPasswordErrorMessage('Por favor, insira sua senha.');
            hasErrors = true;
        }

        if (hasErrors) return;

        setIsLoading(true);

        try {
            // Assumimos que BASE_APP_URL está disponível como uma variável de ambiente ou via contexto.
            // Usamos import.meta.env.VITE_BASE_APP_URL para projetos Vite, com fallback.
            const BASE_APP_URL = import.meta.env.VITE_BASE_APP_URL || window.location.origin;
            const response = await fetch(`${BASE_APP_URL}/api/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success && result.token) {
                setAuthToken(result.token);
                console.log('Token salvo:', getAuthToken() ? 'SIM' : 'NÃO');

                if (result.user && result.user.onboarding_complete) {
                    setView("MainApp"); // Navega para o componente MainApp
                } else {
                    setView("Onboarding"); // Navega para o componente Onboarding
                }
            } else {
                setFormErrorMessage(result.message || 'Email ou senha incorretos.');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setFormErrorMessage('Erro ao conectar com o servidor. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="w-full max-w-md max-h-screen overflow-y-auto p-10 pb-20 flex flex-col items-center text-center animate-fadeIn">
            {/* A animação 'fadeIn' precisaria ser definida em seu CSS global ou em tailwind.config.js */}
            <img
                src="https://placehold.co/120x120?text=ShapeFIT+Logo" // Caminho relativo substituído por placeholder
                alt="Shape Fit Logo"
                className="block max-w-[120px] h-auto mb-[50px]"
            />
            <h1 className="text-3xl font-bold mb-10 text-white">Acesse sua conta</h1>
            <form onSubmit={handleSubmit} className="w-full">
                {formErrorMessage && (
                    <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-3 mb-5 text-sm text-red-500">
                        {formErrorMessage}
                    </div>
                )}
                <div className="mb-5 relative">
                    <i className="fa-solid fa-envelope absolute left-[18px] top-1/2 -translate-y-1/2 text-gray-400 text-base transition-colors duration-300"></i>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        className="w-full p-4 pl-[50px] text-base bg-white/5 border border-white/10 rounded-2xl text-white transition-colors duration-300 outline-none placeholder-gray-400 focus:border-orange-500 focus:text-white [&:focus+i]:text-orange-500"
                        placeholder="Email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {emailErrorMessage && (
                        <span className="text-red-500 text-xs mt-2 text-left block pl-1">
                            {emailErrorMessage}
                        </span>
                    )}
                </div>
                <div className="mb-5 relative">
                    <i className="fa-solid fa-lock absolute left-[18px] top-1/2 -translate-y-1/2 text-gray-400 text-base transition-colors duration-300"></i>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        className="w-full p-4 pl-[50px] text-base bg-white/5 border border-white/10 rounded-2xl text-white transition-colors duration-300 outline-none placeholder-gray-400 focus:border-orange-500 focus:text-white [&:focus+i]:text-orange-500"
                        placeholder="Senha"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {passwordErrorMessage && (
                        <span className="text-red-500 text-xs mt-2 text-left block pl-1">
                            {passwordErrorMessage}
                        </span>
                    )}
                </div>
                <button
                    type="submit"
                    className="bg-gradient-to-br from-amber-500 to-red-600 bg-[size:150%_auto] text-white border-none rounded-2xl p-4 text-lg font-semibold cursor-pointer w-full transition-all duration-300 mt-4 hover:bg-right active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    id="submitBtn"
                    disabled={isLoading}
                >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
                <p className="text-gray-400 mt-10 text-base">
                    Não tem uma conta?{' '}
                    <button
                        type="button" // Usamos type="button" para evitar o envio do formulário
                        onClick={() => setView("Register")} // Substituímos <a> por button e onClick
                        className="text-orange-500 font-semibold transition-colors duration-300 hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    >
                        Cadastre-se
                    </button>
                </p>
            </form>
        </main>
    );
};