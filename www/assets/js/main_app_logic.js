// main_app_logic.js - Lógica da página principal do app
// Adaptado para eventos SPA
// Baseado na estrutura do código antigo (wwwantigo/main_app.html)

// Função principal para carregar dados
async function loadMainAppData() {
    console.log('[main_app_logic] loadMainAppData() chamado!');
    try {
        console.log('[main_app_logic] Verificando autenticação...');
        const authenticated = await requireAuth();
        console.log('[main_app_logic] Autenticado:', authenticated);
        if (!authenticated) {
            console.warn('[main_app_logic] Usuário não autenticado, redirecionando para login');
            if (window.router) {
                window.router.navigate('/login');
            }
            return;
        }
        
        // Mostrar o container do dashboard
        let dashboardContainer = document.getElementById('dashboard-container');
        if (!dashboardContainer) {
            const spaContainer = document.getElementById('spa-container');
            if (spaContainer) {
                dashboardContainer = spaContainer.querySelector('#dashboard-container');
            }
        }
        if (!dashboardContainer) {
            dashboardContainer = document.querySelector('.app-container');
        }
        
        console.log('[main_app_logic] Dashboard container encontrado:', !!dashboardContainer);
        if (dashboardContainer) {
            dashboardContainer.removeAttribute('style');
            dashboardContainer.style.display = 'block';
            dashboardContainer.style.visibility = 'visible';
            dashboardContainer.style.opacity = '1';
        } else {
            console.error('[main_app_logic] dashboard-container não encontrado!');
            return;
        }
        
        // Carregar dados do dashboard
        const apiUrl = `${window.BASE_APP_URL}/api/get_dashboard_data.php`;
        console.log('[main_app_logic] Carregando dados do dashboard...', apiUrl);
        
        const response = await authenticatedFetch(apiUrl);
        if (!response || !response.ok) {
            console.error('[main_app_logic] Erro ao carregar dados do dashboard');
            if (response) {
                const errorText = await response.text();
                console.error('[main_app_logic] Erro da API:', errorText);
            }
            return;
        }
        
        const result = await response.json();
        console.log('[main_app_logic] Resultado da API:', result);
        
        if (!result.success) {
            console.error('[main_app_logic] Erro na API:', result.message);
            return;
        }
        
        const data = result.data;
        console.log('[main_app_logic] Dados recebidos:', data);
        
        // Renderizar dashboard completo (igual ao código antigo)
        renderDashboard(data);
        
        // Inicializar carrossel de missões após renderizar
        setTimeout(() => {
            if (typeof initializeMissionsCarousel === 'function') {
                initializeMissionsCarousel();
            }
        }, 100);
        
        // Disparar evento customizado
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('main-app-data-loaded', { detail: data }));
            console.log('[main_app_logic] Evento main-app-data-loaded disparado');
        }, 200);
        
        console.log('[main_app_logic] Main app data loaded successfully');
        
    } catch (error) {
        console.error('[main_app_logic] Erro ao carregar dados do main_app:', error);
    }
}

// Função principal de renderização (igual ao código antigo)
function renderDashboard(data) {
    console.log('[main_app_logic] renderDashboard() chamado');
    
    // Atualizar pontos
    const pointsDisplay = document.getElementById('user-points-display');
    if (pointsDisplay && data.points !== undefined) {
        pointsDisplay.textContent = new Intl.NumberFormat('pt-BR').format(data.points);
        console.log('[main_app_logic] Pontos atualizados:', data.points);
    }
    
    // Atualizar avatar
    const profileIcon = document.getElementById('profile-icon-link');
    if (profileIcon && data.profile_image) {
        const img = profileIcon.querySelector('img') || document.createElement('img');
        img.src = `${window.BASE_APP_URL}/assets/images/users/${data.profile_image}`;
        img.alt = 'Foto de Perfil';
        img.onerror = function() {
            this.onerror = null;
            this.src = `${window.BASE_APP_URL}/assets/images/users/thumb_${data.profile_image}`;
            this.onerror = function() {
                this.style.display = 'none';
                const icon = profileIcon.querySelector('i') || document.createElement('i');
                icon.className = 'fas fa-user';
                icon.style.display = 'flex';
                if (!profileIcon.querySelector('i')) {
                    profileIcon.appendChild(icon);
                }
            };
        };
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        if (!profileIcon.querySelector('img')) {
            profileIcon.innerHTML = '';
            profileIcon.appendChild(img);
        }
        console.log('[main_app_logic] Avatar atualizado');
    }
    
    // Renderizar card de peso
    renderWeightCard(data);
    
    // Renderizar hidratação
    renderHydration(data);
    
    // Renderizar consumo
    renderConsumption(data);
    
    // Renderizar rotinas/missões
    renderRoutines(data);
    
    // Renderizar ranking
    renderRanking(data);
    
    // Renderizar sugestões de refeições
    renderMealSuggestions(data);
    
    // Renderizar desafios
    renderChallenges(data);
    
    // Mostrar botão de check-in se disponível
    if (data.available_checkin) {
        const checkinBtn = document.getElementById('checkin-floating-btn');
        const checkinModal = document.getElementById('checkinModal');
        
        if (checkinBtn) {
            checkinBtn.style.display = 'flex';
        }
        
        if (data.available_checkin) {
            window.checkinData = data.available_checkin;
            
            const checkinTitle = document.getElementById('checkin-title');
            if (checkinTitle && data.available_checkin.name) {
                checkinTitle.textContent = data.available_checkin.name;
            }
            
            if (checkinModal) {
                checkinModal.style.display = '';
            }
        }
    } else {
        const checkinBtn = document.getElementById('checkin-floating-btn');
        const checkinModal = document.getElementById('checkinModal');
        if (checkinBtn) checkinBtn.style.display = 'none';
        if (checkinModal) checkinModal.style.display = 'none';
    }
}

