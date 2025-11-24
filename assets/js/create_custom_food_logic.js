// create_custom_food_logic.js - Lógica da página de criar alimento customizado
// Adaptado para eventos SPA

window.addEventListener('spa:enter-create_custom_food', async function() {
    const authenticated = await requireAuth();
    if (!authenticated) {
        if (window.router) {
            window.router.navigate('/login');
        }
        return;
    }
    
    // Preencher campos da URL (se vier do scanner)
    const urlParams = new URLSearchParams(window.location.search);
    const barcode = urlParams.get('barcode');
    const foodName = urlParams.get('food_name');
    const brandName = urlParams.get('brand_name');
    const kcal = urlParams.get('kcal_100g');
    const protein = urlParams.get('protein_100g');
    const carbs = urlParams.get('carbs_100g');
    const fat = urlParams.get('fat_100g');
    
    const barcodeInfo = document.getElementById('barcode-info');
    const barcodeValue = document.getElementById('barcode-value');
    const customFoodForm = document.getElementById('custom-food-form');
    
    if (barcode && barcodeInfo && barcodeValue) {
        barcodeInfo.style.display = 'flex';
        barcodeValue.textContent = barcode;
        // Adicionar campo hidden para o barcode
        if (customFoodForm) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'barcode';
            hiddenInput.value = barcode;
            customFoodForm.appendChild(hiddenInput);
        }
    }
    
    if (foodName) {
        const foodNameInput = document.getElementById('food_name');
        if (foodNameInput) foodNameInput.value = foodName;
    }
    if (brandName) {
        const brandNameInput = document.getElementById('brand_name');
        if (brandNameInput) brandNameInput.value = brandName;
    }
    if (kcal) {
        const kcalInput = document.getElementById('kcal_100g');
        if (kcalInput) kcalInput.value = kcal;
    }
    if (protein) {
        const proteinInput = document.getElementById('protein_100g');
        if (proteinInput) proteinInput.value = protein;
    }
    if (carbs) {
        const carbsInput = document.getElementById('carbs_100g');
        if (carbsInput) carbsInput.value = carbs;
    }
    if (fat) {
        const fatInput = document.getElementById('fat_100g');
        if (fatInput) fatInput.value = fat;
    }
    
    // Event listener do formulário
    if (customFoodForm) {
        customFoodForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            if (!submitBtn) return;
            
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            
            const formData = {
                food_name: document.getElementById('food_name')?.value.trim() || '',
                brand_name: document.getElementById('brand_name')?.value.trim() || '',
                kcal_100g: parseFloat(document.getElementById('kcal_100g')?.value || '0'),
                protein_100g: parseFloat(document.getElementById('protein_100g')?.value || '0'),
                carbs_100g: parseFloat(document.getElementById('carbs_100g')?.value || '0'),
                fat_100g: parseFloat(document.getElementById('fat_100g')?.value || '0')
            };
            
            const barcodeInput = document.querySelector('input[name="barcode"]');
            if (barcodeInput) {
                formData.barcode = barcodeInput.value;
            }
            
            try {
                const response = await authenticatedFetch(`${window.BASE_APP_URL}/api/save_custom_food.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    return;
                }
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('success', data.message || 'Alimento salvo com sucesso!');
                    setTimeout(() => {
                        if (window.router) {
                            window.router.navigate('/add_food_to_diary');
                        } else {
                            window.location.href = './add_food_to_diary.html';
                        }
                    }, 1500);
                } else {
                    showAlert('danger', data.message || 'Erro ao salvar o alimento.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            } catch (error) {
                console.error('Erro ao salvar alimento:', error);
                showAlert('danger', 'Erro ao salvar o alimento. Tente novamente.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});

function showAlert(type, message) {
    const container = document.getElementById('alert-container');
    if (container) {
        container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

