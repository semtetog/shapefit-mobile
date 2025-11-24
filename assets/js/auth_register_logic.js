// auth_register_logic.js - Lógica específica inline do auth/register.html

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
    
    // Função para inicializar a página de registro
    function initRegisterPage() {
        // Toggle de visibilidade de senha
        document.querySelectorAll('.toggle-visibility').forEach(function(button) {
            button.addEventListener('click', function() {
            var inputId = button.getAttribute('data-target');
            var input = document.getElementById(inputId);
            if (!input) return;
            var isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            var icon = button.querySelector('i');
            if (icon) {
                if (isPassword) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    button.setAttribute('aria-label', 'Esconder senha');
                } else {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    button.setAttribute('aria-label', 'Mostrar senha');
                }
            }
        });
    });
    
    // Handle register form
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    // Remover listener anterior se existir
    const newForm = registerForm.cloneNode(true);
    registerForm.parentNode.replaceChild(newForm, registerForm);
    const updatedForm = document.getElementById('registerForm');
    
    if (updatedForm) {
        updatedForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            const submitBtn = document.getElementById('submitBtn');
            const formError = document.getElementById('formError');
            const nameError = document.getElementById('nameError');
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');
            const confirmPasswordError = document.getElementById('confirmPasswordError');
            
            // Clear previous errors
            if (formError) formError.style.display = 'none';
            if (nameError) nameError.style.display = 'none';
            if (emailError) emailError.style.display = 'none';
            if (passwordError) passwordError.style.display = 'none';
            if (confirmPasswordError) confirmPasswordError.style.display = 'none';
            
            // Disable button
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Cadastrando...';
            }
            
            try {
                const response = await fetch(`${window.BASE_APP_URL}/api/register.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password, confirm_password: confirmPassword })
                });
                
                const result = await response.json();
                
                if (result.success && result.token) {
                    // Save token
                    setAuthToken(result.token);
                    
                    // Redirect to onboarding
                    if (window.router) {
                        window.router.navigate('/onboarding');
                    } else {
                        window.location.href = `${window.BASE_APP_URL}/onboarding/onboarding.html`;
                    }
                } else {
                    // Show errors
                    if (result.errors) {
                        if (result.errors.name && nameError) {
                            nameError.textContent = result.errors.name;
                            nameError.style.display = 'block';
                        }
                        if (result.errors.email && emailError) {
                            emailError.textContent = result.errors.email;
                            emailError.style.display = 'block';
                        }
                        if (result.errors.password && passwordError) {
                            passwordError.textContent = result.errors.password;
                            passwordError.style.display = 'block';
                        }
                        if (result.errors.confirm_password && confirmPasswordError) {
                            confirmPasswordError.textContent = result.errors.confirm_password;
                            confirmPasswordError.style.display = 'block';
                        }
                    } else {
                        if (formError) {
                            formError.textContent = result.message || 'Erro ao cadastrar. Tente novamente.';
                            formError.style.display = 'block';
                        }
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Cadastrar';
                    }
                }
            } catch (error) {
                console.error('Erro ao cadastrar:', error);
                if (formError) {
                    formError.textContent = 'Erro ao conectar com o servidor. Tente novamente.';
                    formError.style.display = 'block';
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Cadastrar';
                }
            }
        });
    }
    }
    
    // Evento quando a view Register entra
    window.addEventListener('spa:enter-register', function() {
        initRegisterPage();
    });
    
    // Inicializar imediatamente se já estiver na página
    if (document.getElementById('registerForm')) {
        initRegisterPage();
    }
})();

