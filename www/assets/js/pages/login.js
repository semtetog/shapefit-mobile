// Login Page Logic
window.initLoginPage = function() {
    console.log('Iniciando página de Login...');
    
    // Viewport height fix
    function setRealViewportHeight() { 
        const vh = window.innerHeight * 0.01; 
        document.documentElement.style.setProperty('--vh', `${vh}px`); 
    }
    setRealViewportHeight();
    window.addEventListener('resize', setRealViewportHeight);
    
    // Prevent scroll
    document.body.addEventListener('touchmove', function(event) { event.preventDefault(); }, { passive: false });
    
    // Prevent iOS scroll on focus
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('focusin', () => { setTimeout(() => { window.scrollTo(0, 0); }, 0); });
        input.addEventListener('blur', () => { window.scrollTo(0, 0); });
    });
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // Remover listener antigo se houver (clone node remove listeners)
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submitBtn');
            const formError = document.getElementById('formError');
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');
            
            // Clear previous errors
            formError.style.display = 'none';
            emailError.style.display = 'none';
            passwordError.style.display = 'none';
            
            // Validate
            let hasErrors = false;
            if (!email || !email.includes('@')) {
                emailError.textContent = 'Por favor, insira um email válido.';
                emailError.style.display = 'block';
                hasErrors = true;
            }
            if (!password) {
                passwordError.textContent = 'Por favor, insira sua senha.';
                passwordError.style.display = 'block';
                hasErrors = true;
            }
            
            if (hasErrors) return;
            
            // Disable button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Entrando...';
            
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
                    console.log('Login com sucesso, token recebido');
                    setAuthToken(result.token);
                    
                    // Navegar usando SPA
                    const targetUrl = (result.user && result.user.onboarding_complete)
                        ? './main_app.html'
                        : './onboarding.html';
                        
                    console.log('Redirecionando para:', targetUrl);
                    
                    if (window.SPANavigator) {
                        window.SPANavigator.navigate(targetUrl);
                    } else {
                        window.location.href = targetUrl;
                    }
                } else {
                    formError.textContent = result.message || 'Email ou senha incorretos.';
                    formError.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Entrar';
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
                formError.textContent = 'Erro ao conectar com o servidor. Tente novamente.';
                formError.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Entrar';
            }
        });
    }
};

// Ouvir evento de carregamento do SPA
window.addEventListener('spa:page-loaded', (e) => {
    if (e.detail.url.includes('login.html')) {
        window.initLoginPage();
    }
});

