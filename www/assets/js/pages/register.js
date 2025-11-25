// Scripts inline extraídos de register.html
// Gerado automaticamente - não editar manualmente

// Script inline 1


// Script inline 2


// Script inline 3
if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('../sw.js?v=7')
                .then(function(registration) {
                    console.log('ServiceWorker registrado:', registration.scope);
                    
                    // Verificar atualizações periodicamente
                    setInterval(function() {
                        registration.update();
                    }, 1000);
                    
                    // Forçar atualização quando detectar nova versão
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Nova versão disponível - recarregar página
                                window.location.reload();
                            }
                        });
                    });
                })
                .catch(function(error) {
                    console.log('Falha no registro do ServiceWorker:', error);
                });
            
            // Forçar atualização ao focar na página
            window.addEventListener('focus', function() {
                navigator.serviceWorker.getRegistration().then(function(registration) {
                    if (registration) {
                        registration.update();
                    }
                });
            });
        });
    }

// Script inline 4
// BASE_APP_URL já foi definido pelo www-config.js
        // Se não foi definido (fallback), usar URL local
        if (!window.BASE_APP_URL) {
            window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -2).join('/');
            if (window.BASE_APP_URL.endsWith('/')) {
                window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
            }
        }
        console.log('BASE_APP_URL definido como:', window.BASE_APP_URL);

// Script inline 5
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
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
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
            formError.style.display = 'none';
            nameError.style.display = 'none';
            emailError.style.display = 'none';
            passwordError.style.display = 'none';
            confirmPasswordError.style.display = 'none';
            
            // Disable button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Cadastrando...';
            
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
                    window.location.href = '../onboarding/onboarding.html';
                } else {
                    // Show errors
                    if (result.errors) {
                        if (result.errors.name) {
                            nameError.textContent = result.errors.name;
                            nameError.style.display = 'block';
                        }
                        if (result.errors.email) {
                            emailError.textContent = result.errors.email;
                            emailError.style.display = 'block';
                        }
                        if (result.errors.password) {
                            passwordError.textContent = result.errors.password;
                            passwordError.style.display = 'block';
                        }
                        if (result.errors.confirm_password) {
                            confirmPasswordError.textContent = result.errors.confirm_password;
                            confirmPasswordError.style.display = 'block';
                        }
                    } else {
                        formError.textContent = result.message || 'Erro ao cadastrar. Tente novamente.';
                        formError.style.display = 'block';
                    }
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Cadastrar';
                }
            } catch (error) {
                console.error('Erro ao cadastrar:', error);
                formError.textContent = 'Erro ao conectar com o servidor. Tente novamente.';
                formError.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Cadastrar';
            }
        });

