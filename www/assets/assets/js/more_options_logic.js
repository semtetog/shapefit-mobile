// more_options_logic.js - Lógica específica inline do more_options.html

(function() {
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
            const profileNameEl = document.getElementById('profile-name');
            if (profileNameEl) {
                profileNameEl.textContent = data.first_name;
            }
            
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
                    if (profileImageContainer) {
                        profileImageContainer.appendChild(placeholder);
                    }
                };
                
                // Limpar container e adicionar imagem
                if (profileImageContainer) {
                    profileImageContainer.innerHTML = '';
                    profileImageContainer.appendChild(img);
                }
            } else {
                // Se não tem foto, garantir que o placeholder está visível
                if (profileImageContainer) {
                    profileImageContainer.innerHTML = '<div class="profile-icon-placeholder"><i class="fas fa-user"></i></div>';
                }
            }
            
            // Atualizar link do perfil
            if (profileCard) {
                if (window.router) {
                    profileCard.href = '/edit_profile';
                    profileCard.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.router.navigate('/edit_profile');
                    });
                } else {
                    profileCard.href = `${data.base_url}/edit_profile.html`;
                }
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    
    // Evento quando a view More Options entra
    window.addEventListener('spa:enter-more_options', async function() {
        const authenticated = await requireAuth();
        if (!authenticated) return;
        
        await loadMoreOptionsData();
    });
    
    // Evento quando a view More Options sai (opcional, para cleanup)
    window.addEventListener('spa:leave-more_options', function() {
        // Cleanup se necessário
    });
})();
