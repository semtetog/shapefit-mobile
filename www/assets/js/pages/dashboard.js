// Scripts inline extraídos de dashboard.html
// Gerado automaticamente - não editar manualmente

// Script inline 1


// Script inline 2
// BASE_APP_URL já foi definido pelo www-config.js
        // Se não foi definido (fallback), usar URL local
        if (!window.BASE_APP_URL) {
            // BASE_APP_URL já foi definido pelo www-config.js
            if (!window.BASE_APP_URL) { window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/'); } if (window.BASE_APP_URL && window.BASE_APP_URL.endsWith('/')) {
                window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
            }
        }
        console.log('[dashboard] BASE_APP_URL:', window.BASE_APP_URL);

// Script inline 3


// Script inline 4


// Script inline 5


// Script inline 6


// Script inline 7
const BASE_URL = window.BASE_APP_URL || '';
        
        function formatNumber(num) {
            if (!num) return '0';
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
        
        async function loadDashboardData() {
            try {
                console.log('Iniciando carregamento de dados...');
                const authenticated = await requireAuth();
                if (!authenticated) {
                    console.log('Usuário não autenticado');
                    return;
                }
                
                console.log('Fazendo requisição para:', `${BASE_URL}/api/get_dashboard_goals_data.php`);
                const response = await authenticatedFetch(`${BASE_URL}/api/get_dashboard_goals_data.php`);
                
                if (!response) {
                    console.error('Resposta vazia');
                    return;
                }
                
                if (!response.ok) {
                    const text = await response.text();
                    console.error('Erro HTTP:', response.status, text);
                    return;
                }
                
                const text = await response.text();
                console.log('Resposta recebida:', text);
                
                if (!text || text.trim() === '') {
                    console.error('Resposta vazia do servidor');
                    return;
                }
                
                let result;
                try {
                    result = JSON.parse(text);
                    console.log('JSON parseado:', result);
                } catch (parseError) {
                    console.error('Erro ao parsear JSON:', parseError);
                    console.error('Texto recebido:', text);
                    return;
                }
                
                if (!result.success) {
                    console.error('API retornou erro:', result.message);
                    return;
                }
                
                const data = result.data;
                const goals = data.goals;
                
                console.log('Dados dos goals:', goals);
                
                if (goals && goals.calories) {
                    document.getElementById('calories-value').textContent = formatNumber(goals.calories.goal || 0);
                }
                if (goals && goals.carbs) {
                    document.getElementById('carbs-consumed').textContent = goals.carbs.consumed || 0;
                    document.getElementById('carbs-goal').textContent = goals.carbs.goal || 0;
                }
                if (goals && goals.protein) {
                    document.getElementById('protein-consumed').textContent = goals.protein.consumed || 0;
                    document.getElementById('protein-goal').textContent = goals.protein.goal || 0;
                }
                if (goals && goals.fat) {
                    document.getElementById('fat-consumed').textContent = goals.fat.consumed || 0;
                    document.getElementById('fat-goal').textContent = goals.fat.goal || 0;
                }
                if (goals && goals.water) {
                    document.getElementById('water-consumed').textContent = goals.water.consumed || 0;
                    document.getElementById('water-goal').textContent = goals.water.goal || 0;
                }
                
                console.log('Dados atualizados na página');
                
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        }
        
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM carregado, iniciando loadDashboardData...');
            loadDashboardData();
        });

