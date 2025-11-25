// Scripts inline extraídos de more_options.html
// Gerado automaticamente - não editar manualmente

// Script inline 1


// Script inline 2
// BASE_APP_URL já foi definido pelo www-config.js
        if (!window.BASE_APP_URL) { window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/'); } if (window.BASE_APP_URL && window.BASE_APP_URL.endsWith('/')) {
            window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
        }

// Script inline 3


// Script inline 4


// Script inline 5
const bottomNavScript = document.createElement('script');
        bottomNavScript.src = './assets/js/bottom-nav.js?v=' + Date.now();
        document.head.appendChild(bottomNavScript);

// Script inline 6
const BASE_URL = window.BASE_APP_URL || '';
        
        async function loadMoreOptionsData() {
            try {
                const response = await authenticatedFetch(`${BASE_URL}/api/get_more_options_data.php`);
                
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
                
                // Atualizar nome
                document.getElementById('profile-name').textContent = data.first_name;
                
                // Atualizar foto de perfil
                const profileImageContainer = document.getElementById('profile-image-container');
                const profileCard = document.getElementById('profile-card');
                
                if (data.profile_image_url) {
                    // Criar imagem
                    const img = document.createElement('img');
                    img.src = data.profile_image_url;
                    img.alt = 'Foto de Perfil';
                    img.className = 'profile-picture';
                    img.onerror = function() {
                        // Se a imagem falhar, remover e mostrar placeholder
                        this.remove();
                        const placeholder = document.createElement('div');
                        placeholder.className = 'profile-icon-placeholder';
                        placeholder.innerHTML = '<i class="fas fa-user"></i>';
                        profileImageContainer.appendChild(placeholder);
                    };
                    
                    // Limpar container e adicionar imagem
                    profileImageContainer.innerHTML = '';
                    profileImageContainer.appendChild(img);
                } else {
                    // Se não tem foto, garantir que o placeholder está visível
                    profileImageContainer.innerHTML = '<div class="profile-icon-placeholder"><i class="fas fa-user"></i></div>';
                }
                
                // Atualizar link do perfil
                if (profileCard) {
                    profileCard.href = './edit_profile.html';
                }
                
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        }
        
        // Função para fazer logout
        function handleLogout() {
            // Limpar token
            if (typeof clearAuthToken === 'function') {
                clearAuthToken();
            } else {
                localStorage.removeItem('shapefit_auth_token');
            }
            
            // Redirecionar para login
            window.location.href = './auth/login.html';
        }
        
        // Função para inicializar a página
        async function initializePage() {
            const authenticated = await requireAuth();
            if (!authenticated) return;
            
            // Configurar botão de logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                // Remover listeners antigos para evitar duplicação
                const newLogoutBtn = logoutBtn.cloneNode(true);
                logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
                
                newLogoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    handleLogout();
                });
            }
            
            await loadMoreOptionsData();
        }
        
        // Re-executar quando carregado via SPA
        window.addEventListener('spa-page-loaded', function(e) {
            if (e.detail && e.detail.isSPANavigation) {
                const pageName = window.location.pathname.split('/').pop();
                if (pageName === 'more_options.html') {
                    setTimeout(() => {
                        initializePage();
                    }, 100);
                }
            }
        });
        
        document.addEventListener('DOMContentLoaded', async function() {
            await initializePage();
        });

