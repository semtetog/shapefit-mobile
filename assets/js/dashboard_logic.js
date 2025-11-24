// dashboard_logic.js - Lógica específica da página Dashboard
// Usa eventos SPA para inicializar quando a view é carregada

(function() {
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
                const caloriesEl = document.getElementById('calories-value');
                if (caloriesEl) {
                    caloriesEl.textContent = formatNumber(goals.calories.goal || 0);
                }
            }
            if (goals && goals.carbs) {
                const carbsConsumedEl = document.getElementById('carbs-consumed');
                const carbsGoalEl = document.getElementById('carbs-goal');
                if (carbsConsumedEl) carbsConsumedEl.textContent = goals.carbs.consumed || 0;
                if (carbsGoalEl) carbsGoalEl.textContent = goals.carbs.goal || 0;
            }
            if (goals && goals.protein) {
                const proteinConsumedEl = document.getElementById('protein-consumed');
                const proteinGoalEl = document.getElementById('protein-goal');
                if (proteinConsumedEl) proteinConsumedEl.textContent = goals.protein.consumed || 0;
                if (proteinGoalEl) proteinGoalEl.textContent = goals.protein.goal || 0;
            }
            if (goals && goals.fat) {
                const fatConsumedEl = document.getElementById('fat-consumed');
                const fatGoalEl = document.getElementById('fat-goal');
                if (fatConsumedEl) fatConsumedEl.textContent = goals.fat.consumed || 0;
                if (fatGoalEl) fatGoalEl.textContent = goals.fat.goal || 0;
            }
            if (goals && goals.water) {
                const waterConsumedEl = document.getElementById('water-consumed');
                const waterGoalEl = document.getElementById('water-goal');
                if (waterConsumedEl) waterConsumedEl.textContent = goals.water.consumed || 0;
                if (waterGoalEl) waterGoalEl.textContent = goals.water.goal || 0;
            }
            
            console.log('Dados atualizados na página');
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    
    // Evento quando a view Dashboard entra
    window.addEventListener('spa:enter-dashboard', function() {
        console.log('Dashboard view carregada, iniciando loadDashboardData...');
        loadDashboardData();
    });
    
    // Evento quando a view Dashboard sai (opcional, para cleanup)
    window.addEventListener('spa:leave-dashboard', function() {
        // Cleanup se necessário
        console.log('Saindo da view Dashboard');
    });
})();
