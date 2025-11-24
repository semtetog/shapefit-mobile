// Register Page Logic
(function () {
    'use strict';

    function setRealViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    function cloneAndReplace(element) {
        if (!element) return null;
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    }

    function togglePasswordVisibility(button) {
        const targetId = button.getAttribute('data-target');
        if (!targetId) return;

        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');

        const icon = button.querySelector('i');
        if (!icon) return;

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

    function attachToggleVisibilityHandlers(container) {
        const buttons = container.querySelectorAll('.toggle-visibility');
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                togglePasswordVisibility(button);
            });
        });
    }

    function clearErrors(...elements) {
        elements.forEach((el) => {
            if (el) {
                el.textContent = '';
                el.style.display = 'none';
            }
        });
    }

    async function handleRegisterSubmit(event) {
        event.preventDefault();

        const formError = document.getElementById('formError');
        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        const confirmPasswordError = document.getElementById('confirmPasswordError');
        const submitBtn = document.getElementById('submitBtn');

        clearErrors(formError, nameError, emailError, passwordError, confirmPasswordError);

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;

        let hasErrors = false;

        if (!name || name.length < 2) {
            nameError.textContent = 'Informe seu nome completo.';
            nameError.style.display = 'block';
            hasErrors = true;
        }

        if (!email || !email.includes('@')) {
            emailError.textContent = 'Informe um email válido.';
            emailError.style.display = 'block';
            hasErrors = true;
        }

        if (!password || password.length < 6) {
            passwordError.textContent = 'Senha precisa ter ao menos 6 caracteres.';
            passwordError.style.display = 'block';
            hasErrors = true;
        }

        if (password !== confirmPassword) {
            confirmPasswordError.textContent = 'As senhas não coincidem.';
            confirmPasswordError.style.display = 'block';
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

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
                setAuthToken(result.token);
                const targetUrl = './onboarding.html';
                if (window.SPANavigator) {
                    window.SPANavigator.navigate(targetUrl);
                } else {
                    window.location.href = targetUrl;
                }
            } else {
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
    }

    function initRegisterPage() {
        console.log('Iniciando página de registro...');

        setRealViewportHeight();
        window.addEventListener('resize', setRealViewportHeight);

        const form = document.getElementById('registerForm');
        if (!form) return;

        const newForm = cloneAndReplace(form);
        attachToggleVisibilityHandlers(document);

        newForm.addEventListener('submit', handleRegisterSubmit);
    }

    window.addEventListener('spa:page-loaded', (event) => {
        if (!event.detail || !event.detail.url) return;
        if (event.detail.url.includes('register.html')) {
            initRegisterPage();
        }
    });

})();

