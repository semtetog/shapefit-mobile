// auth_login_logic.js - Lógica específica inline do auth/login.html

(function() {
    function setRealViewportHeight() { 
        const vh = window.innerHeight * 0.01; 
        document.documentElement.style.setProperty('--vh', `${vh}px`); 
    }
    window.addEventListener('resize', setRealViewportHeight);
    setRealViewportHeight();
    document.body.addEventListener('touchmove', function(event) { event.preventDefault(); }, { passive: false });
    (function preventIOSScroll() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('focusin', () => { setTimeout(() => { window.scrollTo(0, 0); }, 0); });
            input.addEventListener('blur', () => { window.scrollTo(0, 0); });
        });
    })();
    
    // Função para inicializar a página de login
    function initLoginPage() {
        // Handle login form
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;
        
        // Remover listener anterior se existir
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        const updatedForm = document.getElementById('loginForm');
        
        if (updatedForm) {
            updatedForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submitBtn');
            const formError = document.getElementById('formError');
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');
            
            // Clear previous errors
            if (formError) formError.style.display = 'none';
            if (emailError) emailError.style.display = 'none';
            if (passwordError) passwordError.style.display = 'none';
            
            // Validate
            let hasErrors = false;
            if (!email || !email.includes('@')) {
                if (emailError) {
                    emailError.textContent = 'Por favor, insira um email válido.';
                    emailError.style.display = 'block';
                }
                hasErrors = true;
            }
            if (!password) {
                if (passwordError) {
                    passwordError.textContent = 'Por favor, insira sua senha.';
                    passwordError.style.display = 'block';
                }
                hasErrors = true;
            }
            
            if (hasErrors) return;
            
            // Disable button
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Entrando...';
            }
            
            try {
                const response = await fetch(`${window.BASE_APP_URL}/api/login.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const result = await response.json();
                
                if (result.success && result.token) {
                    // Save token
                    console.log('Token recebido, salvando no localStorage...');
                    setAuthToken(result.token);
                    console.log('Token salvo:', getAuthToken() ? 'SIM' : 'NÃO');
                    
                    // Redirect based on onboarding status
                    if (result.user && result.user.onboarding_complete) {
                        console.log('Redirecionando para main_app.html');
                        if (window.router) {
                            window.router.navigate('/main_app');
                        } else {
                            window.location.href = `${window.BASE_APP_URL}/main_app.html`;
                        }
                    } else {
                        console.log('Redirecionando para onboarding');
                        if (window.router) {
                            window.router.navigate('/onboarding');
                        } else {
                            window.location.href = `${window.BASE_APP_URL}/onboarding/onboarding.html`;
                        }
                    }
                } else {
                    // Show error
                    if (formError) {
                        formError.textContent = result.message || 'Email ou senha incorretos.';
                        formError.style.display = 'block';
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Entrar';
                    }
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                if (formError) {
                    formError.textContent = 'Erro ao conectar com o servidor. Tente novamente.';
                    formError.style.display = 'block';
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Entrar';
                }
            }
        });
        }
    }
    
    // Evento quando a view Login entra
    window.addEventListener('spa:enter-login', function() {
        initLoginPage();
    });
    
    // Inicializar imediatamente se já estiver na página
    if (document.getElementById('loginForm')) {
        initLoginPage();
    }
})();

