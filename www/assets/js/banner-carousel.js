// banner-carousel.js (VERSÃO FINAL, ESTÁVEL E COM LOOP SIMPLES)

// Variáveis globais para controle de limpeza
// Evitar re-declaração em navegação SPA
if (typeof window.globalCarouselInterval === 'undefined') {
    window.globalCarouselInterval = null;
}
if (typeof window.globalLoadedAnimations === 'undefined') {
    window.globalLoadedAnimations = [];
}
let globalCarouselInterval = window.globalCarouselInterval;
let globalLoadedAnimations = window.globalLoadedAnimations;

function initLottieCarousel() {
  console.log('[Banner Carousel] Inicializando com loop estável...');
  
  // LIMPAR ANIMAÇÕES E TIMERS ANTIGOS ANTES DE INICIALIZAR
  if (window.globalCarouselInterval) {
    clearInterval(window.globalCarouselInterval);
    window.globalCarouselInterval = null;
  }
  globalCarouselInterval = window.globalCarouselInterval;
  
  // Destruir todas as animações Lottie antigas
  window.globalLoadedAnimations.forEach(anim => {
    if (anim && typeof anim.destroy === 'function') {
      try {
        anim.destroy();
      } catch (e) {
        console.warn('[Banner Carousel] Erro ao destruir animação antiga:', e);
      }
    }
  });
  window.globalLoadedAnimations = [];
  globalLoadedAnimations = window.globalLoadedAnimations;
  
  if (typeof lottie === 'undefined') {
    console.error('[Banner Carousel] Biblioteca lottie-web não foi carregada!');
    return;
  }
  
  const carousel = document.querySelector('.main-carousel');
  if (!carousel) {
    console.error('[Banner Carousel] Container .main-carousel não encontrado!');
    return;
  }
  
  // Verificar se há slides duplicados e remover
  const track = carousel.querySelector('.carousel-track');
  if (!track) {
    console.error('[Banner Carousel] Trilho (.carousel-track) não encontrado!');
    return;
  }
  
  let slides = Array.from(carousel.querySelectorAll('.lottie-slide'));
  const expectedSlides = 4;
  
  // Se há mais slides do que o esperado, remover os extras
  if (slides.length > expectedSlides) {
    console.log(`[Banner Carousel] Encontrados ${slides.length} slides, removendo ${slides.length - expectedSlides} duplicados...`);
    for (let i = expectedSlides; i < slides.length; i++) {
      slides[i].remove();
    }
    // Re-obter slides após remoção
    slides = Array.from(carousel.querySelectorAll('.lottie-slide'));
  }
  
  const paginationContainer = carousel.querySelector('.pagination-container');
  
  if (!track) {
    console.error('[Banner Carousel] Trilho (.carousel-track) não encontrado!');
    return;
  }
  
  if (slides.length <= 1) {
    if (slides.length === 1) {
        const container = slides[0].querySelector('.lottie-animation-container');
        if (container) {
          // Banner é arquivo local - usar caminho relativo
          lottie.loadAnimation({ 
            container, 
            renderer: 'svg', 
            loop: true, 
            autoplay: true, 
            path: './banner_receitas.json' 
          });
        }
    }
    console.log('[Banner Carousel] Apenas 1 slide ou menos. Carrossel desabilitado.');
    return;
  }

  let currentIndex = 0;
  let carouselInterval = null;
  let isInitializing = true; // Flag para indicar inicialização
  const DURATION = 7000;
  const loadedAnimations = [];
  
  // Atualizar referências globais
  globalCarouselInterval = carouselInterval;
  globalLoadedAnimations = loadedAnimations;
  // Banners são arquivos locais - usar caminhos relativos
  // NÃO usar BASE_APP_URL pois os banners estão no app, não no servidor
  const animationPaths = [
    './banner_receitas.json', 
    './banner2.json', 
    './banner3.json', 
    './banner4.json'
  ];
  const slidesCount = slides.length;

  // =========================================================================
  //         FUNÇÕES DE CONTROLE (SIMPLIFICADAS E ROBUSTAS)
  // =========================================================================

  function goToSlide(index, withAnimation = true, startTimer = true) {
    // CÉREBRO (JS): Calcula o índice correto usando o operador de módulo para criar o loop.
    // Este operador garante que o índice sempre esteja entre 0 e 3, criando o efeito de loop.
    currentIndex = ((index % slidesCount) + slidesCount) % slidesCount;

    if (!withAnimation) {
      track.classList.add('no-transition');
    }

    const slideWidth = slides[0].offsetWidth;
    // CÉREBRO (JS): Calcula a posição final e atualiza o estilo.
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    
    // MÚSCULO (CSS): A propriedade 'transition' no seu CSS fará a animação suavemente até este ponto,
    // usando a GPU para garantir 60fps e fluidez máxima.
    
    if (!withAnimation) {
        track.offsetHeight; // Força reflow para aplicar a mudança
        track.classList.remove('no-transition');
    }

    // Controla animações Lottie
    loadedAnimations.forEach((anim, i) => {
        if (anim) {
          if (i === currentIndex) {
            anim.play();
          } else {
            anim.stop();
          }
        }
    });

    // Atualiza paginação APENAS se não estiver inicializando
    if (!isInitializing) {
        updatePagination();
    } else {
        // Se estiver inicializando, só reseta sem animar
        progressFills.forEach(fill => {
            fill.style.transition = 'none';
            fill.style.width = '0%';
            fill.style.setProperty('width', '0%', 'important');
        });
    }
    
    if (startTimer) {
        restartCarouselTimer();
    }
  }
  
  function nextSlide() {
    // Timer automático: sempre faz loop
    goToSlide(currentIndex + 1); 
  }

  function prevSlide() {
    // Timer automático: sempre faz loop
    goToSlide(currentIndex - 1); 
  }

  function updatePagination(resetOnly = false) {
      progressFills.forEach((fill, i) => {
          fill.style.transition = 'none';
          fill.style.width = '0%';
          fill.style.removeProperty('width'); // Remove qualquer !important anterior
          // Só anima se não for resetOnly E não estiver na fase de inicialização
          if (i === currentIndex && !resetOnly && !isInitializing) {
              // Usa requestAnimationFrame duplo para garantir que o reset seja aplicado antes da animação
              requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                      // Garante que a transição está definida antes de mudar o width
                      fill.style.transition = `width ${DURATION}ms linear`;
                      // Força um reflow antes de aplicar o width
                      fill.offsetHeight;
                      fill.style.width = '100%';
                  });
              });
          }
      });
  }
  
  // =========================================================================
  //         SISTEMA DE SWIPE (LÓGICA ROBUSTA E SIMPLES)
  // =========================================================================
  let isDragging = false;
  let startX = 0;
  let startTranslate = 0;
  let currentTranslate = 0;

  function getPositionX(e) {
    return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
  }

  function handleStart(e) {
    isDragging = true;
    startX = getPositionX(e);
    stopCarouselTimer();
    
    // CÉREBRO (JS): Diz ao CSS para desativar a animação durante o arraste.
    carousel.classList.add('is-dragging');
    
    // NOVO: Bloqueia o scroll da página durante o toque no carrossel
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    
    // Captura a posição atual do trilho
    const transformMatrix = new WebKitCSSMatrix(window.getComputedStyle(track).transform);
    startTranslate = transformMatrix.m41;
    currentTranslate = startTranslate;
  }

  function handleMove(e) {
    if (!isDragging) return;
    
    // NOVO: Previne o scroll da página durante o arraste no mobile
    e.preventDefault();
    
    const currentX = getPositionX(e);
    const diffX = currentX - startX;
    let newTranslate = startTranslate + diffX;
    
    // LIMITE: Impede arrastar além dos limites
    const slideWidth = slides[0].offsetWidth;
    const minTranslate = -(slidesCount - 1) * slideWidth; // Último slide
    const maxTranslate = 0; // Primeiro slide
    
    // Se está no primeiro slide (index 0) e tentando arrastar para direita
    if (currentIndex === 0 && newTranslate > maxTranslate) {
      newTranslate = maxTranslate;
    }
    
    // Se está no último slide (index 3) e tentando arrastar para esquerda
    if (currentIndex === slidesCount - 1 && newTranslate < minTranslate) {
      newTranslate = minTranslate;
    }
    
    currentTranslate = newTranslate;
    
    // CÉREBRO (JS): Atualiza a posição em tempo real enquanto o dedo se move.
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function handleEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    // CÉREBRO (JS): Diz ao CSS para reativar a animação.
    carousel.classList.remove('is-dragging');
    
    // NOVO: Reativa o scroll da página quando soltar o toque
    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    const movedBy = currentTranslate - startTranslate;
    const threshold = slides[0].offsetWidth * 0.2; // 20% de arraste

    // A decisão de ir para o próximo/anterior é simples
    if (movedBy < -threshold) {
        nextSlide();
    } else if (movedBy > threshold) {
        prevSlide();
    } else {
        // Se não arrastou o suficiente, volta para o slide atual
        goToSlide(currentIndex);
    }
  }

  // =========================================================================
  //         TIMERS E GERENCIAMENTO
  // =========================================================================
  function startCarouselTimer() {
    stopCarouselTimer();
    // Garante que a flag está desativada antes de atualizar paginação
    isInitializing = false;
    // Primeiro atualiza a paginação para começar a animar a barra do slide atual
    updatePagination();
    // Timer automático sempre faz loop infinito
    carouselInterval = setInterval(nextSlide, DURATION);
    // Atualizar referência global
    window.globalCarouselInterval = carouselInterval;
    globalCarouselInterval = window.globalCarouselInterval;
  }
  
  function stopCarouselTimer() { 
    clearInterval(carouselInterval);
    if (window.globalCarouselInterval) {
      clearInterval(window.globalCarouselInterval);
      window.globalCarouselInterval = null;
      globalCarouselInterval = null;
    }
  }
  
  function restartCarouselTimer() { 
    startCarouselTimer(); 
  }

  // =========================================================================
  //         CONFIGURAÇÃO INICIAL
  // =========================================================================
  const progressFills = [];
  slides.forEach(() => {
    const item = document.createElement('div');
    item.className = 'pagination-item';
    const fill = document.createElement('div');
    fill.className = 'pagination-fill';
    // GARANTE que começa em 0% explicitamente
    fill.style.width = '0%';
    fill.style.transition = 'none';
    item.appendChild(fill);
    paginationContainer.appendChild(item);
    progressFills.push(fill);
  });
  
  // Event Listeners
  carousel.addEventListener('mousedown', handleStart);
  carousel.addEventListener('mousemove', handleMove);
  carousel.addEventListener('mouseup', handleEnd);
  carousel.addEventListener('mouseleave', handleEnd);
  
  // NOVO: { passive: false } permite preventDefault() para bloquear scroll
  carousel.addEventListener('touchstart', handleStart, { passive: false });
  carousel.addEventListener('touchmove', handleMove, { passive: false });
  carousel.addEventListener('touchend', handleEnd, { passive: false });
  
  // Ajusta a posição ao redimensionar a janela
  window.addEventListener('resize', () => goToSlide(currentIndex, false));
  
  // Click handler para navegação (adiciona ao carousel diretamente)
  carousel.addEventListener('click', (e) => {
    // Previne clique se o usuário acabou de arrastar
    const movedBy = Math.abs(currentTranslate - startTranslate);
    if (isDragging || movedBy > 10) return;

    const link = slides[currentIndex].dataset.link;
    if (link && link !== '#') {
      window.location.href = link;
    }
  });

  // =========================================================================
  //         CARREGAR ANIMAÇÕES E INICIAR
  // =========================================================================
  
  // Inicia o carrossel imediatamente (não espera carregar)
  // PRIMEIRO: Garante que todas as barras estão em 0% e sem transição
  progressFills.forEach(fill => {
      fill.style.width = '0%';
      fill.style.transition = 'none';
      fill.style.setProperty('width', '0%', 'important');
  });
  
  // Vai para o primeiro slide sem iniciar o timer ainda
  goToSlide(0, false, false);
  
  // Função para forçar reset das barras
  function forceResetBars() {
      progressFills.forEach(fill => {
          fill.style.transition = 'none';
          fill.style.width = '0%';
          fill.style.setProperty('width', '0%', 'important');
          fill.offsetHeight; // Force reflow
      });
  }
  
  // Aguarda frames para garantir que o reset foi aplicado
  requestAnimationFrame(() => {
      forceResetBars();
      requestAnimationFrame(() => {
          forceResetBars();
          requestAnimationFrame(() => {
              forceResetBars();
              
              // Delay maior para desktop em modo mobile
              setTimeout(() => {
                  // FORÇA o reset MAIS UMA VEZ antes de iniciar
                  forceResetBars();
                  
                  // Verifica se ainda está em 0% antes de iniciar
                  const firstFill = progressFills[0];
                  if (firstFill && firstFill.style.width !== '0%') {
                      firstFill.style.width = '0%';
                      firstFill.style.setProperty('width', '0%', 'important');
                  }
                  
                  // Agora inicia o timer (a flag será desativada dentro de startCarouselTimer)
                  startCarouselTimer();
              }, 200);
          });
      });
  });
  
  // Carrega as animações em paralelo
  slides.forEach((slide, index) => {
    const container = slide.querySelector('.lottie-animation-container');
    if (!container) {
      console.warn(`[Banner Carousel] Container não encontrado no slide ${index}`);
      return;
    }
    
    // Limpar container antes de carregar nova animação
    container.innerHTML = '';
    
    const anim = lottie.loadAnimation({
        container, 
        renderer: 'svg', 
        loop: true, 
        autoplay: (index === 0), // Primeiro slide começa automaticamente
        path: animationPaths[index]
    });
    
    anim.addEventListener('DOMLoaded', () => {
        console.log(`[Banner Carousel] Animação ${index} carregada.`);
        loadedAnimations[index] = anim;
        // Atualizar referência global
        window.globalLoadedAnimations[index] = anim;
        globalLoadedAnimations[index] = window.globalLoadedAnimations[index];
        
        // Se é o primeiro slide e ainda está visível, garante que está tocando
        if (index === 0 && currentIndex === 0) {
          anim.play();
        }
    });
    
    anim.addEventListener('data_failed', () => {
      console.error(`[Banner Carousel] Falha ao carregar animação ${index}`);
    });
  });
}

