// onboarding_logic.js - Lógica da página de onboarding
// Adaptado para eventos SPA

window.addEventListener('spa:enter-onboarding', function() {
    // Verificar autenticação
    if (!getAuthToken()) {
        if (window.router) {
            window.router.navigate('/login');
        } else {
            window.location.href = window.BASE_APP_URL + '/auth/login.html';
        }
        return;
    }
    
    // Definir viewport height
    function setRealViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    window.addEventListener('resize', setRealViewportHeight);
    setRealViewportHeight();
    
    // A lógica completa do formulário de onboarding está no arquivo PHP
    // Este arquivo JS serve apenas para inicialização básica
    console.log('Onboarding page loaded');
});

