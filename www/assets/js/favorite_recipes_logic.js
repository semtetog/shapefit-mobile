// favorite_recipes_logic.js - Lógica da página de receitas favoritas
// Adaptado para eventos SPA

window.addEventListener('spa:enter-favorite_recipes', async function() {
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
    
    // Carregar dados da página
    async function loadPageData() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q') || '';
            const sort = urlParams.get('sort') || '';
            const categories = urlParams.get('categories') || '';
            
            const apiUrl = `${BASE_URL}/api/get_favorite_recipes_data.php?q=${encodeURIComponent(query)}&sort=${encodeURIComponent(sort)}&categories=${encodeURIComponent(categories)}`;
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
            
            // Renderizar receitas
            renderRecipes();
            
            // Restaurar estado dos filtros
            restoreFiltersState();
            
            // Configurar modal de filtros
            setupFilterModal();
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            const loadingState = document.getElementById('loading-state');
            if (loadingState) {
                loadingState.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; color: var(--accent-orange);"></i>
                    <p>Erro ao carregar receitas favoritas. Tente novamente.</p>
                `;
            }
        }
    }
    
    function renderCategories() {
        const container = document.getElementById('category-options');
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
    
    function renderRecipes() {
        const loadingState = document.getElementById('loading-state');
        const recipesList = document.getElementById('recipes-list');
        const emptyState = document.getElementById('empty-state');
        
        if (loadingState) loadingState.style.display = 'none';
        
        if (pageData.recipes && pageData.recipes.length > 0) {
            if (recipesList) recipesList.style.display = 'flex';
            if (emptyState) emptyState.style.display = 'none';
            
            const recipesHtml = pageData.recipes.map(recipe => {
                const imageUrl = recipe.image_filename 
                    ? `${BASE_URL}/assets/images/recipes/${recipe.image_filename}`
                    : `${BASE_URL}/assets/images/recipes/placeholder_food.jpg`;
                
                return `
                    <a href="view_recipe.html?id=${recipe.id}" class="recipe-list-item glass-card">
                        <img src="${imageUrl}" alt="${escapeHtml(recipe.name)}" class="recipe-list-image">
                        <div class="recipe-list-info">
                            <h3>${escapeHtml(recipe.name)}</h3>
                            <span class="kcal"><i class="fas fa-fire-alt"></i> ${Math.round(recipe.kcal_per_serving || 0)} kcal</span>
                        </div>
                        <div class="favorite-icon"><i class="fas fa-heart"></i></div>
                    </a>
                `;
            }).join('');
            
            if (recipesList) recipesList.innerHTML = recipesHtml;
        } else {
            if (recipesList) recipesList.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            
            const urlParams = new URLSearchParams(window.location.search);
            const isFiltered = urlParams.has('q') || urlParams.has('sort') || urlParams.has('categories');
            const emptyMessage = document.getElementById('empty-message');
            if (emptyMessage) {
                emptyMessage.innerHTML = isFiltered
                    ? 'Nenhuma receita favorita encontrada com estes filtros.'
                    : 'Você ainda não favoritou nenhuma receita.<br><span style="color: var(--accent-orange);">Toque no coração para guardá-las aqui.</span>';
            }
        }
    }
    
    function restoreFiltersState() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Restaurar ordenação
        const initialSort = urlParams.get('sort') || '';
        setTimeout(() => {
            const sortRadio = document.querySelector(`input[name="sort"][value="${initialSort}"]`);
            if (sortRadio) sortRadio.checked = true;
            
            // Restaurar categorias
            const initialCategories = (urlParams.get('categories') || '').split(',').filter(c => c);
            initialCategories.forEach(catId => {
                const checkbox = document.getElementById(`cat_${catId}`);
                if (checkbox) checkbox.checked = true;
            });
            
            // Marcar botão de filtro como ativo
            const filterButton = document.getElementById('filter-button');
            if (filterButton && (urlParams.has('sort') || urlParams.has('categories') || urlParams.has('q'))) {
                filterButton.classList.add('active');
            }
        }, 100);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function setupFilterModal() {
        const filterButton = document.getElementById('filter-button');
        const filterModal = document.getElementById('filter-modal');
        
        if (!filterButton || !filterModal) return;
        
        const modalContent = filterModal.querySelector('.modal-content');
        const closeModal = () => {
            filterModal.classList.remove('visible');
            setTimeout(() => {
                if (modalContent) {
                    modalContent.style.transform = '';
                    modalContent.style.transition = '';
                }
            }, 350);
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav) {
                bottomNav.style.display = 'flex';
            }
        };
        
        const toggleModal = () => {
            const isOpening = !filterModal.classList.contains('visible');
            filterModal.classList.toggle('visible');
            
            if (isOpening && modalContent) {
                modalContent.style.transform = '';
                modalContent.style.transition = '';
            } else if (modalContent) {
                setTimeout(() => {
                    modalContent.style.transform = '';
                    modalContent.style.transition = '';
                }, 350);
            }
            
            const bottomNav = document.querySelector('.bottom-nav');
            if (bottomNav) {
                bottomNav.style.display = filterModal.classList.contains('visible') ? 'none' : 'flex';
            }
        };
        
        filterButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleModal();
        });
        
        filterModal.addEventListener('click', (e) => {
            if (e.target === filterModal) {
                closeModal();
            }
        });
        
        // Funcionalidade de arrastar para fechar
        const modalHeader = modalContent ? modalContent.querySelector('.modal-header') : null;
        if (modalHeader) {
            let startY = 0;
            let isDragging = false;
            
            modalHeader.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                isDragging = true;
                if (modalContent) modalContent.style.transition = 'none';
            }, { passive: true });
            
            modalHeader.addEventListener('touchmove', (e) => {
                if (!isDragging || !modalContent) return;
                const currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                if (deltaY > 0) {
                    modalContent.style.transform = `translateY(${deltaY}px)`;
                }
            }, { passive: true });
            
            modalHeader.addEventListener('touchend', (e) => {
                if (!isDragging || !modalContent) return;
                isDragging = false;
                modalContent.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                const currentY = e.changedTouches[0].clientY;
                const deltaY = currentY - startY;
                const threshold = modalContent.offsetHeight * 0.3;
                
                if (deltaY > threshold) {
                    closeModal();
                } else {
                    modalContent.style.transform = 'translateY(0)';
                    setTimeout(() => {
                        modalContent.style.transform = '';
                        modalContent.style.transition = '';
                    }, 400);
                }
            }, { passive: true });
        }
        
        const searchInput = document.getElementById('search-input');
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        
        const applyAndRedirect = () => {
            if (!searchInput) return;
            const query = searchInput.value.trim();
            const sortValueInput = document.querySelector('input[name="sort"]:checked');
            const sortValue = sortValueInput ? sortValueInput.value : '';
            const selectedCategories = Array.from(document.querySelectorAll('#category-options input:checked')).map(input => input.value);
            
            if (query === '' && selectedCategories.length === 0 && !sortValue) {
                if (window.router) {
                    window.router.navigate('/favorite_recipes');
                } else {
                    window.location.href = window.location.pathname;
                }
                return;
            }
            
            const url = new URL(window.location.origin + window.location.pathname);
            if (query) url.searchParams.set('q', query);
            if (sortValue) url.searchParams.set('sort', sortValue);
            if (selectedCategories.length > 0) url.searchParams.set('categories', selectedCategories.join(','));
            
            if (window.router) {
                window.router.navigate(url.pathname + url.search);
            } else {
                window.location.href = url.toString();
            }
        };
        
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', applyAndRedirect);
        }
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                if (window.router) {
                    window.router.navigate('/favorite_recipes');
                } else {
                    window.location.href = window.location.pathname;
                }
            });
        }
        
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

