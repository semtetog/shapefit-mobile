// Função para carregar dados do perfil
async function loadProfileData() {
    try {
        const authenticated = await requireAuth();
        if (!authenticated) {
            return;
        }
        
        const response = await authenticatedFetch(`${window.BASE_APP_URL}/api/get_profile_data.php`);
        if (!response || !response.ok) {
            console.error('Erro ao carregar dados do perfil');
            return;
        }
        
        const result = await response.json();
        if (!result.success) {
            console.error('Erro na API:', result.message);
            return;
        }
        
        const data = result.data;
        
        // Preencher campos do formulário
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const birthdateInput = document.getElementById('birthdate');
        const genderInput = document.querySelector('input[name="gender"][value="' + data.gender + '"]');
        const heightInput = document.getElementById('height');
        const activityLevelInput = document.querySelector('input[name="activity_level"][value="' + data.activity_level + '"]');
        const goalInput = document.querySelector('input[name="goal"][value="' + data.goal + '"]');
        
        if (nameInput) nameInput.value = data.name || '';
        if (emailInput) emailInput.value = data.email || '';
        if (phoneInput) phoneInput.value = data.phone || '';
        if (birthdateInput) birthdateInput.value = data.birthdate || '';
        if (genderInput) genderInput.checked = true;
        if (heightInput) heightInput.value = data.height || '';
        if (activityLevelInput) activityLevelInput.checked = true;
        if (goalInput) goalInput.checked = true;
        
        // Atualizar foto de perfil
        const profilePictureDisplay = document.getElementById('profile-picture-display');
        if (profilePictureDisplay && data.profile_image_filename) {
            profilePictureDisplay.src = `${window.BASE_APP_URL}/assets/images/users/${data.profile_image_filename}`;
        }
        
        console.log('Profile data loaded successfully');
        
    } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
    }
}

// Função para inicializar a página de edit profile
function initEditProfilePage() {
    // Carregar dados do perfil
    loadProfileData();
    
    const csrfToken = document.getElementById('csrf_token_main_app')?.value;
    const editProfileForm = document.getElementById('edit-profile-form');
    
    // --- LÓGICA DO FORMULÁRIO PRINCIPAL ---
    if (editProfileForm) {
        // --- Lógica de Upload de Foto ---
        const profilePictureInput = document.getElementById('profile-picture-input');
        const profilePictureDisplay = document.getElementById('profile-picture-display');
        const editPictureOverlay = document.querySelector('.edit-picture-overlay');
        const uploadStatus = document.getElementById('upload-status');

        if (profilePictureInput && profilePictureDisplay && editPictureOverlay) {
            profilePictureInput.addEventListener('change', async function(event) {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = e => profilePictureDisplay.src = e.target.result;
                reader.readAsDataURL(file);

                editPictureOverlay.classList.add('is-loading');
                uploadStatus.textContent = '';
                
                const formData = new FormData();
                formData.append('action', 'update_profile_picture');
                formData.append('profile_picture', file);
                formData.append('csrf_token', csrfToken);

                try {
                    const response = await fetch('includes/ajax_handler.php', { method: 'POST', body: formData });
                    const result = await response.json();
                    uploadStatus.textContent = result.message;
                    uploadStatus.className = result.success ? 'upload-status success' : 'upload-status error';
                    if (result.success) { profilePictureDisplay.src = result.new_image_url; }
                } catch (error) {
                    uploadStatus.textContent = "Falha de comunicação.";
                    uploadStatus.className = 'upload-status error';
                } finally {
                    editPictureOverlay.classList.remove('is-loading');
                    setTimeout(() => uploadStatus.textContent = '', 3000);
                }
            });
        }
        
        // --- Lógica de Salvar os Dados do Formulário ---
        editProfileForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const saveButton = this.querySelector('button[type="submit"]');
            const originalButtonText = saveButton.textContent;
            saveButton.textContent = 'Salvando...';
            saveButton.disabled = true;

            const formData = new FormData(this);
            formData.append('action', 'update_profile_details');
            formData.append('csrf_token', csrfToken);

            try {
                const response = await fetch('includes/ajax_handler.php', { method: 'POST', body: formData });
                const result = await response.json();
                uploadStatus.textContent = result.message;
                uploadStatus.className = result.success ? 'upload-status success' : 'upload-status error';
                setTimeout(() => uploadStatus.textContent = '', 3000);
            } catch (error) {
                uploadStatus.textContent = 'Falha ao conectar com o servidor.';
                uploadStatus.className = 'upload-status error';
                setTimeout(() => uploadStatus.textContent = '', 3000);
            } finally {
                saveButton.textContent = originalButtonText;
                saveButton.disabled = false;
            }
        });

        // --- LÓGICA DO MODAL DE RESTRIÇÕES ---
        const restrictionsModal = document.getElementById('restrictions-modal');
        const openModalBtn = document.getElementById('open-restrictions-modal');
        
        if (openModalBtn && restrictionsModal) {
            const closeModalBtns = restrictionsModal.querySelectorAll('.modal-close-btn, .modal-overlay, .modal-confirm-btn');

            const openModal = () => restrictionsModal.classList.add('active');
            const closeModal = () => restrictionsModal.classList.remove('active');

            openModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });

            closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
        }
    }
}

// Evento quando a view Edit Profile entra
window.addEventListener('spa:enter-edit_profile', function() {
    initEditProfilePage();
});

// Evento quando a view Edit Profile sai (opcional, para cleanup)
window.addEventListener('spa:leave-edit_profile', function() {
    // Cleanup se necessário
});