// Função para inicializar o carrossel (reutilizável)
function tryInitCarousel() {
  console.log('[Banner Carousel] Tentando inicializar carrossel...');
  
  const carousel = document.querySelector('.main-carousel');
  if (carousel) {
    // Aguardar um pouco mais para garantir que Lottie.js carregou
    if (typeof lottie !== 'undefined') {
      initLottieCarousel();
    } else {
      console.warn('[Banner Carousel] Lottie.js não foi encontrado. Tentando novamente em 500ms...');
      // Tentar novamente após um delay
      setTimeout(() => {
        if (typeof lottie !== 'undefined') {
          initLottieCarousel();
        } else {
          console.error('[Banner Carousel] Lottie.js ainda não foi encontrado após delay.');
        }
      }, 500);
    }
  } else {
    console.log('[Banner Carousel] Container .main-carousel não encontrado nesta página. Script inativo.');
  }
}

// Aguarda o window.load para garantir que todos os scripts carregaram
window.addEventListener('load', () => {
  console.log('[Banner Carousel] Window load event - verificando se o carrossel existe...');
  tryInitCarousel();
});

// Suporte para navegação SPA - re-inicializar quando main_app for carregado via SPA
// Usar uma flag para evitar múltiplas inicializações simultâneas
let isReinitializing = false;

