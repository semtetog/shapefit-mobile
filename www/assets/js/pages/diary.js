// Scripts inline extraídos de diary.html
// Gerado automaticamente - não editar manualmente

// Script inline 1


// Script inline 2
function setRealViewportHeight() { 
            const vh = window.innerHeight * 0.01; 
            document.documentElement.style.setProperty('--vh', `${vh}px`); 
        }
        setRealViewportHeight();
        window.addEventListener('resize', setRealViewportHeight);
        window.addEventListener('orientationchange', function() {
            setTimeout(setRealViewportHeight, 100);
        });
        
        document.addEventListener('touchmove', function(event) {
            const scrollable = event.target.closest('.app-container, .container');
            if (!scrollable) {
                event.preventDefault();
            }
        }, { passive: false });

// Script inline 3
// BASE_APP_URL já foi definido pelo www-config.js
        if (!window.BASE_APP_URL) {
            window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
            if (window.BASE_APP_URL.endsWith('/')) {
                window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
            }
        }

// Script inline 4


// Script inline 5


// Script inline 6


// Script inline 7
// Verificar autenticação antes de carregar dados
        (async function() {
            const authenticated = await requireAuth();
            if (!authenticated) {
                return; // Já redirecionou para login
            }
            
// Carregar dados do diário
            const BASE_URL = window.BASE_APP_URL;
            const urlParams = new URLSearchParams(window.location.search);
            // Função para obter data local no formato YYYY-MM-DD (não UTC)
            // Usar métodos que retornam valores no timezone local
            function getLocalDateString() {
                const now = new Date();
                // Usar métodos que retornam valores no timezone local do dispositivo
                const year = now.getFullYear();
                const month = now.getMonth() + 1; // getMonth() retorna 0-11, então +1
                const day = now.getDate();
                
                // Usar toLocaleString para garantir timezone local
                const localDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                // Verificação adicional: usar toLocaleDateString para confirmar
                const localDateParts = now.toLocaleDateString('pt-BR', {
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).split('/');
                const verifiedDateStr = `${localDateParts[2]}-${localDateParts[1]}-${localDateParts[0]}`;
                
                console.log('[Diary] Data local obtida (getDate):', localDateStr);
                console.log('[Diary] Data local obtida (toLocaleDateString):', verifiedDateStr);
                console.log('[Diary] Hora atual:', now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
                console.log('[Diary] Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
                
                // Retornar a data verificada (mais confiável)
                return verifiedDateStr;
            }
            
            let currentDate = urlParams.get('date') || getLocalDateString();
            console.log('[Diary] Data inicial:', currentDate);

async function loadDiaryData(date) {
    try {
                    // IMPORTANTE: A data aqui é apenas para exibição/navegação do usuário
                    // O servidor deve validar usando sua própria data/hora para operações críticas
                    // (ex: não permitir registrar refeições no futuro)
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
        // Sempre usar a data que foi solicitada (já está em formato local)
        // Não usar data.date do servidor pois pode estar em UTC
        const requestedDate = date; // Data que foi solicitada (já está em formato local)
        currentDate = requestedDate; // Sempre usar a data que foi solicitada
        
        console.log('[Diary] Data solicitada:', requestedDate, 'Data do servidor:', data.date);
        
        // Atualizar data display - usar a data solicitada formatada localmente
        // Parsear a data solicitada (YYYY-MM-DD) e formatar como DD/MM/YYYY
        const [year, month, day] = requestedDate.split('-');
        const dateDisplay = `${day}/${month}/${year}`;
        document.getElementById('current-diary-date').textContent = dateDisplay;
        console.log('[Diary] Data exibida:', dateDisplay);
        
        // Atualizar navegação de data
        const prevLink = document.getElementById('prev-date');
        const nextLink = document.getElementById('next-date');
        // Função para formatar data como YYYY-MM-DD (local, não UTC)
        function formatDateLocal(dateStr) {
            const d = new Date(dateStr + 'T00:00:00'); // Forçar hora local
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        // Função para adicionar/subtrair dias (local)
        // Usar manipulação de string para evitar problemas de timezone
        function addDaysLocal(dateStr, days) {
            const [year, month, day] = dateStr.split('-').map(Number);
            const d = new Date(year, month - 1, day); // month é 0-indexed
            d.setDate(d.getDate() + days);
            // Usar métodos locais
            const newYear = d.getFullYear();
            const newMonth = String(d.getMonth() + 1).padStart(2, '0');
            const newDay = String(d.getDate()).padStart(2, '0');
            return `${newYear}-${newMonth}-${newDay}`;
        }
        
        const prevDate = addDaysLocal(date, -1);
        const nextDate = addDaysLocal(date, 1);
        
        prevLink.href = `?date=${prevDate}`;
        nextLink.href = `?date=${nextDate}`;
        
        const todayLocal = getLocalDateString();
        // Desabilitar "next" apenas se a data for maior ou igual a hoje (não pode ir para o futuro)
        // Se estiver em uma data anterior, deve poder voltar (next habilitado)
        if (date >= todayLocal) {
            nextLink.classList.add('disabled');
        } else {
            nextLink.classList.remove('disabled');
        }
        
        // O botão "prev" sempre deve estar habilitado (pode ir para datas anteriores)
        prevLink.classList.remove('disabled');
        
        // Atualizar resumo nutricional
        document.getElementById('kcal-consumed').textContent = data.nutrition.kcal.consumed;
        document.getElementById('kcal-goal').textContent = data.nutrition.kcal.goal;
        document.getElementById('protein-consumed').textContent = data.nutrition.protein.consumed + 'g';
        document.getElementById('protein-goal').textContent = data.nutrition.protein.goal;
        document.getElementById('carbs-consumed').textContent = data.nutrition.carbs.consumed + 'g';
        document.getElementById('carbs-goal').textContent = data.nutrition.carbs.goal;
        document.getElementById('fat-consumed').textContent = data.nutrition.fat.consumed + 'g';
        document.getElementById('fat-goal').textContent = data.nutrition.fat.goal;
        
        // Renderizar refeições (garantir que meal_groups seja um objeto)
        const mealGroups = data.meal_groups || {};
        const mealTypes = data.meal_types || {};
        renderMeals(mealGroups, mealTypes);
        
        // Atualizar botão de adicionar
        document.getElementById('add-meal-btn').onclick = () => {
                        window.location.href = `./add_food_to_diary.html?date=${currentDate}`;
        };
        
    } catch (error) {
        console.error('Erro ao carregar dados do diário:', error);
        document.getElementById('meals-list').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erro ao carregar dados</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function renderMeals(mealGroups, mealTypes) {
    const mealsList = document.getElementById('meals-list');
    
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
                                        <a href="./edit_meal.html?id=${meal.id}" class="meal-edit-btn" title="Editar refeição">
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
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Carregar dados ao iniciar
loadDiaryData(currentDate);
        })();

