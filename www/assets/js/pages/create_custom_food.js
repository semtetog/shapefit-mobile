// Scripts inline extraídos de create_custom_food.html
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


// Script inline 6
// Verificar autenticação
        document.addEventListener('DOMContentLoaded', async function() {
            const authenticated = await requireAuth();
            if (!authenticated) return;
            
            // Preencher campos da URL (se vier do scanner)
            const urlParams = new URLSearchParams(window.location.search);
            const barcode = urlParams.get('barcode');
            const foodName = urlParams.get('food_name');
            const brandName = urlParams.get('brand_name');
            const kcal = urlParams.get('kcal_100g');
            const protein = urlParams.get('protein_100g');
            const carbs = urlParams.get('carbs_100g');
            const fat = urlParams.get('fat_100g');
            
            if (barcode) {
                document.getElementById('barcode-info').style.display = 'flex';
                document.getElementById('barcode-value').textContent = barcode;
                // Adicionar campo hidden para o barcode
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'barcode';
                hiddenInput.value = barcode;
                document.getElementById('custom-food-form').appendChild(hiddenInput);
            }
            
            if (foodName) document.getElementById('food_name').value = foodName;
            if (brandName) document.getElementById('brand_name').value = brandName;
            if (kcal) document.getElementById('kcal_100g').value = kcal;
            if (protein) document.getElementById('protein_100g').value = protein;
            if (carbs) document.getElementById('carbs_100g').value = carbs;
            if (fat) document.getElementById('fat_100g').value = fat;
            
            // Event listener do formulário
            document.getElementById('custom-food-form').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = document.getElementById('submit-btn');
                const originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                
                const formData = {
                    food_name: document.getElementById('food_name').value.trim(),
                    brand_name: document.getElementById('brand_name').value.trim(),
                    kcal_100g: parseFloat(document.getElementById('kcal_100g').value),
                    protein_100g: parseFloat(document.getElementById('protein_100g').value),
                    carbs_100g: parseFloat(document.getElementById('carbs_100g').value),
                    fat_100g: parseFloat(document.getElementById('fat_100g').value)
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
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        showAlert('success', data.message || 'Alimento salvo com sucesso!');
                        setTimeout(() => {
                            window.location.href = './add_food_to_diary.html';
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
        });
        
        function showAlert(type, message) {
            const container = document.getElementById('alert-container');
            container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }

