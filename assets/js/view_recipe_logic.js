// view_recipe_logic.js - Lógica da página de visualização de receita
// Adaptado para eventos SPA

window.addEventListener('spa:enter-view_recipe', async function() {
    const authenticated = await requireAuth();
    if (!authenticated) {
        if (window.router) {
            window.router.navigate('/login');
        }
        return;
    }
    
    const BASE_URL = window.BASE_APP_URL;
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = parseInt(urlParams.get('id')) || 0;
    
    if (!recipeId) {
        alert('ID da receita inválido.');
        if (window.router) {
            window.router.navigate('/explore_recipes');
        } else {
            window.location.href = `${BASE_URL}/explore_recipes.html`;
        }
        return;
    }
    
    let recipeData = null;
    let isFavorited = false;
    
    // Carregar dados da receita
    async function loadRecipeData() {
        try {
            const response = await authenticatedFetch(`${BASE_URL}/api/get_recipe_data.php?id=${recipeId}`);
            
            if (!response) return;
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Erro ao carregar receita');
            }
            
            recipeData = result.data.recipe;
            isFavorited = result.data.is_favorited;
            
            // Atualizar título
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.textContent = recipeData.name + ' - ShapeFIT';
            
            // Renderizar receita
            renderRecipe(result.data);
            
            // Configurar favorito
            setupFavoriteButton();
            
            // Configurar formulário
            setupLogMealForm(result.data);
            
            // Mostrar conteúdo
            const loadingState = document.getElementById('loading-state');
            const recipeContainer = document.getElementById('recipe-container');
            if (loadingState) loadingState.style.display = 'none';
            if (recipeContainer) recipeContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Erro ao carregar receita:', error);
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
                loadingState.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; color: var(--accent-orange);"></i>
                    <p>Erro ao carregar receita. Redirecionando...</p>
                `;
            }
            setTimeout(() => {
                if (window.router) {
                    window.router.navigate('/explore_recipes');
                } else {
                    window.location.href = `${BASE_URL}/explore_recipes.html`;
                }
            }, 2000);
        }
    }
    
    function renderRecipe(data) {
        const recipe = data.recipe;
        const BASE_URL = window.BASE_APP_URL;
        
        // Imagem
        const recipeImage = document.getElementById('recipe-image');
        if (recipeImage) {
            const imageUrl = recipe.image_url 
                || (recipe.image_filename 
                    ? `${BASE_URL}/assets/images/recipes/${recipe.image_filename}`
                    : `${BASE_URL}/assets/images/recipes/placeholder_food.jpg`);
            recipeImage.src = imageUrl;
            recipeImage.onerror = function() {
                this.src = `${BASE_URL}/assets/images/recipes/placeholder_food.jpg`;
            };
            recipeImage.alt = recipe.name;
        }
        
        // Nome
        const recipeName = document.getElementById('recipe-name');
        if (recipeName) recipeName.textContent = recipe.name;
        
        // Descrição
        const recipeDescription = document.getElementById('recipe-description');
        if (recipeDescription) {
            if (recipe.description) {
                recipeDescription.textContent = recipe.description;
                recipeDescription.style.display = 'block';
            } else {
                recipeDescription.style.display = 'none';
            }
        }
        
        // Categorias
        const categoryTags = document.getElementById('category-tags');
        if (categoryTags) {
            if (data.categories && data.categories.length > 0) {
                const categoriesHtml = data.categories.map(cat => 
                    `<span class="category-tag">${escapeHtml(cat.name)}</span>`
                ).join('');
                categoryTags.innerHTML = categoriesHtml;
                categoryTags.style.display = 'flex';
            } else {
                categoryTags.style.display = 'none';
            }
        }
        
        // Macros
        const macroKcal = document.getElementById('macro-kcal');
        const macroCarbs = document.getElementById('macro-carbs');
        const macroFat = document.getElementById('macro-fat');
        const macroProtein = document.getElementById('macro-protein');
        
        if (macroKcal) macroKcal.textContent = Math.round(recipe.kcal_per_serving || 0);
        if (macroCarbs) macroCarbs.textContent = (recipe.carbs_g_per_serving || 0).toFixed(1).replace('.', ',') + 'g';
        if (macroFat) macroFat.textContent = (recipe.fat_g_per_serving || 0).toFixed(1).replace('.', ',') + 'g';
        if (macroProtein) macroProtein.textContent = (recipe.protein_g_per_serving || 0).toFixed(1).replace('.', ',') + 'g';
        
        // Info de porção
        const servingInfo = document.getElementById('serving-info');
        if (servingInfo) {
            let servingInfoText = 'Valores por porção';
            if (recipe.serving_size_g && recipe.serving_size_g > 0) {
                servingInfoText += ' de ' + Math.round(recipe.serving_size_g) + 'g';
            }
            servingInfo.textContent = servingInfoText;
        }
        
        // Tempo e porções
        const timingServings = document.getElementById('timing-servings');
        if (timingServings) {
            const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0);
            if (totalTime > 0 || recipe.servings) {
                let timingHtml = '';
                if (totalTime > 0) {
                    timingHtml += `<div class="timing-item"><i class="far fa-clock"></i> ${totalTime} min</div>`;
                }
                if (recipe.servings) {
                    let servingsText = "Rende " + recipe.servings;
                    servingsText += (parseInt(recipe.servings) === 1) ? ' porção' : ' porções';
                    if (recipe.serving_size_g && recipe.serving_size_g > 0) {
                        servingsText += ' de ' + Math.round(recipe.serving_size_g) + 'g';
                    }
                    timingHtml += `<div class="servings-item"><i class="fas fa-utensils"></i> ${servingsText}</div>`;
                }
                timingServings.innerHTML = timingHtml;
                timingServings.style.display = 'flex';
            } else {
                timingServings.style.display = 'none';
            }
        }
        
        // Ingredientes
        const ingredientsList = document.getElementById('ingredients-list');
        const ingredientsSection = document.getElementById('ingredients-section');
        if (ingredientsList && ingredientsSection) {
            if (data.ingredients && data.ingredients.length > 0) {
                const ingredientsHtml = data.ingredients.map(ing => 
                    `<li>- ${escapeHtml(ing)}</li>`
                ).join('');
                ingredientsList.innerHTML = ingredientsHtml;
                ingredientsSection.style.display = 'block';
            } else {
                ingredientsSection.style.display = 'none';
            }
        }
        
        // Instruções
        const instructionsContent = document.getElementById('instructions-content');
        const instructionsSection = document.getElementById('instructions-section');
        if (instructionsContent && instructionsSection) {
            if (recipe.instructions) {
                const steps = recipe.instructions.split('\n').filter(s => s.trim());
                let stepNumber = 1;
                const instructionsHtml = steps.map(step => {
                    const cleaned = step.trim().replace(/^\d+[\.\)]\s*/, '');
                    return `<div class="instruction-step"><span class="step-number">${stepNumber++}</span><p>${escapeHtml(cleaned).replace(/\n/g, '<br>')}</p></div>`;
                }).join('');
                instructionsContent.innerHTML = instructionsHtml;
                instructionsSection.style.display = 'block';
            } else {
                instructionsSection.style.display = 'none';
            }
        }
        
        // Notas
        const notesContent = document.getElementById('notes-content');
        const notesSection = document.getElementById('notes-section');
        if (notesContent && notesSection) {
            if (recipe.notes) {
                notesContent.innerHTML = escapeHtml(recipe.notes).replace(/\n/g, '<br>');
                notesSection.style.display = 'block';
            } else {
                notesSection.style.display = 'none';
            }
        }
    }
    
    function setupFavoriteButton() {
        const favoriteBtn = document.getElementById('favorite-btn');
        if (!favoriteBtn) return;
        
        const favoriteIcon = favoriteBtn.querySelector('i');
        
        if (isFavorited) {
            favoriteBtn.classList.add('is-favorited');
            if (favoriteIcon) favoriteIcon.className = 'fas fa-heart';
            favoriteBtn.setAttribute('aria-label', 'Desfavoritar receita');
        } else {
            favoriteBtn.classList.remove('is-favorited');
            if (favoriteIcon) favoriteIcon.className = 'far fa-heart';
            favoriteBtn.setAttribute('aria-label', 'Favoritar receita');
        }
        
        favoriteBtn.onclick = async function(e) {
            e.preventDefault();
            
            try {
                const response = await authenticatedFetch(`${BASE_URL}/api/toggle_favorite.php`, {
                    method: 'POST',
                    body: JSON.stringify({ recipe_id: recipeId })
                });
                
                if (!response) return;
                
                const result = await response.json();
                
                if (result.success) {
                    isFavorited = result.is_favorited;
                    if (isFavorited) {
                        favoriteBtn.classList.add('is-favorited');
                        if (favoriteIcon) favoriteIcon.className = 'fas fa-heart';
                        favoriteBtn.setAttribute('aria-label', 'Desfavoritar receita');
                    } else {
                        favoriteBtn.classList.remove('is-favorited');
                        if (favoriteIcon) favoriteIcon.className = 'far fa-heart';
                        favoriteBtn.setAttribute('aria-label', 'Favoritar receita');
                    }
                }
            } catch (error) {
                console.error('Erro ao favoritar:', error);
            }
        };
    }
    
    function setupLogMealForm(data) {
        const recipeIdInput = document.getElementById('recipe_id');
        if (recipeIdInput) recipeIdInput.value = recipeId;
        
        // Preencher meal type
        const mealTypeSelect = document.getElementById('meal_type');
        if (mealTypeSelect) {
            mealTypeSelect.innerHTML = '';
            for (const [slug, name] of Object.entries(data.meal_type_options)) {
                const option = document.createElement('option');
                option.value = slug;
                option.textContent = name;
                if (slug === data.default_meal_type) {
                    option.selected = true;
                }
                mealTypeSelect.appendChild(option);
            }
        }
        
        // Preencher data
        const dateSelect = document.getElementById('date_consumed');
        if (dateSelect) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            dateSelect.innerHTML = `
                <option value="${typeof getLocalDateString === 'function' ? getLocalDateString() : today.toISOString().split('T')[0]}">Hoje, ${today.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</option>
                <option value="${typeof addDaysLocal === 'function' ? addDaysLocal(getLocalDateString(), -1) : yesterday.toISOString().split('T')[0]}">Ontem, ${yesterday.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}</option>
            `;
        }
        
        // Submit do formulário
        const logMealForm = document.getElementById('log-meal-form');
        if (logMealForm) {
            logMealForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = {
                    recipe_id: recipeId,
                    meal_type: document.getElementById('meal_type')?.value || '',
                    date_consumed: document.getElementById('date_consumed')?.value || '',
                    servings_consumed: parseFloat(document.getElementById('servings_consumed')?.value || '1')
                };
                
                try {
                    const response = await authenticatedFetch(`${BASE_URL}/api/log_meal.php`, {
                        method: 'POST',
                        body: JSON.stringify(formData)
                    });
                    
                    if (!response) return;
                    
                    let resultText = '';
                    let result = {};
                    try {
                        resultText = await response.text();
                        result = resultText ? JSON.parse(resultText) : {};
                    } catch (parseError) {
                        console.error('Resposta não é um JSON válido:', resultText);
                        throw new Error(resultText || 'Resposta inválida do servidor');
                    }
                    
                    if (result.success) {
                        alert(result.message || 'Refeição registrada com sucesso!');
                        if (window.router) {
                            window.router.navigate(result.redirect || '/diary');
                        } else {
                            window.location.href = result.redirect || `${BASE_URL}/diary.html`;
                        }
                    } else {
                        alert(result.message || 'Erro ao registrar refeição.');
                    }
                } catch (error) {
                    console.error('Erro ao registrar refeição:', error);
                    alert('Erro ao registrar refeição. Tente novamente.');
                }
            });
        }
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Carregar dados
    loadRecipeData();
});

