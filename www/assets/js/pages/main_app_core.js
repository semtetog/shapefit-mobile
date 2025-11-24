(function(){
    if (window.__MAIN_APP_CORE_LOADED) return;
    window.__MAIN_APP_CORE_LOADED = true;
    if (window.navigator.standalone === true) {document.addEventListener('click', function(event) {var target = event.target; while (target && target.nodeName !== 'A') { target = target.parentNode; } if (target && target.nodeName === 'A' && target.target !== '_blank') {event.preventDefault(); window.location.href = target.href;}}, false);}

    function showPointsPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'points-popup';
        popup.innerHTML = `<i class="fas fa-star star-icon"></i>${message}`;
        document.body.appendChild(popup);
        setTimeout(() => { popup.remove(); }, 2500);
    }
    
    // Função para animar contagem de pontos de forma fluida
    function animatePointsCount(element, startValue, endValue, duration) {
        const startTime = performance.now();
        const formatNumber = (num) => new Intl.NumberFormat('pt-BR').format(num);
        
        // Usar easing mais suave (ease-in-out cubic)
        function easeInOutCubic(t) {
            return t < 0.5 
                ? 4 * t * t * t 
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing mais fluido
            const easedProgress = easeInOutCubic(progress);
            
            const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
            element.textContent = formatNumber(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Garantir valor final exato
                element.textContent = formatNumber(endValue);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    // Função genérica para animar estrela voando de qualquer elemento para o badge
    // Animação tipo videogame com trajetória perfeita usando requestAnimationFrame
    function animateStarToBadgeFromElement(sourceElement, points, newTotalPoints) {
        const pointsBadge = document.querySelector('.points-counter-badge');
        const pointsDisplay = document.getElementById('user-points-display');
        
        if (!sourceElement || !pointsBadge || !pointsDisplay || points <= 0) {
            // Se não tem pontos ou elementos não existem, apenas atualizar normalmente
            if (newTotalPoints !== undefined && pointsDisplay) {
                pointsDisplay.textContent = new Intl.NumberFormat('pt-BR').format(newTotalPoints);
            }
            return;
        }
        
        // Obter posições EXATAS
        const sourceRect = sourceElement.getBoundingClientRect();
        const badgeRect = pointsBadge.getBoundingClientRect();
        
        // Encontrar o ícone da estrela DENTRO do badge (não apenas o centro)
        const starIcon = pointsBadge.querySelector('i.fa-star');
        let endX, endY;
        
        if (starIcon) {
            // Se encontrou o ícone, usar sua posição exata
            const starRect = starIcon.getBoundingClientRect();
            endX = starRect.left + starRect.width / 2;
            endY = starRect.top + starRect.height / 2;
        } else {
            // Fallback: centro do badge
            endX = badgeRect.left + badgeRect.width / 2;
            endY = badgeRect.top + badgeRect.height / 2;
        }
        
        // Posição inicial (centro do elemento fonte)
        const startX = sourceRect.left + sourceRect.width / 2;
        const startY = sourceRect.top + sourceRect.height / 2;
        
        // Calcular distância total
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Duração baseada na distância (mais rápido para distâncias curtas, mais lento para longas)
        // Mínimo 1.2s, máximo 2.5s
        const baseDuration = 1800; // 1.8 segundos base
        const duration = Math.min(Math.max(baseDuration, distance * 0.8), 2500);
        
        // Obter valor atual dos pontos
        const currentPointsText = pointsDisplay.textContent.replace(/\./g, '').replace(/,/g, '');
        const currentPoints = parseInt(currentPointsText) || 0;
        
        // Criar estrela voadora
        const flyingStar = document.createElement('div');
        flyingStar.className = 'flying-star';
        flyingStar.innerHTML = '<i class="fas fa-star"></i>';
        // Posicionar inicialmente usando left/top para garantir que fique na posição correta
        flyingStar.style.left = `${startX}px`;
        flyingStar.style.top = `${startY}px`;
        flyingStar.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
        flyingStar.style.willChange = 'transform, opacity';
        
        document.body.appendChild(flyingStar);
        
        // Forçar reflow
        flyingStar.offsetHeight;
        
        // Função de easing tipo videogame (ease-out com bounce sutil no final)
        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }
        
        // Função de easing com ligeiro "bounce" no final (tipo videogame)
        function easeOutBack(t) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        }
        
        // Animação com requestAnimationFrame para controle preciso
        // RECALCULA POSIÇÕES EM TEMPO REAL para acompanhar scroll
        const startTime = performance.now();
        let animationFrameId;
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // RECALCULAR posição final do badge EM TEMPO REAL (para acompanhar scroll)
            let currentEndX, currentEndY;
            const currentBadgeRect = pointsBadge.getBoundingClientRect();
            const currentBadgeStarIcon = pointsBadge.querySelector('i.fa-star');
            
            if (currentBadgeStarIcon) {
                const currentBadgeStarRect = currentBadgeStarIcon.getBoundingClientRect();
                currentEndX = currentBadgeStarRect.left + currentBadgeStarRect.width / 2;
                currentEndY = currentBadgeStarRect.top + currentBadgeStarRect.height / 2;
            } else {
                currentEndX = currentBadgeRect.left + currentBadgeRect.width / 2;
                currentEndY = currentBadgeRect.top + currentBadgeRect.height / 2;
            }
            
            // RECALCULAR posição inicial também (caso elemento fonte tenha se movido)
            const currentSourceRect = sourceElement.getBoundingClientRect();
            const currentStartX = currentSourceRect.left + currentSourceRect.width / 2;
            const currentStartY = currentSourceRect.top + currentSourceRect.height / 2;
            
            // Calcular delta atualizado
            const currentDeltaX = currentEndX - currentStartX;
            const currentDeltaY = currentEndY - currentStartY;
            const currentDistance = Math.sqrt(currentDeltaX * currentDeltaX + currentDeltaY * currentDeltaY);
            
            // Usar easing suave (ease-out cubic) para movimento natural
            const easedProgress = easeOutCubic(progress);
            
            // Calcular posição atual baseada nas posições RECALCULADAS
            const currentX = currentStartX + (currentDeltaX * easedProgress);
            const currentY = currentStartY + (currentDeltaY * easedProgress);
            
            // Adicionar curva suave (parábola leve) para trajetória mais natural
            const curveHeight = Math.min(currentDistance * 0.12, 80); // Reduzido para curva mais suave
            const curveProgress = Math.sin(progress * Math.PI); // Curva em formato de onda
            const curveOffset = -curveHeight * curveProgress; // Offset vertical para curva
            
            // ESCALA SUAVIZADA - evitar mudanças bruscas
            let scale;
            // Usar easing para suavizar transições de escala
            if (progress < 0.2) {
                // Início: escala aumenta suavemente
                const scaleProgress = progress / 0.2;
                scale = 1 + (0.3 * easeOutCubic(scaleProgress)); // Reduzido de 0.4 para 0.3
            } else if (progress < 0.75) {
                // Meio: escala diminui suavemente
                const scaleProgress = (progress - 0.2) / 0.55;
                const easedScaleProgress = easeOutCubic(scaleProgress);
                scale = 1.3 - (0.4 * easedScaleProgress); // Reduzido de 0.6 para 0.4
            } else {
                // Final: escala aumenta ligeiramente antes de desaparecer
                const finalProgress = (progress - 0.75) / 0.25;
                const easedFinalProgress = easeOutCubic(finalProgress);
                scale = 0.9 + (0.2 * easedFinalProgress); // Reduzido de 0.3 para 0.2
            }
            
            // Rotação dinâmica (gira durante o voo) - suavizada
            const rotation = progress * 360 * 1.5; // Reduzido de 2 para 1.5 rotações
            
            // Opacidade (fade out suave no final)
            let opacity = 1;
            if (progress > 0.9) {
                // Fade out apenas nos últimos 10%
                opacity = 1 - ((progress - 0.9) / 0.1);
            }
            
            // Usar left/top + transform para garantir que a estrela não saia da viewport
            flyingStar.style.left = `${currentX}px`;
            flyingStar.style.top = `${currentY + curveOffset}px`;
            flyingStar.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
            flyingStar.style.opacity = opacity;
            
            // Continuar animação ou finalizar
            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                // Animação completa
                if (flyingStar.parentNode) {
                    flyingStar.parentNode.removeChild(flyingStar);
                }
                
                // Atualizar pontos quando estrela chega
                const finalPoints = newTotalPoints !== undefined ? newTotalPoints : (currentPoints + points);
                
                // Adicionar classe de animação no badge
                pointsBadge.classList.add('points-updated');
                
                // Animar contagem dos pontos
                pointsDisplay.classList.add('points-counting');
                
                // Atualizar valor com animação de contagem
                animatePointsCount(pointsDisplay, currentPoints, finalPoints, 1500);
                
                // Remover classes de animação após animação
                setTimeout(() => {
                    pointsBadge.classList.remove('points-updated');
                    pointsDisplay.classList.remove('points-counting');
                }, 2000);
            }
        }
        
        // Iniciar animação
        animationFrameId = requestAnimationFrame(animate);
        
        // Limpar animação se elemento for removido
        flyingStar._animationId = animationFrameId;
    }
    
    // Função para mostrar popup de pontos e animar estrela voando
    function showPointsWithStarAnimation(message, sourceElement, points, newTotalPoints) {
        // Mostrar popup temporário
        const popup = document.createElement('div');
        popup.className = 'points-popup';
        popup.innerHTML = `<i class="fas fa-star star-icon" id="points-popup-star"></i>${message}`;
        document.body.appendChild(popup);
        
        // Após um pequeno delay, fazer estrela voar
        setTimeout(() => {
            const starIcon = document.getElementById('points-popup-star');
            if (starIcon) {
                animateStarToBadgeFromElement(starIcon, points, newTotalPoints);
            }
            // Remover popup após um tempo
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
            }, 1000);
        }, 500);
    }

    // Variáveis globais para missões
    let missionSlides = [];
    let completionCard = null;
    let completedMissionsCount = 0;
    let totalMissionsCount = 0;
    let pendingSlides = [];
    
    // Garantir que funções sejam globais para evitar problemas com SPA
    if (typeof window.showCurrentMission === 'undefined') {
        window.showCurrentMission = function() {
            // Lógica simples igual ao main_app.php
            if (typeof missionSlides !== 'undefined' && missionSlides) {
                missionSlides.forEach(s => s.classList.remove('active'));
            }
            if (completionCard) completionCard.classList.remove('active');
            
            if (pendingSlides.length > 0) {
                pendingSlides[0].classList.add('active');
            } else {
                if (completionCard) completionCard.classList.add('active');
            }
        };
    }
    
    if (typeof window.initializeMissionsCarousel === 'undefined') {
        window.initializeMissionsCarousel = function() {
            // --- LÓGICA DO CARROSSEL DE MISSÕES ---
        const missionsCarousel = document.getElementById('missions-carousel');
        if (!missionsCarousel) {
            // Tentar novamente depois de um delay se não encontrou
            setTimeout(initializeMissionsCarousel, 100);
            return;
        }
        
        // Remover event listeners antigos se existirem
        const newCarousel = missionsCarousel.cloneNode(true);
        missionsCarousel.parentNode.replaceChild(newCarousel, missionsCarousel);
        
        // Buscar elementos novamente
        const updatedCarousel = document.getElementById('missions-carousel');
        missionSlides = Array.from(updatedCarousel.querySelectorAll('.mission-slide:not(.completion-message)'));
        completionCard = document.getElementById('all-missions-completed-card');
        pendingSlides = missionSlides.filter(slide => slide.dataset.completed === '0');
        
        if (missionSlides.length > 0 || completionCard) {
            showCurrentMission();
        }
        
        // Event listener simples igual ao main_app.php
        updatedCarousel.addEventListener('click', function(event) {
            // Prevenir múltiplos cliques
            if (event.target.disabled || event.target.classList.contains('processing')) {
                return;
            }

            const completeButton = event.target.closest('.complete-btn');
            const skipButton = event.target.closest('.skip-btn');
            const durationButton = event.target.closest('.duration-btn');
            const sleepButton = event.target.closest('.sleep-btn');
            
            if (!completeButton && !skipButton && !durationButton && !sleepButton) return;
            
            const currentSlide = pendingSlides[0];
            if (!currentSlide) return;

            if (skipButton) {
                // Lógica simples: move para o final da fila
                pendingSlides.push(pendingSlides.shift());
                showCurrentMission();
            } else if (durationButton) {
                // Botão de duração clicado
                const missionId = durationButton.dataset.missionId;
                showExerciseDurationModal(missionId, currentSlide, durationButton);
            } else if (sleepButton) {
                // Botão de sono clicado - apenas abre o modal
                const modal = document.getElementById('sleep-modal-main');
                if (modal) {
                    modal.classList.add('modal-visible');
                    document.body.style.overflow = 'hidden';
                }
            } else if (completeButton) {
                // Prevenir múltiplos cliques
                if (completeButton.disabled || completeButton.classList.contains('processing')) {
                    return;
                }

                // Se o botão tem a classe .disabled, mostra o alerta e para.
                if (completeButton.classList.contains('disabled')) {
                    const missionId = currentSlide.dataset.missionId;
                    if (String(missionId).startsWith('onboarding_')) {
                        alert('⚠️ Para completar, primeiro defina a duração do exercício!');
                    } 
                    else if (currentSlide.querySelector('.sleep-btn')) {
                        alert('⚠️ Para completar, primeiro registre seus horários de sono!');
                    }
                    return; // Impede que a tarefa seja completada.
                }
                
                // Se não tiver a classe .disabled, completa a tarefa.
                if (currentSlide.dataset.completed === '1') return;

                const missionId = currentSlide.dataset.missionId;
                
                // Verificar se é uma atividade de exercício (onboarding_)
                if (String(missionId).startsWith('onboarding_')) {
                    // Exercício onboarding - só funciona se já tiver duração definida
                    const durationBtn = currentSlide.querySelector('.duration-btn');
                    if (durationBtn && durationBtn.dataset.durationSet === 'true') {
                        completeExerciseWithDuration(missionId, durationBtn.dataset.duration, currentSlide, completeButton);
                    } else {
                        // Se chegou aqui por algum motivo (pouco provável com a verificação acima), mostre o popup
                        showPointsPopup('⚠️ Defina a duração do exercício primeiro!');
                    }
                } else if (currentSlide.querySelector('.sleep-btn')) {
                    // Item de sono - completar diretamente (botão só fica habilitado após registrar)
                    completeSleepRoutine(missionId, completeButton);
                } else {
                    // Completar diretamente para outras atividades
                    completeRoutineDirectly(missionId, completeButton);
                }
            }
        });
        };
    }
    
    function updateMissionsProgress() {
        const progressPercentage = totalMissionsCount > 0 ? (completedMissionsCount / totalMissionsCount) * 100 : 0;
        const progressBarFill = document.getElementById('missions-progress-bar');
        const progressText = document.getElementById('missions-progress-text');
        if (progressBarFill) { progressBarFill.style.width = `${progressPercentage}%`; }
        if (progressText) { progressText.textContent = `${completedMissionsCount} de ${totalMissionsCount}`; }
        
        // Verificar se todas as missões foram completadas e mostrar card de conclusão
        if (completedMissionsCount === totalMissionsCount && totalMissionsCount > 0) {
            const missionsCarousel = document.getElementById('missions-carousel');
            if (missionsCarousel) {
                // Verificar se o card de conclusão já existe
                let completionCard = document.getElementById('all-missions-completed-card');
                if (!completionCard) {
                    // Adicionar card de conclusão
                    const completionHTML = `
                        <div class="mission-slide completion-message active" id="all-missions-completed-card">
                            <div class="mission-details"><h4>Parabéns!</h4><p>Você completou sua jornada de hoje.</p></div>
                        </div>
                    `;
                    missionsCarousel.insertAdjacentHTML('beforeend', completionHTML);
                    completionCard = document.getElementById('all-missions-completed-card');
                    
                    // Adicionar classe ao container para aumentar altura
                    missionsCarousel.classList.add('has-completion');
                }
                
                // Atualizar slides e mostrar card de conclusão
                missionSlides = Array.from(missionsCarousel.querySelectorAll('.mission-slide:not(.completion-message)'));
                pendingSlides = missionSlides.filter(slide => slide.dataset.completed === '0');
                showCurrentMission();
            }
        }
    }
    
    // Função para mostrar modal de duração de exercício
    function showExerciseDurationModal(missionId, currentSlide, durationButton) {
                console.log('showExerciseDurationModal chamada!');
                const exerciseName = missionId.replace('onboarding_', '');
                const modal = document.getElementById('exercise-duration-modal');
                const durationInput = document.getElementById('exercise-duration-input');
                
                if (!modal) {
                    console.error('Modal não encontrado!');
                    return;
                }
                
                // Configurar o modal
                modal.querySelector('h2').textContent = `⏱️ Duração - ${exerciseName}`;
                
                // NOVO: Pré-preenche o valor se já foi definido (funcionalidade de edição)
                if (durationButton.dataset.durationSet === 'true') {
                    durationInput.value = durationButton.dataset.duration;
                } else {
                    durationInput.value = 60; // Valor padrão para a primeira vez
                }
                
                modal.classList.add('modal-visible');
                console.log('Modal deve estar visível agora!');
                
                const cancelBtn = modal.querySelector('[data-action="close-modal"]');
                if (cancelBtn) {
                    cancelBtn.onclick = () => {
                        modal.classList.remove('modal-visible');
                    };
                }
                
                document.getElementById('confirm-exercise-duration').onclick = () => {
                    const duration = parseInt(durationInput.value);
                    if (duration >= 15 && duration <= 300) {
                        modal.classList.remove('modal-visible');

                        // Salva a duração no botão para referência futura
                        durationButton.dataset.durationSet = 'true';
                        durationButton.dataset.duration = duration;

                        // NOVO: Garante que o botão de duração (agora edição) esteja visível
                        durationButton.style.display = 'flex'; 
                        
                        // Habilita o botão de completar original
                        const completeBtn = currentSlide.querySelector('.complete-btn.disabled');
                        if (completeBtn) {
                            completeBtn.disabled = false;
                            completeBtn.classList.remove('disabled');
                        }

                        // NOVO: Mostra o texto da duração no card
                        const durationDisplay = currentSlide.querySelector('.mission-duration-display');
                        if (durationDisplay) {
                            durationDisplay.innerHTML = `<i class="fas fa-stopwatch" style="font-size: 0.8em;"></i> ${duration} min`;
                            durationDisplay.style.display = 'flex';
                        }
                        
                        console.log('Duração definida:', duration, 'minutos');
                    } else {
                        alert('Por favor, insira uma duração entre 15 e 300 minutos.');
                    }
                };
            }

    // Função para completar exercício com duração
    function completeExerciseWithDuration(missionId, duration, currentSlide, completeButton) {
                const routineIdToSend = missionId.replace('onboarding_', '');
                
                if (!duration || duration < 1) {
                    alert('Por favor, defina uma duração válida.');
                    return;
                }
                
                completeButton.disabled = true;
                completeButton.classList.add('processing');
                
                authenticatedFetch(`${window.BASE_APP_URL}/api/complete_exercise_with_duration.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        routine_id: routineIdToSend,
                        duration_minutes: parseInt(duration)
                    })
                })
                .then(async response => {
                    if (!response) {
                        throw new Error('Resposta vazia do servidor');
                    }
                    if (!response.ok) {
                        const text = await response.text();
                        console.error('Erro ao completar exercício:', text);
                        throw new Error(`Erro de Servidor (${response.status}): ${text.substring(0, 200)}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        currentSlide.dataset.completed = '1';
                        completedMissionsCount++;
                        updateMissionsProgress();
                        pendingSlides.shift();
                        
                        // Animar estrela voando se ganhou pontos
                        if (data.points_awarded > 0) {
                            const completeButton = currentSlide.querySelector('.complete-btn');
                            showPointsWithStarAnimation(
                                `+${data.points_awarded} Pontos`,
                                completeButton || currentSlide,
                                data.points_awarded,
                                data.new_total_points
                            );
                        } else if (data.new_total_points !== undefined) {
                            // Se não ganhou pontos mas tem novo total, atualizar normalmente
                            const pointsDisplay = document.getElementById('user-points-display');
                            if (pointsDisplay) {
                                pointsDisplay.textContent = new Intl.NumberFormat('pt-BR').format(data.new_total_points);
                            }
                        }
                        setTimeout(showCurrentMission, 300);
                    } else {
                        alert(data.message || 'Ocorreu um erro ao processar a solicitação.');
                        completeButton.disabled = false;
                        completeButton.classList.remove('processing');
                    }
                })
                .catch(error => {
                    console.error('Erro detalhado:', error);
                    alert('Falha na comunicação com o servidor. Verifique o console para mais detalhes.');
                    completeButton.disabled = false;
                    completeButton.classList.remove('processing');
                });
            }

    // Função para completar rotina de sono
    function completeSleepRoutine(missionId, completeButton) {
                const sleepData = JSON.parse(sessionStorage.getItem('sleep_data'));
                
                if (!sleepData || !sleepData.sleep_time || !sleepData.wake_time) {
                    alert('Por favor, registre os horários de sono primeiro.');
                    return;
                }
                
                completeButton.disabled = true;
                completeButton.classList.add('processing');
                
                authenticatedFetch(`${window.BASE_APP_URL}/api/complete_sleep_routine.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        routine_id: missionId,
                        sleep_time: sleepData.sleep_time,
                        wake_time: sleepData.wake_time
                    })
                })
                .then(async response => {
                    if (!response) {
                        throw new Error('Resposta vazia do servidor');
                    }
                    if (!response.ok) {
                        const text = await response.text();
                        console.error('Erro ao completar sono:', text);
                        throw new Error(`Erro de Servidor (${response.status}): ${text.substring(0, 200)}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        // Limpar dados do sessionStorage
                        sessionStorage.removeItem('sleep_data');
                        
                        // Atualizar o progresso das missões
                        const currentSlide = pendingSlides[0];
                        if (currentSlide) {
                            currentSlide.dataset.completed = '1';
                            completedMissionsCount++;
                            updateMissionsProgress();
                            pendingSlides.shift();
                            setTimeout(showCurrentMission, 300);
                        }
                        
                        // Animar estrela voando se ganhou pontos
                        if (data.points_awarded > 0) {
                            const completeButton = currentSlide.querySelector('.complete-btn');
                            showPointsWithStarAnimation(
                                `+${data.points_awarded} Pontos`,
                                completeButton || currentSlide,
                                data.points_awarded,
                                data.new_total_points
                            );
                        } else if (data.new_total_points !== undefined) {
                            // Se não ganhou pontos mas tem novo total, atualizar normalmente
                            const pointsDisplay = document.getElementById('user-points-display');
                            if (pointsDisplay) {
                                pointsDisplay.textContent = new Intl.NumberFormat('pt-BR').format(data.new_total_points);
                            }
                        }
                    } else {
                        alert('Erro: ' + (data.message || 'Falha ao registrar sono'));
                        completeButton.disabled = false;
                        completeButton.classList.remove('processing');
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Erro na comunicação com o servidor.');
                    completeButton.disabled = false;
                    completeButton.classList.remove('processing');
                });
            }

    // Função para completar rotinas normais (não exercícios)
    function completeRoutineDirectly(missionId, completeButton) {
                completeButton.disabled = true;
                completeButton.classList.add('processing');
                
                authenticatedFetch(`${window.BASE_APP_URL}/api/complete_routine_item.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        routine_id: missionId
                    })
                })
                .then(async response => {
                    if (!response) {
                        throw new Error('Resposta vazia do servidor');
                    }
                    if (!response.ok) {
                        const text = await response.text();
                        console.error('Erro ao completar rotina:', text);
                        throw new Error(`Erro de Servidor (${response.status}): ${text.substring(0, 200)}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        const currentSlide = pendingSlides[0];
                        if (currentSlide) {
                            currentSlide.dataset.completed = '1';
                            completedMissionsCount++;
                            updateMissionsProgress();
                            pendingSlides.shift();
                            
                            // Animar estrela voando se ganhou pontos
                            if (data.points_awarded > 0) {
                                const completeButton = currentSlide.querySelector('.complete-btn');
                                showPointsWithStarAnimation(
                                    `+${data.points_awarded} Pontos`,
                                    completeButton || currentSlide,
                                    data.points_awarded,
                                    data.new_total_points
                                );
                            } else if (data.new_total_points !== undefined) {
                                // Se não ganhou pontos mas tem novo total, atualizar normalmente
                                const pointsDisplay = document.getElementById('user-points-display');
                                if (pointsDisplay) {
                                    pointsDisplay.textContent = new Intl.NumberFormat('pt-BR').format(data.new_total_points);
                                }
                            }
                            setTimeout(showCurrentMission, 300);
                        }
                    } else {
                        alert(data.message || 'Ocorreu um erro ao processar a solicitação.');
                        completeButton.disabled = false;
                        completeButton.classList.remove('processing');
                    }
                })
                .catch(error => {
                    console.error('Erro detalhado:', error);
                    alert('Falha na comunicação com o servidor. Verifique o console para mais detalhes.');
                    completeButton.disabled = false;
                    completeButton.classList.remove('processing');
                });
            }
    
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar carrossel de missões (tentará novamente se não encontrar elementos)
        initializeMissionsCarousel();
        
        // Event listener para o botão de confirmar sono
        const confirmSleepBtn = document.getElementById('confirm-sleep-main');
        if (confirmSleepBtn) {
            confirmSleepBtn.addEventListener('click', function() {
                const modal = document.getElementById('sleep-modal-main');
                const sleepTime = modal.querySelector('#sleep-time-main').value;
                const wakeTime = modal.querySelector('#wake-time-main').value;

                if (!sleepTime || !wakeTime) {
                    alert('Por favor, preencha ambos os horários.');
                    return;
                }

                if (sleepTime === wakeTime) {
                    alert('Os horários de dormir e acordar não podem ser iguais.');
                    return;
                }

                // Salvar dados no sessionStorage
                const sleepData = {
                    sleep_time: sleepTime,
                    wake_time: wakeTime
                };
                sessionStorage.setItem('sleep_data', JSON.stringify(sleepData));

                // Fechar modal
                modal.classList.remove('modal-visible');
                document.body.style.overflow = '';

            // Habilitar o botão de completar (igual aos exercícios)
            const currentSlide = pendingSlides[0];
            if (currentSlide) {
                const completeBtn = currentSlide.querySelector('.complete-btn.disabled');
                if (completeBtn) {
                    completeBtn.classList.remove('disabled');
                }
                
                // Mostrar duração do sono (igual aos exercícios)
                const durationDisplay = currentSlide.querySelector('.mission-duration-display');
                if (durationDisplay) {
                    const sleepTime = new Date(`2000-01-01T${sleepData.sleep_time}`);
                    const wakeTime = new Date(`2000-01-01T${sleepData.wake_time}`);
                    
                    // Calcular diferença em horas
                    let diffMs = wakeTime - sleepTime;
                    if (diffMs < 0) {
                        // Se acordou no dia seguinte
                        diffMs += 24 * 60 * 60 * 1000;
                    }
                    const diffHours = Math.round(diffMs / (60 * 60 * 1000) * 10) / 10;
                    
                    durationDisplay.innerHTML = `<i class="fas fa-moon" style="font-size: 0.8em;"></i> ${diffHours}h de sono`;
                    durationDisplay.style.display = 'flex';
                }
            }
            });
        }

        // --- LÓGICA DO CARD DE HIDRATAÇÃO ---
        // Usar variáveis locais dentro de função para evitar re-declarações
        let waterLevelGroup = document.getElementById('water-level-group');
        let waterAmountDisplay = document.getElementById('water-amount-display');
		let waterAmountInput = document.getElementById('water-amount-input');
		let waterAddBtn = document.getElementById('water-add-btn');
		let waterUnitSelect = document.getElementById('water-unit-select');

        window.currentWater = window.currentWater || 0;
        const waterGoal = 2000;
        const CUP_SIZE_ML = 250;
        const dropHeight = 275.785; 

        function updateWaterDrop(animated = true) {
            // Verificar se elementos existem antes de acessar
            if (!waterLevelGroup || !waterAmountDisplay) {
                console.warn('[Water Drop] Elementos não encontrados, pulando atualização');
                return;
            }
            
            const percentage = waterGoal > 0 ? Math.min(window.currentWater / waterGoal, 1) : 0;
            const yTranslate = dropHeight * (1 - percentage);
            
            if (!animated) {
                waterLevelGroup.style.transition = 'none';
            }
            
            waterLevelGroup.setAttribute('transform', `translate(0, ${yTranslate})`);

            if (!animated) {
                // Força o navegador a aplicar o estilo sem transição imediatamente
                setTimeout(() => {
                    waterLevelGroup.style.transition = 'transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)';
                }, 50);
            }
            waterAmountDisplay.textContent = Math.round(window.currentWater);
        }

        function updateWaterOnServer() {
            // Converter ML de volta para copos para o servidor
            const waterInCups = Math.round(window.currentWater / CUP_SIZE_ML);
            
            authenticatedFetch(`${window.BASE_APP_URL}/api/update_water.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    water_consumed: waterInCups
                })
            })
            .then(async response => {
                if (!response) {
                    throw new Error('Resposta vazia do servidor');
                }
                if (!response.ok) {
                    const text = await response.text();
                    console.error('Erro ao atualizar água:', text);
                    throw new Error(`Erro do Servidor: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Animar estrela voando se ganhou pontos
                    if (data.points_awarded != 0 && data.points_awarded > 0) {
                        // Encontrar o elemento de água para usar como origem da estrela
                        const waterContainer = document.querySelector('.water-tracker-container') || 
                                              document.querySelector('.water-section') ||
                                              document.querySelector('.water-counter');
                        showPointsWithStarAnimation(
                            `+${data.points_awarded} Pontos`,
                            waterContainer || document.body,
                            data.points_awarded,
                            data.new_total_points
                        );
                    } else if (data.new_total_points !== undefined) {
                        // Se não ganhou pontos mas tem novo total, atualizar normalmente
                        const pointsDisplay = document.getElementById('user-points-display');
                        if (pointsDisplay) {
                            pointsDisplay.textContent = new Intl.NumberFormat('pt-BR').format(data.new_total_points);
                        }
                    }
                } else {
                    console.error('Falha ao atualizar a água no servidor:', data.message);
                }
            })
            .catch(err => {
                 console.error('Erro de conexão ou no servidor ao atualizar a água.', err);
            });
        }
        
		function clampToNonNegativeInteger(value) { value = Number(value) || 0; return value < 0 ? 0 : value; }
		function parseAmountToMl(amountValue) {
			const raw = String(amountValue || '').trim().toLowerCase();
			if (raw.endsWith('l') || (waterUnitSelect && waterUnitSelect.value === 'l')) {
				const n = parseFloat(raw.replace('l', '')) || 0;
				return Math.max(0, Math.round(n * 1000));
			}
			return Math.max(0, Math.round(parseFloat(raw) || 0));
		}

        let updateTimeout = null;
        function scheduleServerUpdate() {
            if (updateTimeout) clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => { updateWaterOnServer(); }, 600);
        }

        function mlToCups(ml) { return clampToNonNegativeInteger(Math.round((ml || 0) / CUP_SIZE_ML)); }

        function addMlAndUpdate(mlToAdd) {
            if (mlToAdd <= 0) return;
            window.currentWater = clampToNonNegativeInteger(window.currentWater + mlToAdd);
            updateWaterDrop();
            updateWaterOnServer();
        }

        function subMlAndUpdate(mlToSub) {
            if (mlToSub <= 0) return;
            window.currentWater = clampToNonNegativeInteger(window.currentWater - mlToSub);
            updateWaterDrop();
            updateWaterOnServer();
        }

        function updateControlsEnabled() {
            const amountMl = parseAmountToMl(waterAmountInput && waterAmountInput.value);
            const hasAmount = amountMl > 0;
            if (waterAddBtn) waterAddBtn.disabled = !hasAmount;
            if (waterRemoveBtn) waterRemoveBtn.disabled = !hasAmount;
        }

        if (waterAddBtn) {
            waterAddBtn.addEventListener('click', () => {
                let amountMl = parseAmountToMl(waterAmountInput && waterAmountInput.value);
                if (amountMl <= 0) return;
                addMlAndUpdate(amountMl);
                if (waterAmountInput) { waterAmountInput.value = ''; updateControlsEnabled(); }
            });
        }

		const waterRemoveBtn = document.getElementById('water-remove-btn');
		const waterRemoveFull = document.getElementById('water-remove-full');
        if (waterRemoveBtn) {
            waterRemoveBtn.addEventListener('click', () => {
				let amountMl = parseAmountToMl(waterAmountInput && waterAmountInput.value);
				if (amountMl <= 0) return;
                subMlAndUpdate(amountMl);
				if (waterAmountInput) { waterAmountInput.value = ''; updateControlsEnabled(); }
            });
        }
        if (waterRemoveFull) {
            waterRemoveFull.addEventListener('click', () => {
				let amountMl = parseAmountToMl(waterAmountInput && waterAmountInput.value);
				if (amountMl <= 0) return;
                subMlAndUpdate(amountMl);
				if (waterAmountInput) { waterAmountInput.value = ''; updateControlsEnabled(); }
            });
        }

		// Removidos chips de adição rápida conforme o design

        // Habilita/desabilita botões conforme o usuário digita
        if (waterAmountInput) {
            waterAmountInput.addEventListener('input', updateControlsEnabled);
        }
        if (waterUnitSelect) {
            waterUnitSelect.addEventListener('change', updateControlsEnabled);
        }

        // Verificar se elementos existem antes de chamar updateWaterDrop
        // Re-atualizar referências dos elementos (podem ter mudado após navegação SPA)
        waterLevelGroup = document.getElementById('water-level-group');
        waterAmountDisplay = document.getElementById('water-amount-display');
        if (waterLevelGroup && waterAmountDisplay && typeof updateWaterDrop === 'function') {
            updateWaterDrop(false);
        }
        updateControlsEnabled();


        // --- LÓGICA DOS CÍRCULOS DE PROGRESSO ---
        document.querySelectorAll('.progress-circle').forEach(circleElement => {
            const value = parseFloat(circleElement.dataset.value) || 0;
            const goal = parseFloat(circleElement.dataset.goal) || 1;
            const circle = circleElement.querySelector('.circle');
            const radius = 15.9155;
            const circumference = 2 * Math.PI * radius;
            
            let percent = (value / goal);
            if (percent > 1) percent = 1;
            if (percent < 0) percent = 0;

            const offset = circumference - (percent * circumference);

            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            setTimeout(() => {
                circle.style.strokeDashoffset = offset;
            }, 100);
        });

        // --- FUNCIONALIDADE DE SONO ---
        
        // Event listeners para fechar modal
        document.addEventListener('click', function(e) {
            if (e.target.closest('[data-action="close-modal"]')) {
                const modal = document.getElementById('sleep-modal-main');
                if (modal) {
                    modal.classList.remove('modal-visible');
                    document.body.style.overflow = '';
                }
            }
        });
        

    });
})();
