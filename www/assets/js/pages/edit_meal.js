// Scripts inline extraídos de edit_meal.html
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
        if (!window.BASE_APP_URL) { window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/'); } if (window.BASE_APP_URL && window.BASE_APP_URL.endsWith('/')) {
            window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
        }

// Script inline 4


// Script inline 5


// Script inline 6


// Script inline 7
// Verificar autenticação
(async function() {
    const authenticated = await requireAuth();
    if (!authenticated) {
        return; // Já redirecionou para login
    }
    
    // Carregar dados da refeição
    const BASE_URL = window.BASE_APP_URL;
    const urlParams = new URLSearchParams(window.location.search);
    const mealId = parseInt(urlParams.get('id')) || 0;
    
    if (!mealId) {
        alert('ID da refeição inválido.');
        window.location.href = './diary.html';
        return;
    }
    
    let mealData = null;
    let nutritionPerServing = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    
    // Função para atualizar valores nutricionais
    function updateNutrition() {
        const servings = parseFloat(document.getElementById('servings').value) || 1;
        
        const totalKcal = Math.round(nutritionPerServing.kcal * servings);
        const totalProtein = Math.round(nutritionPerServing.protein * servings * 10) / 10;
        const totalCarbs = Math.round(nutritionPerServing.carbs * servings * 10) / 10;
        const totalFat = Math.round(nutritionPerServing.fat * servings * 10) / 10;
        
        document.getElementById('total-kcal').innerHTML = totalKcal + ' <span class="nutrition-item-unit">kcal</span>';
        document.getElementById('total-protein').innerHTML = totalProtein + ' <span class="nutrition-item-unit">g</span>';
        document.getElementById('total-carbs').innerHTML = totalCarbs + ' <span class="nutrition-item-unit">g</span>';
        document.getElementById('total-fat').innerHTML = totalFat + ' <span class="nutrition-item-unit">g</span>';
    }
    
    // Função para excluir refeição
    async function deleteMeal() {
        if (!confirm('Tem certeza que deseja excluir esta refeição? Esta ação não pode ser desfeita.')) {
            return;
        }
        
        try {
            const token = getAuthToken();
            const response = await authenticatedFetch(`${BASE_URL}/api/delete_meal.php`, {
                method: 'POST',
                body: JSON.stringify({ meal_id: mealId })
            });
            
            if (!response) return; // Token inválido, já redirecionou
            
            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                // Sempre usar caminho relativo para manter dentro do app
                window.location.href = './diary.html';
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
            
            if (!response) return; // Token inválido, já redirecionou
            
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
            document.getElementById('meal_id').value = mealData.id;
            document.getElementById('meal_name').value = mealData.custom_meal_name || mealData.recipe_name || '';
            document.getElementById('date_consumed').value = mealData.date_consumed;
            document.getElementById('time_consumed').value = new Date(mealData.logged_at).toTimeString().slice(0, 5);
            document.getElementById('servings').value = mealData.servings_consumed || 1;
            
            // Preencher select de meal type
            const mealTypeSelect = document.getElementById('meal_type');
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
            
            // Atualizar valores nutricionais
            updateNutrition();
            
            // Atualizar botão de voltar e cancelar
            const backUrl = `./diary.html?date=${mealData.date_consumed}`;
            document.getElementById('back-button').href = backUrl;
            document.getElementById('cancel-btn').onclick = () => {
                window.location.href = backUrl;
            };
            
            // Mostrar formulário
            document.getElementById('edit-form').style.display = 'block';
            
        } catch (error) {
            console.error('Erro ao carregar dados da refeição:', error);
            alert('Erro ao carregar dados da refeição. Redirecionando...');
            window.location.href = './diary.html';
        }
    }
    
    // Carregar dados ao iniciar
    loadMealData();

// Event listeners
document.getElementById('servings').addEventListener('input', updateNutrition);

    // Validação e envio do formulário
    document.getElementById('edit-meal-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const mealName = document.getElementById('meal_name').value.trim();
        const servings = parseFloat(document.getElementById('servings').value);
        
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
                meal_id: document.getElementById('meal_id').value,
                meal_name: mealName,
                meal_type: document.getElementById('meal_type').value,
                date_consumed: document.getElementById('date_consumed').value,
                time_consumed: document.getElementById('time_consumed').value,
                servings: servings
            };
            
            const response = await authenticatedFetch(`${BASE_URL}/api/edit_meal.php`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            
            if (!response) return; // Token inválido, já redirecionou
            
            const result = await response.json();
            
            if (result.success) {
                alert(result.message);
                // Sempre usar caminho relativo para manter dentro do app
                window.location.href = './diary.html';
            } else {
                alert(result.message || 'Erro ao atualizar refeição.');
            }
        } catch (error) {
            console.error('Erro ao atualizar refeição:', error);
            alert('Erro ao atualizar refeição. Tente novamente.');
        }
    });
    
    // Event listeners
    document.getElementById('servings').addEventListener('input', updateNutrition);
})();

