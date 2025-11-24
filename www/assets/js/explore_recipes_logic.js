// explore_recipes_logic.js - Lógica da página de explorar receitas
// Adaptado para eventos SPA

window.addEventListener('spa:enter-explore_recipes', async function() {
    const authenticated = await requireAuth();
    if (!authenticated) {
        if (window.router) {
            window.router.navigate('/login');
        }
        return;
    }
    
    const BASE_URL = window.BASE_APP_URL;
    let pageData = null;
    let allCategories = [];
    
    async function loadPageData() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q') || '';
            const sort = urlParams.get('sort') || '';
            const categories = urlParams.get('categories') || '';
            
            const apiUrl = `${BASE_URL}/api/get_explore_recipes_data.php?q=${encodeURIComponent(query)}&sort=${encodeURIComponent(sort)}&categories=${encodeURIComponent(categories)}`;
            const response = await authenticatedFetch(apiUrl);
            if (!response) return;
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Erro ao carregar dados');
            }
            
            pageData = result.data;
            allCategories = result.data.all_categories || [];
            
            // Preencher input de busca
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = query;
            
            // Renderizar categorias no modal
            renderCategories();
            
            // Renderizar conteúdo principal
            if (pageData.is_filtered_view) {
                renderFilteredView();
            } else {
                renderCarouselView();
            }
            
            // Restaurar estado dos filtros
            restoreFiltersState();
            
            // Configurar modal
            setupFilterModal();
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
                loadingState.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; color: var(--accent-orange);"></i>
                    <p>Erro ao carregar receitas. Tente novamente.</p>
                `;
            }
        }
    }
    
    function renderCategories() {
        const container = document.getElementById('category-options-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        allCategories.forEach(category => {
            const option = document.createElement('label');
            option.className = 'chip-option';
            option.innerHTML = `
                <input type="checkbox" id="cat_${category.id}" name="categories" value="${category.id}">
                <span>${escapeHtml(category.name)}</span>
            `;
            container.appendChild(option);
        });
    }
    
    function renderFilteredView() {
        const loadingState = document.getElementById('loading-state');
        const categoriesGrid = document.getElementById('categories-grid');
        const recipesList = document.getElementById('recipes-list');
        
        if (loadingState) loadingState.style.display = 'none';
        if (categoriesGrid) categoriesGrid.style.display = 'none';
        if (recipesList) recipesList.style.display = 'block';
        
        if (!recipesList) return;
        
        if (pageData.recipes && pageData.recipes.length > 0) {
            recipesList.innerHTML = pageData.recipes.map(recipe => `
                <a href="view_recipe.html?id=${recipe.id}" class="recipe-item">
                    <img src="${recipe.image_url || `${BASE_URL}/assets/images/recipes/${recipe.image_filename || 'placeholder_food.jpg'}`}" 
                         alt="${escapeHtml(recipe.name)}" 
                         class="recipe-image"
                         onerror="this.src='${BASE_URL}/assets/images/recipes/placeholder_food.jpg'">
                    <div class="recipe-info">
                        <h3 class="recipe-name">${escapeHtml(recipe.name)}</h3>
                        <span class="recipe-kcal">
                            <i class="fas fa-fire-alt"></i>
                            ${Math.round(recipe.kcal_per_serving || 0)} kcal
                        </span>
                    </div>
                </a>
            `).join('');
        } else {
            recipesList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>Nenhuma receita encontrada com estes filtros.</p>
                </div>
            `;
        }
        
        // Mostrar filtros ativos
        const activeFiltersText = document.getElementById('active-filters-text');
        const activeFiltersContainer = document.getElementById('active-filters-container');
        if (pageData.active_filter_names && pageData.active_filter_names.length > 0) {
            if (activeFiltersText) activeFiltersText.textContent = pageData.active_filter_names.join(', ');
            if (activeFiltersContainer) activeFiltersContainer.style.display = 'block';
        } else {
            if (activeFiltersContainer) activeFiltersContainer.style.display = 'none';
        }
    }
    
    function renderCarouselView() {
        const loadingState = document.getElementById('loading-state');
        const recipesList = document.getElementById('recipes-list');
        const categoriesGrid = document.getElementById('categories-grid');
        const activeFiltersContainer = document.getElementById('active-filters-container');
        
        if (loadingState) loadingState.style.display = 'none';
        if (recipesList) recipesList.style.display = 'none';
        if (categoriesGrid) categoriesGrid.style.display = 'block';
        if (activeFiltersContainer) activeFiltersContainer.style.display = 'none';
        
        if (!categoriesGrid) return;
        
        if (pageData.sections && pageData.sections.length > 0) {
            categoriesGrid.innerHTML = pageData.sections.map(section => `
                <section class="category-section">
                    <div class="category-header">
                        <h2 class="category-title">${escapeHtml(section.title)}</h2>
                        <a href="explore_recipes.html?${section.link_params}" class="view-all-link">
                            Ver mais
                        </a>
                    </div>
                    <div class="recipes-carousel">
                        ${section.recipes.map(recipe => `
                            <a href="view_recipe.html?id=${recipe.id}" class="recipe-card">
                                <img src="${recipe.image_url || `${BASE_URL}/assets/images/recipes/${recipe.image_filename || 'placeholder_food.jpg'}`}"
                                     onerror="this.src='${BASE_URL}/assets/images/recipes/placeholder_food.jpg'" 
                                     alt="${escapeHtml(recipe.name)}" 
                                     class="card-image">
                                <div class="card-info">
                                    <h4 class="card-name">${escapeHtml(recipe.name)}</h4>
                                    <span class="card-kcal">
                                        <i class="fas fa-fire-alt"></i>
                                        ${Math.round(recipe.kcal_per_serving || 0)} kcal
                                    </span>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </section>
            `).join('');
        } else {
            categoriesGrid.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <i class="fas fa-utensils" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>Nenhuma receita disponível no momento.</p>
                </div>
            `;
        }
    }
    
    function restoreFiltersState() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Restaurar ordenação
        const initialSort = urlParams.get('sort') || 'name_asc';
        setTimeout(() => {
            const sortRadio = document.querySelector(`input[name="sort"][value="${initialSort}"]`);
            if (sortRadio) sortRadio.checked = true;
            else {
                const defaultSort = document.getElementById('sort_name_asc');
                if (defaultSort) defaultSort.checked = true;
            }
            
            // Restaurar categorias
            const initialCategories = (urlParams.get('categories') || '').split(',').filter(c => c);
            initialCategories.forEach(catId => {
                const checkbox = document.getElementById(`cat_${catId}`);
                if (checkbox) checkbox.checked = true;
            });
            
            // Marcar botão de filtro como ativo
            const filterBtn = document.getElementById('filter-btn');
            if (filterBtn && (urlParams.has('sort') || urlParams.has('categories') || urlParams.has('q'))) {
                filterBtn.classList.add('active');
            }
        }, 100);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function setupFilterModal() {
        const filterBtn = document.getElementById('filter-btn');
        const filterModal = document.getElementById('filter-modal');
        
        if (!filterBtn || !filterModal) return;
        
        const modalContent = filterModal.querySelector('.modal-content');
        const searchInput = document.getElementById('search-input');
        const applyBtn = document.getElementById('apply-filters');
        const clearBtn = document.getElementById('clear-filters');
        
        const openModal = () => {
            if (modalContent) modalContent.style.transform = '';
            filterModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav) {
                bottomNav.style.display = 'none';
            }
        };
        
        const closeModal = () => {
            filterModal.classList.remove('visible');
            document.body.style.overflow = '';
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav) {
                bottomNav.style.display = 'flex';
            }
        };
        
        filterBtn.addEventListener('click', openModal);
        filterModal.addEventListener('click', (e) => {
            if (e.target === filterModal) {
                closeModal();
            }
        });
        
        // Funcionalidade de arrastar para fechar
        if (modalContent) {
            const modalHeader = modalContent.querySelector('.modal-header');
            if (modalHeader) {
                let startY = 0;
                let isDragging = false;
                
                modalHeader.addEventListener('touchstart', (e) => {
                    startY = e.touches[0].clientY;
                    isDragging = true;
                    modalContent.style.transition = 'none';
                }, { passive: true });
                
                modalHeader.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    const currentY = e.touches[0].clientY;
                    const deltaY = currentY - startY;
                    if (deltaY > 0) {
                        modalContent.style.transform = `translateY(${deltaY}px)`;
                    }
                }, { passive: true });
                
                modalHeader.addEventListener('touchend', (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    modalContent.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                    const currentY = e.changedTouches[0].clientY;
                    const deltaY = currentY - startY;
                    const threshold = modalContent.offsetHeight * 0.3;
                    
                    if (deltaY > threshold) {
                        closeModal();
                    } else {
                        modalContent.style.transform = 'translateY(0)';
                    }
                }, { passive: true });
            }
        }
        
        // Aplicar filtros
        const applyFilters = () => {
            if (!searchInput) return;
            const query = searchInput.value.trim();
            const sortValue = document.querySelector('input[name="sort"]:checked')?.value || 'name_asc';
            const selectedCategories = Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(input => input.value);
            
            const url = new URL(window.location.origin + window.location.pathname);
            
            if (query) url.searchParams.set('q', query);
            if (sortValue && sortValue !== 'name_asc') url.searchParams.set('sort', sortValue);
            if (selectedCategories.length > 0) url.searchParams.set('categories', selectedCategories.join(','));
            
            if (window.router) {
                window.router.navigate(url.pathname + url.search);
            } else {
                window.location.href = url.toString();
            }
        };
        
        // Limpar filtros
        const clearFilters = () => {
            if (window.router) {
                window.router.navigate('/explore_recipes');
            } else {
                window.location.href = window.location.pathname;
            }
        };
        
        // Event listeners
        if (applyBtn) applyBtn.addEventListener('click', applyFilters);
        if (clearBtn) clearBtn.addEventListener('click', clearFilters);
        
        // Busca com "debounce"
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const url = new URL(window.location.href);
                    const currentQuery = url.searchParams.get('q') || '';
                    const newQuery = searchInput.value.trim();
                    
                    if (currentQuery !== newQuery) {
                        if (newQuery) {
                            url.searchParams.set('q', newQuery);
                        } else {
                            url.searchParams.delete('q');
                        }
                        if (window.router) {
                            window.router.navigate(url.pathname + url.search);
                        } else {
                            window.location.href = url.toString();
                        }
                    }
                }, 500);
            });
        }
    }
    
    // Carregar dados
    loadPageData();
});

