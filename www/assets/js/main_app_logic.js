// main_app_logic.js - Lógica da página principal do app
// Adaptado para eventos SPA

async function loadMainAppData() {
    try {
        const authenticated = await requireAuth();
        if (!authenticated) {
            if (window.router) {
                window.router.navigate('/login');
            }
            return;
        }
        
        // Mostrar o container do dashboard
        const dashboardContainer = document.getElementById('dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.style.display = 'block';
        }
        
        // Carregar dados do dashboard
        const response = await authenticatedFetch(`${window.BASE_APP_URL}/api/get_dashboard_data.php`);
        if (!response || !response.ok) {
            console.error('Erro ao carregar dados do dashboard');
            return;
        }
        
        const result = await response.json();
        if (!result.success) {
            console.error('Erro na API:', result.message);
            return;
        }
        
        const data = result.data;
        
        // Renderizar ranking
        if (data.ranking) {
            const rankingCard = document.getElementById('ranking-card');
            if (rankingCard) {
                rankingCard.style.display = 'block';
            }
            
            // Atualizar dados do ranking
            if (data.ranking.my_rank) {
                const myRankEl = document.getElementById('my-rank');
                if (myRankEl) myRankEl.textContent = data.ranking.my_rank;
            }
            
            if (data.ranking.opponent) {
                const opponentNameEl = document.getElementById('opponent-name');
                if (opponentNameEl) opponentNameEl.textContent = data.ranking.opponent.name;
                
                const opponentInfoEl = document.getElementById('opponent-info');
                if (opponentInfoEl && data.ranking.opponent.profile_image_filename) {
                    const avatar = opponentInfoEl.querySelector('.player-avatar');
                    if (avatar) {
                        avatar.innerHTML = `<img src="${window.BASE_APP_URL}/assets/images/users/${data.ranking.opponent.profile_image_filename}" alt="${data.ranking.opponent.name}">`;
                    }
                }
            }
            
            if (data.ranking.progress_percentage !== undefined) {
                const progressBar = document.getElementById('ranking-progress-bar');
                if (progressBar) {
                    progressBar.style.width = `${data.ranking.progress_percentage}%`;
                }
            }
        }
        
        // Atualizar pontos do usuário
        if (data.user_points !== undefined) {
            const pointsDisplay = document.getElementById('user-points-display');
            if (pointsDisplay) {
                pointsDisplay.textContent = data.user_points;
            }
        }
        
        // Carregar dados de peso, água, etc. (se necessário)
        // O script.js já cuida disso via DOMContentLoaded, mas precisamos garantir que seja executado
        
        console.log('Main app data loaded successfully');
        
    } catch (error) {
        console.error('Erro ao carregar dados do main_app:', error);
    }
}

window.addEventListener('spa:enter-main_app', async function() {
    console.log('Main app page loaded via SPA');
    await loadMainAppData();
});

