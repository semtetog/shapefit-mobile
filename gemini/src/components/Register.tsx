import React, { useState, useEffect, useRef } from 'react';

export const Register = ({ setView }: { setView: (view: string) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [formError, setFormError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Service Worker registration and update logic should be handled at the application root (e.g., index.tsx or App.tsx), not within a component.
  // TODO: Global viewport height calculation and scroll prevention (setRealViewportHeight, preventIOSScroll) should be handled globally or reconsidered for React context.
  // For now, these global scripts are not directly translated into component-level useEffects.

  // Placeholder for BASE_APP_URL, ideally from environment variables or context
  const BASE_APP_URL = process.env.REACT_APP_API_BASE_URL || window.location.origin;

  const validateForm = () => {
    let isValid = true;
    setFormError('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!name) {
      setNameError('O nome completo é obrigatório.');
      isValid = false;
    }
    if (!email) {
      setEmailError('O email é obrigatório.');
      isValid = false;
    } else if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email)) {
      setEmailError('Por favor, insira um email válido.');
      isValid = false;
    }
    if (!password) {
      setPasswordError('A senha é obrigatória.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres.');
      isValid = false;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Confirme sua senha.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_APP_URL}/api/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          alert('Cadastro realizado com sucesso! Faça login para continuar.');
          setView('Login');
        } else {
          setFormError(data.message || 'Ocorreu um erro desconhecido.');
        }
      } else {
        setFormError(data.message || 'Erro no servidor. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setFormError('Falha na comunicação com o servidor. Verifique sua conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-md h-full overflow-y-auto p-6 flex flex-col items-center justify-center text-center animate-fadeIn min-h-screen">
      {/* Flex grow elements to push content to center, similar to original ::before/::after */}
      <div className="flex-grow min-h-0" />

      <img src="https://placehold.co/600x400?text=ShapeFIT+Logo" alt="Shape Fit Logo" className="block max-w-[120px] h-auto mb-5" />
      <h1 className="text-3xl font-bold mb-[30px] text-[#F5F5F5]">Crie sua Conta</h1>

      <form id="registerForm" className="w-full" autoComplete="on" onSubmit={handleSubmit}>
        {formError && (
          <div className="bg-[rgba(244,67,54,0.1)] border border-[rgba(244,67,54,0.3)] rounded-xl p-3 mb-5 text-sm text-[#F44336]">
            {formError}
          </div>
        )}

        <div className="mb-5 relative group">
          <div className="relative">
            <i className="fa-solid fa-user icon absolute left-[18px] top-1/2 -translate-y-1/2 text-[#A3A3A3] text-base transition-colors duration-300 group-focus-within:text-[#FF6B00]" />
            <input
              type="text"
              name="name"
              id="name"
              className="w-full px-[20px] py-4 pl-[50px] text-base bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl text-[#F5F5F5] transition-colors duration-300 outline-none placeholder:text-[#A3A3A3] focus:border-[#FF6B00]"
              placeholder="Nome completo"
              required
              autocomplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {nameError && <span className="text-[#F44336] text-sm mt-2 text-left pl-[5px] block">{nameError}</span>}
        </div>

        <div className="mb-5 relative group">
          <div className="relative">
            <i className="fa-solid fa-envelope icon absolute left-[18px] top-1/2 -translate-y-1/2 text-[#A3A3A3] text-base transition-colors duration-300 group-focus-within:text-[#FF6B00]" />
            <input
              type="email"
              name="email"
              id="email"
              className="w-full px-[20px] py-4 pl-[50px] text-base bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl text-[#F5F5F5] transition-colors duration-300 outline-none placeholder:text-[#A3A3A3] focus:border-[#FF6B00]"
              placeholder="Email"
              required
              autocomplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {emailError && <span className="text-[#F44336] text-sm mt-2 text-left pl-[5px] block">{emailError}</span>}
        </div>

        <div className="mb-5 relative group">
          <div className="relative has-toggle">
            <i className="fa-solid fa-lock icon absolute left-[18px] top-1/2 -translate-y-1/2 text-[#A3A3A3] text-base transition-colors duration-300 group-focus-within:text-[#FF6B00]" />
            <input
              type={isPasswordVisible ? 'text' : 'password'}
              name="password"
              id="password"
              className="w-full px-[20px] py-4 pl-[50px] pr-[50px] text-base bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl text-[#F5F5F5] transition-colors duration-300 outline-none placeholder:text-[#A3A3A3] focus:border-[#FF6B00]"
              placeholder="Senha (mín. 6 caracteres)"
              required
              autocomplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-visibility absolute right-[18px] top-1/2 -translate-y-1/2 bg-transparent border-none text-[#A3A3A3] text-base cursor-pointer p-1 group-focus-within:text-[#FF6B00]"
              aria-label={isPasswordVisible ? 'Esconder senha' : 'Mostrar senha'}
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <i className={isPasswordVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
            </button>
          </div>
          {passwordError && <span className="text-[#F44336] text-sm mt-2 text-left pl-[5px] block">{passwordError}</span>}
        </div>

        <div className="mb-5 relative group">
          <div className="relative has-toggle">
            <i className="fa-solid fa-lock icon absolute left-[18px] top-1/2 -translate-y-1/2 text-[#A3A3A3] text-base transition-colors duration-300 group-focus-within:text-[#FF6B00]" />
            <input
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              name="confirm_password"
              id="confirm_password"
              className="w-full px-[20px] py-4 pl-[50px] pr-[50px] text-base bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl text-[#F5F5F5] transition-colors duration-300 outline-none placeholder:text-[#A3A3A3] focus:border-[#FF6B00]"
              placeholder="Confirme a senha"
              required
              autocomplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-visibility absolute right-[18px] top-1/2 -translate-y-1/2 bg-transparent border-none text-[#A3A3A3] text-base cursor-pointer p-1 group-focus-within:text-[#FF6B00]"
              aria-label={isConfirmPasswordVisible ? 'Esconder senha' : 'Mostrar senha'}
              onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            >
              <i className={isConfirmPasswordVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
            </button>
          </div>
          {confirmPasswordError && <span className="text-[#F44336] text-sm mt-2 text-left pl-[5px] block">{confirmPasswordError}</span>}
        </div>

        <button
          type="submit"
          className="bg-gradient-to-br from-[#FFAE00] to-[#F83600] bg-[length:150%_auto] text-[#F5F5F5] border-none rounded-2xl px-6 py-4 text-lg font-semibold cursor-pointer w-full transition-all duration-200 ease-in-out mt-[15px] hover:bg-right active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          id="submitBtn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        <p className="text-[#A3A3A3] mt-10 text-base">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={() => setView('Login')}
            className="text-[#FF6B00] no-underline font-semibold transition-colors duration-300 hover:text-[#ff9e3d]"
          >
            Faça login
          </button>
        </p>
      </form>

      {/* Flex grow element for centering, similar to original ::before/::after */}
      <div className="flex-grow min-h-0" />
    </main>
  );
};