window.addEventListener('spa-page-loaded', function(e) {
  if (e.detail && e.detail.isSPANavigation) {
    const pageName = window.location.pathname.split('/').pop();
    if (pageName === 'main_app.html' || pageName === 'dashboard.html') {
      // Evitar múltiplas inicializações simultâneas
      if (isReinitializing) {
        console.log('[Banner Carousel] Já está re-inicializando, ignorando...');
        return;
      }
      
      isReinitializing = true;
      console.log('[Banner Carousel] Página main_app carregada via SPA - limpando e re-inicializando carrossel...');
      
      // Limpar completamente antes de re-inicializar
      if (window.globalCarouselInterval) {
        clearInterval(window.globalCarouselInterval);
        window.globalCarouselInterval = null;
        globalCarouselInterval = null;
      }
      
      window.globalLoadedAnimations.forEach(anim => {
        if (anim && typeof anim.destroy === 'function') {
          try {
            anim.destroy();
          } catch (e) {
            console.warn('[Banner Carousel] Erro ao destruir animação:', e);
          }
        }
      });
      window.globalLoadedAnimations = [];
      globalLoadedAnimations = window.globalLoadedAnimations;
      
      // Limpar paginação antiga E containers de animação
      const carousel = document.querySelector('.main-carousel');
      if (carousel) {
        const paginationContainer = carousel.querySelector('.pagination-container');
        if (paginationContainer) {
          paginationContainer.innerHTML = '';
        }
        
        // Limpar TODOS os containers de animação para evitar duplicatas
        const animationContainers = carousel.querySelectorAll('.lottie-animation-container');
        animationContainers.forEach(container => {
          container.innerHTML = '';
        });
      }
      
      // Aguardar um pouco mais para garantir que o HTML foi completamente inserido
      setTimeout(() => {
        tryInitCarousel();
        // Resetar flag após um delay
        setTimeout(() => {
          isReinitializing = false;
        }, 1000);
      }, 300);
    }
  }
});