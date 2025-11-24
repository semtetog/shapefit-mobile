// diary_page_logic.js - Lógica específica da página Diary
// Usa eventos SPA para inicializar quando a view é carregada

let diaryCleanup = null;

// Evento quando a view Diary entra
window.addEventListener('spa:enter-diary', async function() {
    await initDiary();
});

// Evento quando a view Diary sai
window.addEventListener('spa:leave-diary', function() {
    if (diaryCleanup) {
        diaryCleanup();
        diaryCleanup = null;
    }
});

async function initDiary() {
    // Verificar autenticação antes de carregar dados
    const authenticated = await requireAuth();
    if (!authenticated) {
        return; // Já redirecionou para login
    }
    
    // Carregar dados do diário
    const BASE_URL = window.BASE_APP_URL;
    const urlParams = new URLSearchParams(window.location.search);
    
    // Função para obter data local no formato YYYY-MM-DD (não UTC)
    function getLocalDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    let currentDate = urlParams.get('date') || getLocalDateString();

    async function loadDiaryData(date) {
        try {
            const token = getAuthToken();
            const response = await authenticatedFetch(`${BASE_URL}/api/get_diary_data.php?date=${date}`);
            
            if (!response) return; // Token inválido, já redirecionou
            
            if (!response.ok) {
                const text = await response.text();
                console.error('Erro HTTP:', response.status, text);
                throw new Error(`Erro ao carregar dados: ${response.status}`);
            }
            
            const text = await response.text();
            if (!text || text.trim() === '') {
                throw new Error('Resposta vazia do servidor');
            }
            
            let result;
            try {
                result = JSON.parse(text);
            } catch (parseError) {
                console.error('Erro ao parsear JSON:', parseError);
                console.error('Texto recebido:', text);
                throw new Error('Resposta inválida do servidor');
            }
    
            if (!result.success) {
                throw new Error(result.message || 'Erro ao carregar dados');
            }
    
            const data = result.data;
            currentDate = data.date;
    
            // Atualizar data display
            const dateDisplayEl = document.getElementById('current-diary-date');
            if (dateDisplayEl) {
                dateDisplayEl.textContent = data.date_display;
            }
    
            // Atualizar navegação de data
            const prevLink = document.getElementById('prev-date');
            const nextLink = document.getElementById('next-date');
            
            // Limpar event listeners anteriores
            if (prevLink) {
                const newPrevLink = prevLink.cloneNode(true);
                prevLink.parentNode.replaceChild(newPrevLink, prevLink);
            }
            if (nextLink) {
                const newNextLink = nextLink.cloneNode(true);
                nextLink.parentNode.replaceChild(newNextLink, nextLink);
            }
            
            const updatedPrevLink = document.getElementById('prev-date');
            const updatedNextLink = document.getElementById('next-date');
            
            // Função para adicionar/subtrair dias (local)
            function addDaysLocal(dateStr, days) {
                const d = new Date(dateStr + 'T00:00:00');
                d.setDate(d.getDate() + days);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
    
            const prevDate = addDaysLocal(date, -1);
            const nextDate = addDaysLocal(date, 1);
    
            if (updatedPrevLink) {
                updatedPrevLink.href = `?date=${prevDate}`;
                updatedPrevLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.router) {
                        window.router.navigate(`/diary?date=${prevDate}`);
                    } else {
                        window.location.href = `?date=${prevDate}`;
                    }
                });
            }
            
            if (updatedNextLink) {
                updatedNextLink.href = `?date=${nextDate}`;
                updatedNextLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.router) {
                        window.router.navigate(`/diary?date=${nextDate}`);
                    } else {
                        window.location.href = `?date=${nextDate}`;
                    }
                });
            }
    
            const todayLocal = getLocalDateString();
            // Desabilitar "next" apenas se a data for maior ou igual a hoje
            if (date >= todayLocal) {
                if (updatedNextLink) updatedNextLink.classList.add('disabled');
            } else {
                if (updatedNextLink) updatedNextLink.classList.remove('disabled');
            }
    
            // O botão "prev" sempre deve estar habilitado
            if (updatedPrevLink) updatedPrevLink.classList.remove('disabled');
    
            // Atualizar resumo nutricional
            const kcalConsumedEl = document.getElementById('kcal-consumed');
            const kcalGoalEl = document.getElementById('kcal-goal');
            const proteinConsumedEl = document.getElementById('protein-consumed');
            const proteinGoalEl = document.getElementById('protein-goal');
            const carbsConsumedEl = document.getElementById('carbs-consumed');
            const carbsGoalEl = document.getElementById('carbs-goal');
            const fatConsumedEl = document.getElementById('fat-consumed');
            const fatGoalEl = document.getElementById('fat-goal');
            
            if (kcalConsumedEl) kcalConsumedEl.textContent = data.nutrition.kcal.consumed;
            if (kcalGoalEl) kcalGoalEl.textContent = data.nutrition.kcal.goal;
            if (proteinConsumedEl) proteinConsumedEl.textContent = data.nutrition.protein.consumed + 'g';
            if (proteinGoalEl) proteinGoalEl.textContent = data.nutrition.protein.goal;
            if (carbsConsumedEl) carbsConsumedEl.textContent = data.nutrition.carbs.consumed + 'g';
            if (carbsGoalEl) carbsGoalEl.textContent = data.nutrition.carbs.goal;
            if (fatConsumedEl) fatConsumedEl.textContent = data.nutrition.fat.consumed + 'g';
            if (fatGoalEl) fatGoalEl.textContent = data.nutrition.fat.goal;
    
            // Renderizar refeições
            const mealGroups = data.meal_groups || {};
            const mealTypes = data.meal_types || {};
            renderMeals(mealGroups, mealTypes);
    
            // Atualizar botão de adicionar
            const addMealBtn = document.getElementById('add-meal-btn');
            if (addMealBtn) {
                // Remover listener anterior
                const newBtn = addMealBtn.cloneNode(true);
                addMealBtn.parentNode.replaceChild(newBtn, addMealBtn);
                
                const updatedBtn = document.getElementById('add-meal-btn');
                if (updatedBtn) {
                    updatedBtn.onclick = () => {
                        if (window.router) {
                            window.router.navigate(`/add_food_to_diary?date=${currentDate}`);
                        } else {
                            window.location.href = `${BASE_URL}/add_food_to_diary.html?date=${currentDate}`;
                        }
                    };
                }
            }
    
        } catch (error) {
            console.error('Erro ao carregar dados do diário:', error);
            const mealsList = document.getElementById('meals-list');
            if (mealsList) {
                mealsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Erro ao carregar dados</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    }

    function renderMeals(mealGroups, mealTypes) {
        const mealsList = document.getElementById('meals-list');
        if (!mealsList) return;
        
        // Verificar se mealGroups é array (formato da API) ou objeto (formato esperado)
        let processedGroups = {};
        
        if (Array.isArray(mealGroups)) {
            // Converter array para objeto
            mealGroups.forEach(group => {
                if (group && group.type && Array.isArray(group.meals)) {
                    processedGroups[group.type] = group.meals;
                }
            });
        } else if (mealGroups && typeof mealGroups === 'object') {
            // Já é objeto, usar diretamente
            processedGroups = mealGroups;
        }
        
        if (Object.keys(processedGroups).length === 0) {
            mealsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h3>Nenhuma refeição registrada</h3>
                    <p>Adicione sua primeira refeição do dia</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        for (const [mealType, meals] of Object.entries(processedGroups)) {
            // Garantir que meals seja um array
            if (!Array.isArray(meals)) {
                console.warn(`mealGroups[${mealType}] não é um array:`, meals);
                continue;
            }
            
            const typeName = mealTypes[mealType] || mealType;
            const mealGroupKcal = meals.reduce((sum, meal) => sum + parseFloat(meal.kcal_consumed || 0), 0);
            
            html += `
                <div class="meal-group">
                    <div class="meal-group-header">
                        <h3 class="meal-group-title">${escapeHtml(typeName)}</h3>
                        <div class="meal-group-total">${Math.round(mealGroupKcal)} kcal</div>
                    </div>
                    <div class="meal-items">
            `;
            
            meals.forEach(meal => {
                const mealName = meal.recipe_name || meal.custom_meal_name || 'Refeição';
                const mealId = meal.id || '';
                html += `
                        <div class="meal-item">
                            <div class="meal-item-info">
                                <div class="meal-item-name">${escapeHtml(mealName)}</div>
                                <div class="meal-item-details">
                                    P: ${Math.round(meal.protein_consumed_g || 0)}g | 
                                    C: ${Math.round(meal.carbs_consumed_g || 0)}g | 
                                    G: ${Math.round(meal.fat_consumed_g || 0)}g
                                </div>
                            </div>
                            <div class="meal-item-actions">
                                <div class="meal-item-kcal">${Math.round(meal.kcal_consumed || 0)} kcal</div>
                                <a href="/edit_meal?id=${mealId}" class="meal-edit-btn" title="Editar refeição">
                                    <i class="fas fa-edit"></i>
                                </a>
                            </div>
                        </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        mealsList.innerHTML = html;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Carregar dados ao iniciar
    await loadDiaryData(currentDate);
    
    // Setup cleanup function
    diaryCleanup = function() {
        // Limpar event listeners se necessário
        const prevLink = document.getElementById('prev-date');
        const nextLink = document.getElementById('next-date');
        const addMealBtn = document.getElementById('add-meal-btn');
        
        if (prevLink) {
            const newPrev = prevLink.cloneNode(true);
            prevLink.parentNode.replaceChild(newPrev, prevLink);
        }
        if (nextLink) {
            const newNext = nextLink.cloneNode(true);
            nextLink.parentNode.replaceChild(newNext, nextLink);
        }
        if (addMealBtn) {
            const newBtn = addMealBtn.cloneNode(true);
            addMealBtn.parentNode.replaceChild(newBtn, addMealBtn);
        }
    };
}