// Renderizar card de peso (igual ao código antigo)
function renderWeightCard(data) {
    const weightCard = document.getElementById('weight-card');
    if (!weightCard) return;
    
    const weightData = data.weight_banner || {};
    let currentWeight = weightData.current_weight || '--';
    if (typeof currentWeight === 'string' && currentWeight.endsWith('kg')) {
        currentWeight = currentWeight.replace('kg', '').trim();
    }
    const daysUntil = weightData.days_until_update || weightData.days_until_next_weight_update || 0;
    const showEdit = weightData.show_edit_button !== false;
    
    let html = '';
    
    if (showEdit) {
        html += `<span>Peso Atual</span>`;
        html += `<strong id="current-weight-value">${typeof currentWeight === 'number' ? currentWeight.toFixed(1).replace('.', ',') : currentWeight}kg</strong>`;
        html += `<button data-action="open-weight-modal" class="edit-button" aria-label="Editar peso">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </button>`;
    } else {
        html += `<span>Próxima atualização em</span>`;
        html += `<strong class="countdown">${daysUntil} ${daysUntil === 1 ? 'dia' : 'dias'}</strong>`;
    }
    
    weightCard.innerHTML = html;
    console.log('[main_app_logic] Weight card renderizado');
}

// Renderizar hidratação (igual ao código antigo)
function renderHydration(data) {
    const waterData = data.water || {};
    const waterConsumed = (waterData.consumed_cups || 0) * (waterData.cup_size_ml || 250);
    const waterGoal = waterData.goal_ml || 2000;
    
    // Atualizar display
    const waterAmountDisplay = document.getElementById('water-amount-display');
    const waterGoalDisplay = document.getElementById('water-goal-display');
    if (waterAmountDisplay) waterAmountDisplay.textContent = Math.round(waterConsumed);
    if (waterGoalDisplay) waterGoalDisplay.textContent = `${Math.round(waterGoal)} ml`;
    
    // Atualizar gota d'água
    const waterLevelGroup = document.getElementById('water-level-group');
    if (waterLevelGroup) {
        const percentage = waterGoal > 0 ? Math.min(waterConsumed / waterGoal, 1) : 0;
        const dropHeight = 275.785;
        const yTranslate = dropHeight * (1 - percentage);
        waterLevelGroup.setAttribute('transform', `translate(0, ${yTranslate})`);
    }
    
    // Atualizar variável global para os controles
    window.currentWater = waterConsumed;
    console.log('[main_app_logic] Hidratação renderizada:', { waterConsumed, waterGoal });
}

// Renderizar consumo (calorias e macros) - igual ao código antigo
function renderConsumption(data) {
    const summary = data.daily_summary || {};
    
    const kcal = summary.kcal?.consumed || 0;
    const protein = summary.protein?.consumed || 0;
    const carbs = summary.carbs?.consumed || 0;
    const fat = summary.fat?.consumed || 0;
    
    const kcalGoal = summary.kcal?.goal || 2000;
    const proteinGoal = summary.protein?.goal || 150;
    const carbsGoal = summary.carbs?.goal || 200;
    const fatGoal = summary.fat?.goal || 65;
    
    // Atualizar círculo de calorias
    updateCaloriesCircle(kcal, kcalGoal);
    
    // Atualizar barras de macros
    updateMacroBar('carbs', carbs, carbsGoal);
    updateMacroBar('protein', protein, proteinGoal);
    updateMacroBar('fat', fat, fatGoal);
    
    console.log('[main_app_logic] Consumo renderizado');
}

function updateCaloriesCircle(value, goal) {
    const circleElement = document.getElementById('kcal-circle');
    if (!circleElement) return;
    
    const percentage = goal > 0 ? Math.min(Math.max(value / goal, 0), 1) : 0;
    const circle = circleElement.querySelector('.circle');
    const valueDisplay = document.getElementById('kcal-value-display');
    
    if (circle) {
        const radius = 15.9155;
        const circumference = 2 * Math.PI * radius;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference - (percentage * circumference);
        circle.style.visibility = 'visible';
        circle.style.opacity = '1';
    }
    
    if (valueDisplay) {
        valueDisplay.textContent = Math.round(value);
    }
}

