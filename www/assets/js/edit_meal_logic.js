// edit_meal_logic.js - Lógica da página de editar refeição
// Adaptado para eventos SPA

window.addEventListener('spa:enter-edit_meal', async function() {
    const authenticated = await requireAuth();
    if (!authenticated) {
        if (window.router) {
            window.router.navigate('/login');
        }
        return;
    }
    
    // Carregar dados da refeição
    const BASE_URL = window.BASE_APP_URL;
    const urlParams = new URLSearchParams(window.location.search);
    const mealId = parseInt(urlParams.get('id')) || 0;
    
    if (!mealId) {
        alert('ID da refeição inválido.');
        if (window.router) {
            window.router.navigate('/diary');
        } else {
            window.location.href = `${BASE_URL}/diary.html`;
        }
        return;
    }
    
    let mealData = null;
    let nutritionPerServing = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    
    // Função para atualizar valores nutricionais
    function updateNutrition() {
        const servingsInput = document.getElementById('servings');
        if (!servingsInput) return;
        
        const servings = parseFloat(servingsInput.value) || 1;
        
        const totalKcal = Math.round(nutritionPerServing.kcal * servings);
        const totalProtein = Math.round(nutritionPerServing.protein * servings * 10) / 10;
        const totalCarbs = Math.round(nutritionPerServing.carbs * servings * 10) / 10;
        const totalFat = Math.round(nutritionPerServing.fat * servings * 10) / 10;
        
        const totalKcalEl = document.getElementById('total-kcal');
        const totalProteinEl = document.getElementById('total-protein');
        const totalCarbsEl = document.getElementById('total-carbs');
        const totalFatEl = document.getElementById('total-fat');
        
        if (totalKcalEl) totalKcalEl.innerHTML = totalKcal + ' <span class="nutrition-item-unit">kcal</span>';
        if (totalProteinEl) totalProteinEl.innerHTML = totalProtein + ' <span class="nutrition-item-unit">g</span>';
        if (totalCarbsEl) totalCarbsEl.innerHTML = totalCarbs + ' <span class="nutrition-item-unit">g</span>';
        if (totalFatEl) totalFatEl.innerHTML = totalFat + ' <span class="nutrition-item-unit">g</span>';
    }
    
    // Função para excluir refeição
    async function deleteMeal() {
        if (!confirm('Tem certeza que deseja excluir esta refeição? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            const response = await authenticatedFetch(`${BASE_URL}/api/delete_meal.php`, {
                method: 'POST',
                body: JSON.stringify({ meal_id: mealId })
            });
            
            if (!response) return;
            
            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                if (window.router) {
                    window.router.navigate(result.redirect || '/diary');
                } else {
                    window.location.href = result.redirect || `${BASE_URL}/diary.html`;
                }
            } else {
                alert(result.message || 'Erro ao excluir refeição.');
            }
        } catch (error) {
            console.error('Erro ao excluir refeição:', error);
            alert('Erro ao excluir refeição. Tente novamente.');
        }
    }
    
    window.deleteMeal = deleteMeal;
    
    async function loadMealData() {
        try {
            const response = await authenticatedFetch(`${BASE_URL}/api/get_edit_meal_data.php?id=${mealId}`);
            
            if (!response) return;
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Erro ao carregar dados da refeição');
            }
            
            mealData = result.data.meal;
            const mealTypeOptions = result.data.meal_type_options;
            
            // Calcular nutrição por porção
            const servings = parseFloat(mealData.servings_consumed) || 1;
            nutritionPerServing = {
                kcal: (mealData.kcal_consumed || 0) / servings,
                protein: (mealData.protein_consumed_g || 0) / servings,
                carbs: (mealData.carbs_consumed_g || 0) / servings,
                fat: (mealData.fat_consumed_g || 0) / servings
            };
            
            // Preencher formulário
            const mealIdInput = document.getElementById('meal_id');
            const mealNameInput = document.getElementById('meal_name');
            const dateConsumedInput = document.getElementById('date_consumed');
            const timeConsumedInput = document.getElementById('time_consumed');
            const servingsInput = document.getElementById('servings');
            
            if (mealIdInput) mealIdInput.value = mealData.id;
            if (mealNameInput) mealNameInput.value = mealData.custom_meal_name || mealData.recipe_name || '';
            if (dateConsumedInput) dateConsumedInput.value = mealData.date_consumed;
            if (timeConsumedInput) timeConsumedInput.value = new Date(mealData.logged_at).toTimeString().slice(0, 5);
            if (servingsInput) servingsInput.value = mealData.servings_consumed || 1;
            
            // Preencher select de meal type
            const mealTypeSelect = document.getElementById('meal_type');
            if (mealTypeSelect) {
                mealTypeSelect.innerHTML = '';
                for (const [slug, name] of Object.entries(mealTypeOptions)) {
                    const option = document.createElement('option');
                    option.value = slug;
                    option.textContent = name;
                    if (slug === mealData.meal_type) {
                        option.selected = true;
                    }
                    mealTypeSelect.appendChild(option);
                }
            }
            
            // Atualizar valores nutricionais
            updateNutrition();
            
            // Atualizar botão de voltar e cancelar
            const backUrl = `${BASE_URL}/diary.html?date=${mealData.date_consumed}`;
            const backButton = document.getElementById('back-button');
            const cancelBtn = document.getElementById('cancel-btn');
            
            if (backButton) backButton.href = backUrl;
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    if (window.router) {
                        window.router.navigate(`/diary?date=${mealData.date_consumed}`);
                    } else {
                        window.location.href = backUrl;
                    }
                };
            }
            
            // Mostrar formulário
            const editForm = document.getElementById('edit-form');
            if (editForm) editForm.style.display = 'block';
            
        } catch (error) {
            console.error('Erro ao carregar dados da refeição:', error);
            alert('Erro ao carregar dados da refeição. Redirecionando...');
            if (window.router) {
                window.router.navigate('/diary');
            } else {
                window.location.href = `${BASE_URL}/diary.html`;
            }
        }
    }
    
    // Event listeners
    const servingsInput = document.getElementById('servings');
    if (servingsInput) {
        servingsInput.addEventListener('input', updateNutrition);
    }
    
    // Validação e envio do formulário
    const editMealForm = document.getElementById('edit-meal-form');
    if (editMealForm) {
        editMealForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const mealName = document.getElementById('meal_name')?.value.trim() || '';
            const servings = parseFloat(document.getElementById('servings')?.value || '0');
            
            if (!mealName) {
                alert('Por favor, insira o nome da refeição.');
                return;
            }
            
            if (!servings || servings <= 0) {
                alert('Por favor, insira uma quantidade válida.');
                return;
            }
            
            try {
                const formData = {
                    meal_id: document.getElementById('meal_id')?.value || '',
                    meal_name: mealName,
                    meal_type: document.getElementById('meal_type')?.value || '',
                    date_consumed: document.getElementById('date_consumed')?.value || '',
                    time_consumed: document.getElementById('time_consumed')?.value || '',
                    servings: servings
                };
                
                const response = await authenticatedFetch(`${BASE_URL}/api/edit_meal.php`, {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                
                if (!response) return;
                
                const result = await response.json();
                
                if (result.success) {
                    alert(result.message);
                    if (window.router) {
                        window.router.navigate(result.redirect || '/diary');
                    } else {
                        window.location.href = result.redirect || `${BASE_URL}/diary.html`;
                    }
                } else {
                    alert(result.message || 'Erro ao atualizar refeição.');
                }
            } catch (error) {
                console.error('Erro ao atualizar refeição:', error);
                alert('Erro ao atualizar refeição. Tente novamente.');
            }
        });
    }
    
    // Carregar dados ao iniciar
    loadMealData();
});

