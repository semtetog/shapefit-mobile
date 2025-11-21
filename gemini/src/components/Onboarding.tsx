import React, { useState, useEffect } from 'react';

export const Onboarding = ({ setView }: { setView: (view: string) => void }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4; // Assumindo do contexto da barra de progresso

    // Placeholder para dados do formulário
    const [formData, setFormData] = useState({});

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            // Em uma aplicação real, você provavelmente validaria ou salvaria os dados aqui
        } else {
            // Fim do onboarding, navega para o painel principal
            setView('Dashboard'); // Exemplo de navegação para "Dashboard"
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            // Primeiro passo, talvez voltar para uma página inicial ou sair
            setView('LandingPage'); // Exemplo de navegação para "LandingPage"
        }
    };

    const progressBarWidth = (currentStep / totalSteps) * 100;

    useEffect(() => {
        // TODO: Lógica para setar a variável CSS --vh, como no script original
        const setVh = () => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        window.addEventListener('resize', setVh);
        setVh(); // Chamada inicial

        // Limpeza do evento ao desmontar o componente
        return () => window.removeEventListener('resize', setVh);

        // TODO: Lógica dos scripts '../www-config.js' e '../assets/js/auth.js' pode precisar ser adaptada aqui
    }, []);

    // Gradientes definidos como variáveis para reuso
    const primaryOrangeGradient = "linear-gradient(135deg, #FFAE00, #F83600)";
    const disabledGrayGradient = "linear-gradient(135deg, #333, #444)";

    return (
        <div
            className="relative w-full h-full flex justify-center font-['Montserrat',sans-serif] text-[#F5F5F5] overflow-hidden overscroll-none touch-none"
            style={{ background: "radial-gradient(circle at top, #1b1b1b 0, #050505 55%)" }}
        >
            <div
                className="app-container w-full max-w-lg h-full flex flex-col pb-[env(safe-area-inset-bottom,0px)] overflow-hidden overscroll-none touch-none relative"
                style={{ height: "calc(var(--vh, 1vh) * 100)" }}
            >
                <form id="onboarding-form" className="flex flex-col flex-grow min-h-0 overflow-hidden overscroll-none touch-none">
                    <div className="header-nav pt-[calc(env(safe-area-inset-top,0px)+10px)] px-5 pb-2.5 flex-shrink-0 flex justify-between items-center invisible">
                        <div className="header-left flex items-center gap-3">
                            <button
                                type="button"
                                className="text-[#A3A3A3] text-xl bg-transparent border-none cursor-pointer p-1 rounded-full flex items-center justify-center active:bg-white/[0.06] [-webkit-tap-highlight-color:transparent]"
                                onClick={handleBack}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <span className="text-xs text-[#747474] font-medium">
                                Passo {currentStep} de {totalSteps}
                            </span>
                        </div>
                    </div>

                    <div className="w-full px-5 pb-2.5 flex-shrink-0">
                        <div className="w-full h-1 rounded-full bg-white/[0.08] overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-250 ease-out"
                                style={{ width: `${progressBarWidth}%`, backgroundImage: primaryOrangeGradient }}
                            ></div>
                        </div>
                    </div>

                    {/* STEP 1: Objetivo Principal */}
                    <div className={`form-step flex-grow min-h-0 overflow-hidden overscroll-none touch-none flex-col animate-[fadeIn_0.25s_ease] ${currentStep === 1 ? 'flex' : 'hidden'}`}>
                        <div className="step-content flex-grow px-5 pt-1.5 pb-0 flex flex-col justify-between overflow-hidden overscroll-none touch-none">
                            <div className="step-main flex-grow flex flex-col justify-center gap-[18px]">
                                <h1 className="text-[26px] font-bold leading-tight mb-1 text-left">Qual o seu principal objetivo?</h1>
                                <p className="text-[#A3A3A3] text-sm mb-1.5 font-normal text-left">
                                    Escolha o que melhor descreve o que você busca alcançar com a ShapeFIT.
                                </p>

                                <div className="flex flex-col gap-2.5">
                                    <input type="radio" id="goal1" name="goal" value="perderPeso" className="hidden" />
                                    <label htmlFor="goal1"
                                        className="flex items-center justify-center min-h-[54px] px-3.5 py-3 text-sm text-center bg-white/[0.04] border border-white/[0.08] cursor-pointer transition-all duration-200 ease-in-out rounded-xl text-[#F5F5F5] overflow-hidden [-webkit-background-clip:padding-box] [background-clip:padding-box] tracking-[0.01em]
                                        [&_input:checked+&]:!bg-[linear-gradient(135deg,#FFAE00,#F83600)] [&_input:checked+&]:!border-none [&_input:checked+&]:font-semibold [&_input:checked+&]:shadow-[0_10px_26px_rgba(248,102,0,0.26)]"
                                    >
                                        <span>Perder peso e queimar gordura</span>
                                    </label>

                                    <input type="radio" id="goal2" name="goal" value="ganharMusculo" className="hidden" />
                                    <label htmlFor="goal2"
                                        className="flex items-center justify-center min-h-[54px] px-3.5 py-3 text-sm text-center bg-white/[0.04] border border-white/[0.08] cursor-pointer transition-all duration-200 ease-in-out rounded-xl text-[#F5F5F5] overflow-hidden [-webkit-background-clip:padding-box] [background-clip:padding-box] tracking-[0.01em]
                                        [&_input:checked+&]:!bg-[linear-gradient(135deg,#FFAE00,#F83600)] [&_input:checked+&]:!border-none [&_input:checked+&]:font-semibold [&_input:checked+&]:shadow-[0_10px_26px_rgba(248,102,0,0.26)]"
                                    >
                                        <span>Ganhar massa muscular e força</span>
                                    </label>

                                    <input type="radio" id="goal3" name="goal" value="manterForma" className="hidden" />
                                    <label htmlFor="goal3"
                                        className="flex items-center justify-center min-h-[54px] px-3.5 py-3 text-sm text-center bg-white/[0.04] border border-white/[0.08] cursor-pointer transition-all duration-200 ease-in-out rounded-xl text-[#F5F5F5] overflow-hidden [-webkit-background-clip:padding-box] [background-clip:padding-box] tracking-[0.01em]
                                        [&_input:checked+&]:!bg-[linear-gradient(135deg,#FFAE00,#F83600)] [&_input:checked+&]:!border-none [&_input:checked+&]:font-semibold [&_input:checked+&]:shadow-[0_10px_26px_rgba(248,102,0,0.26)]"
                                    >
                                        <span>Manter a forma e melhorar a saúde geral</span>
                                    </label>
                                </div>
                                <p className="mt-1.5 text-xs text-[#747474] text-left">
                                    Seu objetivo nos ajudará a personalizar seu plano.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Exemplo de Outro Passo (oculto por padrão) */}
                     <div className={`form-step flex-grow min-h-0 overflow-hidden overscroll-none touch-none flex-col animate-[fadeIn_0.25s_ease] ${currentStep === 2 ? 'flex' : 'hidden'}`}>
                        <div className="step-content flex-grow px-5 pt-1.5 pb-0 flex flex-col justify-between overflow-hidden overscroll-none touch-none">
                            <div className="step-main flex-grow flex flex-col justify-center gap-[18px]">
                                <h1 className="text-[26px] font-bold leading-tight mb-1 text-left">Qual seu nível de atividade?</h1>
                                <p className="text-[#A3A3A3] text-sm mb-1.5 font-normal text-left">
                                    Selecione o quão ativo você é na sua rotina diária e exercícios.
                                </p>

                                <div className="flex flex-col gap-2.5">
                                    <input type="radio" id="activity1" name="activity" value="sedentario" className="hidden" />
                                    <label htmlFor="activity1"
                                        className="flex items-center justify-center min-h-[54px] px-3.5 py-3 text-sm text-center bg-white/[0.04] border border-white/[0.08] cursor-pointer transition-all duration-200 ease-in-out rounded-xl text-[#F5F5F5] overflow-hidden [-webkit-background-clip:padding-box] [background-clip:padding-box] tracking-[0.01em]
                                        [&_input:checked+&]:!bg-[linear-gradient(135deg,#FFAE00,#F83600)] [&_input:checked+&]:!border-none [&_input:checked+&]:font-semibold [&_input:checked+&]:shadow-[0_10px_26px_rgba(248,102,0,0.26)]"
                                    >
                                        <span>Sedentário (pouco ou nenhum exercício)</span>
                                    </label>

                                    <input type="radio" id="activity2" name="activity" value="levementeAtivo" className="hidden" />
                                    <label htmlFor="activity2"
                                        className="flex items-center justify-center min-h-[54px] px-3.5 py-3 text-sm text-center bg-white/[0.04] border border-white/[0.08] cursor-pointer transition-all duration-200 ease-in-out rounded-xl text-[#F5F5F5] overflow-hidden [-webkit-background-clip:padding-box] [background-clip:padding-box] tracking-[0.01em]
                                        [&_input:checked+&]:!bg-[linear-gradient(135deg,#FFAE00,#F83600)] [&_input:checked+&]:!border-none [&_input:checked+&]:font-semibold [&_input:checked+&]:shadow-[0_10px_26px_rgba(248,102,0,0.26)]"
                                    >
                                        <span>Levemente Ativo (exercício leve 1-3 vezes/semana)</span>
                                    </label>

                                    <input type="radio" id="activity3" name="activity" value="moderadamenteAtivo" className="hidden" />
                                    <label htmlFor="activity3"
                                        className="flex items-center justify-center min-h-[54px] px-3.5 py-3 text-sm text-center bg-white/[0.04] border border-white/[0.08] cursor-pointer transition-all duration-200 ease-in-out rounded-xl text-[#F5F5F5] overflow-hidden [-webkit-background-clip:padding-box] [background-clip:padding-box] tracking-[0.01em]
                                        [&_input:checked+&]:!bg-[linear-gradient(135deg,#FFAE00,#F83600)] [&_input:checked+&]:!border-none [&_input:checked+&]:font-semibold [&_input:checked+&]:shadow-[0_10px_26px_rgba(248,102,0,0.26)]"
                                    >
                                        <span>Moderadamente Ativo (exercício 3-5 vezes/semana)</span>
                                    </label>
                                    <input type="radio" id="activity4" name="activity" value="muitoAtivo" className="hidden" />
                                    <label htmlFor="activity4"
                                        className="flex items-center justify-center min-h-[54px] px-3.5 py-3 text-sm text-center bg-white/[0.04] border border-white/[0.08] cursor-pointer transition-all duration-200 ease-in-out rounded-xl text-[#F5F5F5] overflow-hidden [-webkit-background-clip:padding-box] [background-clip:padding-box] tracking-[0.01em]
                                        [&_input:checked+&]:!bg-[linear-gradient(135deg,#FFAE00,#F83600)] [&_input:checked+&]:!border-none [&_input:checked+&]:font-semibold [&_input:checked+&]:shadow-[0_10px_26px_rgba(248,102,0,0.26)]"
                                    >
                                        <span>Muito Ativo (exercício intenso 6-7 vezes/semana)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="footer-nav px-5 py-[18px] pb-[calc(env(safe-area-inset-bottom,0px)+22px)] flex-shrink-0 mt-auto flex flex-col gap-3">
                        <button
                            type="button"
                            className="bg-[linear-gradient(135deg,#FFAE00,#F83600)] text-[#F5F5F5] border-none py-3.5 px-5 text-base font-semibold cursor-pointer w-full transition-all duration-250 ease-in-out rounded-2xl overflow-hidden shadow-[0_12px_30px_rgba(248,102,0,0.25)]
                            disabled:bg-[linear-gradient(135deg,#333,#444)] disabled:text-[#A3A3A3] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none [-webkit-tap-highlight-color:transparent]"
                            onClick={handleNext}
                        >
                            Continuar
                        </button>
                        <button
                            type="button"
                            className={`bg-transparent border-none text-[#A3A3A3] text-sm font-medium cursor-pointer p-3 text-center opacity-70 transition-opacity duration-200 ease-in-out [-webkit-tap-highlight-color:transparent] ${currentStep > 1 ? 'block' : 'hidden'}`}
                            onClick={() => setView('ExitConfirmation')} // Exemplo de navegação para "ExitConfirmation"
                        >
                            Sair do Questionário
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};