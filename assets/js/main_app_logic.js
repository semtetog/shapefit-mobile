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
        console.log('Tentando mostrar dashboard-container:', !!dashboardContainer);
        if (dashboardContainer) {
            dashboardContainer.style.display = 'block';
            console.log('dashboard-container display alterado para block');
        } else {
            console.error('dashboard-container não encontrado!');
            // Tentar encontrar qualquer container
            const appContainer = document.querySelector('.app-container');
            console.log('app-container encontrado:', !!appContainer);
            if (appContainer) {
                appContainer.style.display = 'block';
            }
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
        // O script.js já cuida disso via spa:enter-main_app
        
        // Aguardar um pouco para garantir que o script.js foi executado
        setTimeout(() => {
            // Disparar evento customizado para script.js se necessário
            window.dispatchEvent(new CustomEvent('main-app-data-loaded', { detail: data }));
        }, 200);
        
        console.log('Main app data loaded successfully');
        
    } catch (error) {
        console.error('Erro ao carregar dados do main_app:', error);
    }
}

window.addEventListener('spa:enter-main_app', async function() {
    console.log('Main app page loaded via SPA');
    
    // Aguardar um pouco para garantir que o HTML foi inserido no DOM
    setTimeout(async () => {
        // Verificar se o container existe
        const dashboardContainer = document.getElementById('dashboard-container');
        console.log('Dashboard container encontrado:', !!dashboardContainer);
        
        if (!dashboardContainer) {
            console.error('dashboard-container não encontrado no DOM!');
            // Tentar encontrar no spa-container
            const spaContainer = document.getElementById('spa-container');
            if (spaContainer) {
                console.log('spa-container encontrado, conteúdo:', spaContainer.innerHTML.substring(0, 200));
            }
            return;
        }
        
        await loadMainAppData();
    }, 100);
});

