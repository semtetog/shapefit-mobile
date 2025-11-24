// =========================================================================
//         SHAPEFIT - SCRIPT.JS (MASTER SCRIPT PARA DASHBOARD)
// =========================================================================

// Função de inicialização que pode ser chamada via DOMContentLoaded ou SPA
function initMainAppScript() {
    console.log('ShapeFit Master Script Loaded');

    // =========================================================================
    //         BLOCO 0: FUNÇÕES GLOBAIS DE AJUDA
    // =========================================================================
    
    window.showSinglePopup = function(points, eventType = 'gain') {
        if (points === 0) return;
        const popup = document.createElement('div');
        popup.className = 'points-popup';
        popup.classList.add(eventType);
        const absPoints = Math.abs(points);
        let message = '';
        if (eventType === 'bonus') { message = `+${absPoints} PONTOS BÔNUS!`; }
        else if (eventType === 'loss') { message = `-${absPoints} Pontos`; }
        else { message = `+${absPoints} Pontos`; }
        const iconHTML = `<img src="https://i.ibb.co/8LXQt0Xy/POINTS.webp" alt="Pontos">`;
        popup.innerHTML = iconHTML + `<span>${message}</span>`;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 3000);
    }
    
    window.showAppNotification = function(message, type = 'info') {
        document.querySelector('.app-notification-popup')?.remove();
        const popup = document.createElement('div');
        popup.className = `app-notification-popup ${type}`;
        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        if (type === 'error') iconClass = 'fa-exclamation-triangle';
        popup.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 4000);
    }
    
    window.updateUserPointsDisplay = function(newTotal) {
        const pointsDisplay = document.getElementById('user-points-display');
        if (pointsDisplay) {
            const totalAsNumber = Number(newTotal);
            let formattedTotal = (totalAsNumber % 1 === 0)
                ? totalAsNumber.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                : totalAsNumber.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
            pointsDisplay.textContent = formattedTotal;
        }
    }
    
    const csrfToken = document.getElementById('csrf_token_main_app')?.value;

    // =========================================================================
    //         BLOCO 1: INICIALIZADOR DE PÁGINA (LOADER)
    // =========================================================================
    const loaderOverlay = document.getElementById('loader-overlay');
    if (loaderOverlay) {
        window.addEventListener('load', () => {
            loaderOverlay.style.opacity = '0';
            setTimeout(() => {
                loaderOverlay.remove();
            }, 500);
        });
    }

    // =========================================================================
    //         BLOCO 2: LÓGICA ESPECÍFICA DO DASHBOARD
    // =========================================================================
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (dashboardGrid) {
        
        // --- LÓGICA DE HIDRATAÇÃO (igual ao código antigo) ---
        const waterCard = document.getElementById('water-card');
        if (waterCard) {
            const waterLevelGroup = document.getElementById('water-level-group');
            let waterAmountDisplay = document.getElementById('water-amount-display');
            let waterAmountInput = document.getElementById('water-amount-input');
            let waterAddBtn = document.getElementById('water-add-btn');
            let waterRemoveBtn = document.getElementById('water-remove-btn');
            let waterUnitSelect = document.getElementById('water-unit-select');

            window.currentWater = window.currentWater || 0;
            const waterGoal = 2000;
            const CUP_SIZE_ML = 250;
            const dropHeight = 275.785; 

            function updateWaterDrop(animated = true) {
                if (!waterLevelGroup || !waterAmountDisplay) {
                    console.warn('[Water Drop] Elementos não encontrados');
                    return;
                }
                
                const percentage = waterGoal > 0 ? Math.min(window.currentWater / waterGoal, 1) : 0;
                const yTranslate = dropHeight * (1 - percentage);
                
                if (!animated) {
                    waterLevelGroup.style.transition = 'none';
                }
                
                waterLevelGroup.setAttribute('transform', `translate(0, ${yTranslate})`);

                if (!animated) {
                    setTimeout(() => {
                        waterLevelGroup.style.transition = 'transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)';
                    }, 50);
                }
                waterAmountDisplay.textContent = Math.round(window.currentWater);
            }

            function updateWaterOnServer() {
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
                    if (!response || !response.ok) {
                        throw new Error(`Erro: ${response?.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        if (data.points_awarded != 0 && data.points_awarded > 0) {
                            showSinglePopup(data.points_awarded, 'gain');
                        }
                        if (data.new_total_points !== undefined) {
                            updateUserPointsDisplay(data.new_total_points);
                        }
                    }
                })
                .catch(err => {
                    console.error('Erro ao atualizar água:', err);
                });
            }
            
            function clampToNonNegativeInteger(value) { 
                value = Number(value) || 0; 
                return value < 0 ? 0 : value; 
            }
            
            function parseAmountToMl(amountValue) {
                const raw = String(amountValue || '').trim().toLowerCase();
                if (raw.endsWith('l') || (waterUnitSelect && waterUnitSelect.value === 'l')) {
                    const n = parseFloat(raw.replace('l', '')) || 0;
                    return Math.max(0, Math.round(n * 1000));
                }
                return Math.max(0, Math.round(parseFloat(raw) || 0));
            }

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
                    if (waterAmountInput) { 
                        waterAmountInput.value = ''; 
                        updateControlsEnabled(); 
                    }
                });
            }

            if (waterRemoveBtn) {
                waterRemoveBtn.addEventListener('click', () => {
                    let amountMl = parseAmountToMl(waterAmountInput && waterAmountInput.value);
                    if (amountMl <= 0) return;
                    subMlAndUpdate(amountMl);
                    if (waterAmountInput) { 
                        waterAmountInput.value = ''; 
                        updateControlsEnabled(); 
                    }
                });
            }

            // Habilita/desabilita botões conforme o usuário digita
            if (waterAmountInput) {
                waterAmountInput.addEventListener('input', updateControlsEnabled);
            }
            if (waterUnitSelect) {
                waterUnitSelect.addEventListener('change', updateControlsEnabled);
            }

            // Re-atualizar referências após navegação SPA
            waterLevelGroup = document.getElementById('water-level-group');
            waterAmountDisplay = document.getElementById('water-amount-display');
            if (waterLevelGroup && waterAmountDisplay) {
                updateWaterDrop(false);
            }
            updateControlsEnabled();
        }

        // --- LÓGICA DOS CÍRCULOS DE PROGRESSO ---
        document.querySelectorAll('.progress-circle').forEach(circle => {
            const value = parseFloat(circle.dataset.value) || 0;
            const goal = parseFloat(circle.dataset.goal) || 1;
            const circlePath = circle.querySelector('.circle');
            if (!circlePath) return;
            const percentage = goal > 0 ? value / goal : 0;
            const circumference = 2 * Math.PI * 15.9155;
            const offset = circumference * (1 - Math.min(percentage, 1));
            
            circlePath.style.strokeDasharray = circumference;
            circlePath.style.strokeDashoffset = circumference;
            
            setTimeout(() => {
                circlePath.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.25, 1, 0.5, 1)';
                circlePath.style.strokeDashoffset = offset;
            }, 200);
        });
        
        // --- LÓGICA DA ROTINA (MISSÕES) ---
        const routineCard = document.querySelector('.card-routine');
        if (routineCard) {
            routineCard.addEventListener('click', async (event) => {
                const button = event.target.closest('.complete-mission-btn');
                if (!button || button.disabled) return;

                const missionItem = button.closest('.mission-item');
                const routineId = missionItem.dataset.routineId;

                button.classList.add('completed');
                button.disabled = true;

                try {
                    const response = await fetch('/api/update_routine_status.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `routine_id=${routineId}&status=1&csrf_token=${csrfToken}`
                    });
                    const result = await response.json();
                    
                    if (result.success) {
                        const progressFill = document.getElementById('routine-progress-fill');
                        const progressText = document.getElementById('routine-progress-text');
                        let [completed, total] = progressText.textContent.match(/\d+/g).map(Number);
                        completed++;
                        
                        progressFill.style.width = `${(completed / total) * 100}%`;
                        progressText.textContent = `${completed}/${total} concluídas`;
                        
                        if (result.points_awarded > 0) {
                            showSinglePopup(result.points_awarded, 'gain');
                            updateUserPointsDisplay(result.new_total_points);
                        }

                        missionItem.style.transition = 'all 0.5s ease';
                        missionItem.style.opacity = '0';
                        missionItem.style.transform = 'translateX(-20px)';
                        setTimeout(() => missionItem.remove(), 500);

                    } else { throw new Error(result.message); }
                } catch (error) {
                    showAppNotification(error.message || 'Erro ao atualizar missão.', 'error');
                    button.classList.remove('completed');
                    button.disabled = false;
                }
            });
        }
    }

    // =========================================================================
    //         BLOCO 3: LÓGICA DO CARROSSEL DE VÍDEO (DESABILITADO - USANDO LOTTIE)
    // =========================================================================
    
    // DESABILITADO: O carrossel de vídeo foi substituído por Lottie
    // Se você quiser reativar, descomente as linhas abaixo:
    /*
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoCarousel);
    } else {
        initVideoCarousel();
    }
    */

    // Função para lidar com cliques nos banners (mantida para compatibilidade)
    window.handleBannerClick = function(bannerNumber) {
        switch(bannerNumber) {
            case 1:
                // Banner 1: Página de receitas
                window.location.href = 'explore_recipes.php';
                break;
            case 2:
                // Banner 2: Sem funcionalidade
                return;
            case 3:
                // Banner 3: Página de rotinas
                window.location.href = 'routine.php';
                break;
            case 4:
                // Banner 4: Página de progresso
                window.location.href = 'progress.php';
                break;
        }
    }
    
    // Função initVideoCarousel comentada para não interferir com Lottie
    /*
    function initVideoCarousel() {
        // ... código do carrossel de vídeo comentado ...
    }
    */

    
    // =========================================================================
    //         BLOCO 4: LÓGICA DE COMPONENTES GERAIS (MODAIS, FORMS)
    // =========================================================================
    
    // --- LÓGICA DOS MODAIS ---
    document.addEventListener('click', (event) => {
        const openTrigger = event.target.closest('[data-action="open-weight-modal"]');
        if (openTrigger) {
            document.getElementById('edit-weight-modal')?.classList.add('visible');
        }
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal || event.target.closest('[data-action="close-modal"]')) {
                modal.classList.remove('visible');
            }
        });
    });

    // --- LÓGICA DE ATUALIZAÇÃO DE PESO ---
    const saveWeightBtn = document.getElementById('save-weight-btn');
    if (saveWeightBtn) {
        saveWeightBtn.addEventListener('click', async () => {
            const newWeight = document.getElementById('new-weight-input').value;
            const errorMessage = document.getElementById('weight-error-message');
            errorMessage.style.display = 'none';

            if (!newWeight || isNaN(newWeight) || newWeight <= 0) {
                errorMessage.textContent = 'Por favor, insira um peso válido.';
                errorMessage.style.display = 'block';
                return;
            }

            try {
                const response = await fetch('/api/update_weight.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `new_weight=${newWeight}&csrf_token=${csrfToken}`
                });
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('current-weight-value').textContent = `${result.new_weight_formatted}kg`;
                    document.getElementById('edit-weight-modal').classList.remove('visible');
                    if (result.points_awarded > 0) {
                        showSinglePopup(result.points_awarded, 'gain');
                        updateUserPointsDisplay(result.new_total_points);
                    }
                } else { throw new Error(result.message); }
            } catch (error) {
                errorMessage.textContent = error.message || 'Erro de conexão.';
                errorMessage.style.display = 'block';
            }
        });
    }

    // --- LÓGICA DE OPÇÕES SELECIONÁVEIS (PARA PÁGINAS DE ONBOARDING/PERFIL) ---
    document.querySelectorAll('.selectable-option').forEach(label => {
        const input = label.querySelector('input[type="radio"], input[type="checkbox"]');
        if (input?.checked) {
            label.classList.add('selected');
        }
        label.addEventListener('click', (event) => {
            event.preventDefault();
            const clickedInput = label.querySelector('input');
            if (!clickedInput) return;
            
            if (clickedInput.type === 'radio') {
                if (!clickedInput.checked) {
                    clickedInput.checked = true;
                    document.querySelectorAll(`input[name="${clickedInput.name}"]`).forEach(radio => {
                        radio.closest('.selectable-option')?.classList.remove('selected');
                    });
                    label.classList.add('selected');
                }
            } else {
                clickedInput.checked = !clickedInput.checked;
                label.classList.toggle('selected', clickedInput.checked);
            }
        });
    });
}

// Executar quando DOM estiver pronto (navegação tradicional)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainAppScript);
} else {
    initMainAppScript();
}

// Executar quando main_app for carregada via SPA
window.addEventListener('spa:enter-main_app', function() {
    // Aguardar um pouco para garantir que o DOM foi atualizado
    setTimeout(initMainAppScript, 100);
});