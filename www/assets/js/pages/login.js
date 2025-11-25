// Scripts inline extraídos de login.html
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
        // Garantir que sempre use appshapefit.com para APIs
        if (!window.BASE_APP_URL) {
            window.BASE_APP_URL = 'https://appshapefit.com';
            console.warn('[Login] BASE_APP_URL não estava definido, usando fallback:', window.BASE_APP_URL);
        }
        console.log('[Login] BASE_APP_URL:', window.BASE_APP_URL);

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
        
        // Handle login form
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
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
                const apiUrl = `${window.BASE_APP_URL}/api/login.php`;
                console.log('[Login] Fazendo requisição para:', apiUrl);
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                console.log('[Login] Response status:', response.status);
                console.log('[Login] Response headers:', response.headers.get('content-type'));
                
                // Verificar se a resposta é JSON antes de fazer parse
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('[Login] Resposta não é JSON:', text.substring(0, 500));
                    throw new Error('Resposta do servidor não é JSON válido');
                }
                
                const result = await response.json();
                
                if (result.success && result.token) {
                    // Save token
                    console.log('Token recebido, salvando no localStorage...');
                    setAuthToken(result.token);
                    console.log('Token salvo:', getAuthToken() ? 'SIM' : 'NÃO');
                    
                    // Redirect based on onboarding status
                    // Usar caminhos relativos para manter dentro do app
                    if (result.user && result.user.onboarding_complete) {
                        console.log('Redirecionando para main_app.html');
                        window.location.href = '../main_app.html';
                    } else {
                        console.log('Redirecionando para onboarding');
                        window.location.href = '../onboarding/onboarding.html';
                    }
                } else {
                    // Show error
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

