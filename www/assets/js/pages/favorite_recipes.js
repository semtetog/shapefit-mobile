// Scripts inline extraídos de favorite_recipes.html
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
                    
                    if (!response) return; // Token inválido, já redirecionou
                    
                    const result = await response.json();
                    
                    if (!result.success) {
                        throw new Error(result.message || 'Erro ao carregar dados');
                    }
                    
                    pageData = result.data;
                    allCategories = result.data.all_categories || [];
                    
                    // Preencher input de busca
                    document.getElementById('search-input').value = query;
                    
                    // Renderizar categorias no modal
                    renderCategories();
                    
                    // Renderizar receitas
                    renderRecipes();
                    
                    // Restaurar estado dos filtros
                    restoreFiltersState();
                    
                } catch (error) {
                    console.error('Erro ao carregar dados:', error);
                    document.getElementById('loading-state').innerHTML = `
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; color: var(--accent-orange);"></i>
                        <p>Erro ao carregar receitas favoritas. Tente novamente.</p>
                    `;
                }
            }
            
            function renderCategories() {
                const container = document.getElementById('category-options');
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
                document.getElementById('loading-state').style.display = 'none';
                
                if (pageData.recipes && pageData.recipes.length > 0) {
                    document.getElementById('recipes-list').style.display = 'flex';
                    document.getElementById('empty-state').style.display = 'none';
                    
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
                    
                    document.getElementById('recipes-list').innerHTML = recipesHtml;
                } else {
                    document.getElementById('recipes-list').style.display = 'none';
                    document.getElementById('empty-state').style.display = 'block';
                    
                    const urlParams = new URLSearchParams(window.location.search);
                    const isFiltered = urlParams.has('q') || urlParams.has('sort') || urlParams.has('categories');
                    document.getElementById('empty-message').innerHTML = isFiltered
                        ? 'Nenhuma receita favorita encontrada com estes filtros.'
                        : 'Você ainda não favoritou nenhuma receita.<br><span style="color: var(--accent-orange);">Toque no coração para guardá-las aqui.</span>';
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
            
            // Carregar dados ao iniciar
            loadPageData();
            
            // Script de filtro - executar após DOM estar pronto
            function setupFilterModal() {
                const filterButton = document.getElementById('filter-button');
                const filterModal = document.getElementById('filter-modal');
                
                if (filterButton && filterModal) {
                    const modalContent = filterModal.querySelector('.modal-content');
                    const closeModal = () => {
                        filterModal.classList.remove('visible');
                        // Resetar transform quando fechar
                        setTimeout(() => {
                            modalContent.style.transform = '';
                            modalContent.style.transition = '';
                        }, 350);
                        // Mostrar bottom-nav quando modal fechar
                        const bottomNav = document.querySelector('.bottom-nav');
                        if (bottomNav) {
                            bottomNav.style.display = 'flex';
                        }
                    };
                    
                    const toggleModal = () => {
                        const isOpening = !filterModal.classList.contains('visible');
                        filterModal.classList.toggle('visible');
                        
                        // Resetar transform quando abrir
                        if (isOpening) {
                            modalContent.style.transform = '';
                            modalContent.style.transition = '';
                        } else {
                            // Resetar transform quando fechar
                            setTimeout(() => {
                                modalContent.style.transform = '';
                                modalContent.style.transition = '';
                            }, 350);
                        }
                        
                        // Esconder/mostrar bottom-nav quando modal abrir/fechar
                        const bottomNav = document.querySelector('.bottom-nav');
                        if (bottomNav) {
                            if (filterModal.classList.contains('visible')) {
                                bottomNav.style.display = 'none';
                            } else {
                                bottomNav.style.display = 'flex';
                            }
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
                                // Resetar transform após animação
                                setTimeout(() => {
                                    modalContent.style.transform = '';
                                    modalContent.style.transition = '';
                                }, 400);
                            }
                        }, { passive: true });
                    }
                }
                
                const searchInput = document.getElementById('search-input');
                const applyFiltersBtn = document.getElementById('apply-filters-btn');
                const clearFiltersBtn = document.getElementById('clear-filters-btn');
                
                const applyAndRedirect = () => {
                    const query = searchInput.value.trim();
                    const sortValueInput = document.querySelector('input[name="sort"]:checked');
                    const sortValue = sortValueInput ? sortValueInput.value : '';
                    const selectedCategories = Array.from(document.querySelectorAll('#category-options input:checked')).map(input => input.value);
                    if (query === '' && selectedCategories.length === 0 && !sortValue) {
                        window.location.href = './favorite_recipes.html';
                        return;
                    }
                    // Usar caminho relativo para manter dentro do app
                    const params = new URLSearchParams();
                    if (query) params.set('q', query);
                    if (sortValue) params.set('sort', sortValue);
                    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
                    const queryString = params.toString();
                    window.location.href = queryString ? `./favorite_recipes.html?${queryString}` : './favorite_recipes.html';
                };
                
                if (applyFiltersBtn) {
                    applyFiltersBtn.addEventListener('click', applyAndRedirect);
                }
                
                if (clearFiltersBtn) {
                    clearFiltersBtn.addEventListener('click', () => {
                        window.location.href = './favorite_recipes.html';
                    });
                }
                
                if (searchInput) {
                    let debounceTimer;
                    searchInput.addEventListener('input', () => {
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            const currentUrl = new URL(window.location.href);
                            const currentQuery = currentUrl.searchParams.get('q') || '';
                            const newQuery = searchInput.value.trim();
                            if (currentQuery !== newQuery) {
                                // Usar caminho relativo para manter dentro do app
                                const params = new URLSearchParams(currentUrl.search);
                                if (newQuery) {
                                    params.set('q', newQuery);
                                } else {
                                    params.delete('q');
                                }
                                const queryString = params.toString();
                                window.location.href = queryString ? `./favorite_recipes.html?${queryString}` : './favorite_recipes.html';
                            }
                        }, 500);
                    });
                }
            }
            
            // Re-executar quando carregado via SPA
            window.addEventListener('spa-page-loaded', function(e) {
                if (e.detail && e.detail.isSPANavigation) {
                    const pageName = window.location.pathname.split('/').pop();
                    if (pageName === 'favorite_recipes.html') {
                        setTimeout(() => {
                            loadPageData();
                        }, 100);
                    }
                }
            });
            
            // Executar quando DOM estiver pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', setupFilterModal);
            } else {
                setupFilterModal();
            }
        })();