function updateMacroBar(type, value, goal) {
    const valueEl = document.getElementById(`${type}-value-display`);
    const goalEl = document.getElementById(`${type}-goal-display`);
    const progressBar = document.getElementById(`${type}-progress-bar`);
    
    if (valueEl) valueEl.textContent = Math.round(value);
    if (goalEl) goalEl.textContent = Math.round(goal);
    if (progressBar) {
        const percentage = goal > 0 ? Math.min(Math.max((value / goal) * 100, 0), 100) : 0;
        progressBar.style.width = `${percentage}%`;
    }
}

// Renderizar rotinas/missões (simplificado - script.js cuida dos detalhes)
function renderRoutines(data) {
    const missionsCard = document.getElementById('missions-card');
    if (!missionsCard) return;
    
    const routineData = data.routine || {};
    const routines = routineData.items || [];
    const completedCount = routineData.completed_missions || 0;
    const totalCount = routineData.total_missions || routines.length;
    
    // Atualizar progresso
    const progressText = document.getElementById('missions-progress-text');
    const progressBar = document.getElementById('missions-progress-bar');
    if (progressText) progressText.textContent = `${completedCount} de ${totalCount}`;
    if (progressBar) {
        const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        progressBar.style.width = `${percentage}%`;
    }
    
    // Atualizar variáveis globais
    if (typeof window !== 'undefined') {
        window.completedMissionsCount = completedCount;
        window.totalMissionsCount = totalCount;
    }
    
    if (routines.length === 0) {
        missionsCard.style.display = 'none';
        return;
    }
    
    missionsCard.style.display = 'block';
    console.log('[main_app_logic] Rotinas renderizadas');
}

// Renderizar ranking (igual ao código antigo)
function renderRanking(data) {
    if (!data.ranking) return;
    
    const rankingCard = document.getElementById('ranking-card');
    if (rankingCard) {
        rankingCard.style.display = 'block';
    }
    
    if (data.ranking.my_rank !== undefined) {
        const myRankEl = document.getElementById('my-rank');
        if (myRankEl) myRankEl.textContent = data.ranking.my_rank;
    }
    
    if (data.ranking.opponent) {
        const opponentNameEl = document.getElementById('opponent-name');
        if (opponentNameEl) opponentNameEl.textContent = data.ranking.opponent.name;
        
        const opponentInfoEl = document.getElementById('opponent-info');
        if (opponentInfoEl && data.ranking.opponent.profile_image_filename) {
            const avatar = opponentInfoEl.querySelector('.player-avatar');
            if (avatar) {
                const imgUrl = `${window.BASE_APP_URL}/assets/images/users/${data.ranking.opponent.profile_image_filename}`;
                avatar.innerHTML = `<img src="${imgUrl}" alt="${data.ranking.opponent.name}">`;
            }
        }
    }
    
    if (data.ranking.progress_percentage !== undefined) {
        const progressBar = document.getElementById('ranking-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${data.ranking.progress_percentage}%`;
        }
    }
    
    console.log('[main_app_logic] Ranking renderizado');
}

// Renderizar sugestões de refeições (placeholder)
function renderMealSuggestions(data) {
    // Implementar se necessário
    console.log('[main_app_logic] Meal suggestions renderizadas');
}

// Renderizar desafios (placeholder)
function renderChallenges(data) {
    // Implementar se necessário
    console.log('[main_app_logic] Challenges renderizados');
}

// Verificar se o script foi carregado
console.log('[main_app_logic] Script carregado!');

// Listener para evento SPA
window.addEventListener('spa:enter-main_app', async function(e) {
    console.log('[main_app_logic] Evento spa:enter-main_app disparado!', e.detail);
    
    setTimeout(async () => {
        const dashboardContainer = document.getElementById('dashboard-container');
        console.log('[main_app_logic] Dashboard container encontrado:', !!dashboardContainer);
        
        if (!dashboardContainer) {
            const spaContainer = document.getElementById('spa-container');
            if (spaContainer) {
                const containerInside = spaContainer.querySelector('#dashboard-container');
                if (containerInside) {
                    await loadMainAppData();
                } else {
                    console.error('[main_app_logic] dashboard-container não encontrado!');
                }
            }
            return;
        }
        
        await loadMainAppData();
    }, 200);
});

// Também escutar routeChanged como fallback
window.addEventListener('routeChanged', async function(e) {
    if (e.detail?.pageName === 'main_app') {
        console.log('[main_app_logic] routeChanged detectado para main_app!', e.detail);
        setTimeout(async () => {
            await loadMainAppData();
        }, 200);
    }
});
