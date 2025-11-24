// main_app_logic.js - Lógica da página principal do app
// Adaptado para eventos SPA

async function loadMainAppData() {
    console.log('[main_app_logic] loadMainAppData() chamado!');
    try {
        console.log('[main_app_logic] Verificando autenticação...');
        const authenticated = await requireAuth();
        console.log('[main_app_logic] Autenticado:', authenticated);
        if (!authenticated) {
            console.warn('[main_app_logic] Usuário não autenticado, redirecionando para login');
            if (window.router) {
                window.router.navigate('/login');
            }
            return;
        }
        
        // Mostrar o container do dashboard
        // Tentar encontrar o container de várias formas
        let dashboardContainer = document.getElementById('dashboard-container');
        
        // Se não encontrar, tentar no spa-container
        if (!dashboardContainer) {
            const spaContainer = document.getElementById('spa-container');
            if (spaContainer) {
                dashboardContainer = spaContainer.querySelector('#dashboard-container');
            }
        }
        
        // Se ainda não encontrar, tentar qualquer app-container
        if (!dashboardContainer) {
            dashboardContainer = document.querySelector('.app-container');
        }
        
        console.log('Tentando mostrar dashboard-container:', !!dashboardContainer);
        if (dashboardContainer) {
            // Remover display: none inline e forçar block
            dashboardContainer.removeAttribute('style');
            dashboardContainer.style.display = 'block';
            dashboardContainer.style.visibility = 'visible';
            dashboardContainer.style.opacity = '1';
            console.log('dashboard-container display alterado para block');
        } else {
            console.error('dashboard-container não encontrado! Verificando DOM...');
            const spaContainer = document.getElementById('spa-container');
            if (spaContainer) {
                console.log('spa-container existe, conteúdo:', spaContainer.innerHTML.substring(0, 500));
            } else {
                console.error('spa-container também não existe!');
            }
        }
        
        // Carregar dados do dashboard
        const apiUrl = `${window.BASE_APP_URL}/api/get_dashboard_data.php`;
        console.log('[main_app_logic] Carregando dados do dashboard...');
        console.log('[main_app_logic] BASE_APP_URL:', window.BASE_APP_URL);
        console.log('[main_app_logic] URL da API:', apiUrl);
        
        const response = await authenticatedFetch(apiUrl);
        console.log('[main_app_logic] Resposta recebida:', response);
        console.log('[main_app_logic] Response ok:', response?.ok);
        console.log('[main_app_logic] Response status:', response?.status);
        
        if (!response || !response.ok) {
            console.error('[main_app_logic] Erro ao carregar dados do dashboard - response:', response);
            if (response) {
                const errorText = await response.text();
                console.error('[main_app_logic] Erro da API:', errorText);
            }
            return;
        }
        
        const result = await response.json();
        console.log('Resultado da API get_dashboard_data:', result);
        
        if (!result.success) {
            console.error('Erro na API:', result.message);
            return;
        }
        
        const data = result.data;
        console.log('Dados recebidos:', data);
        console.log('Estrutura dos dados:', {
            hasRanking: !!data.ranking,
            hasUserPoints: 'user_points' in data,
            hasUser: !!data.user,
            keys: Object.keys(data)
        });
        
        // Renderizar ranking
        console.log('Renderizando ranking...', data.ranking);
        if (data.ranking) {
            const rankingCard = document.getElementById('ranking-card');
            console.log('ranking-card encontrado:', !!rankingCard);
            if (rankingCard) {
                rankingCard.style.display = 'block';
                console.log('ranking-card display alterado para block');
            }
            
            // Atualizar dados do ranking
            if (data.ranking.my_rank !== undefined) {
                const myRankEl = document.getElementById('my-rank');
                console.log('my-rank encontrado:', !!myRankEl, 'valor:', data.ranking.my_rank);
                if (myRankEl) {
                    myRankEl.textContent = data.ranking.my_rank;
                    console.log('my-rank atualizado');
                }
            }
            
            if (data.ranking.opponent) {
                console.log('Opponent data:', data.ranking.opponent);
                const opponentNameEl = document.getElementById('opponent-name');
                console.log('opponent-name encontrado:', !!opponentNameEl);
                if (opponentNameEl) {
                    opponentNameEl.textContent = data.ranking.opponent.name;
                    console.log('opponent-name atualizado para:', data.ranking.opponent.name);
                }
                
                const opponentInfoEl = document.getElementById('opponent-info');
                if (opponentInfoEl && data.ranking.opponent.profile_image_filename) {
                    const avatar = opponentInfoEl.querySelector('.player-avatar');
                    console.log('avatar encontrado:', !!avatar);
                    if (avatar) {
                        const imgUrl = `${window.BASE_APP_URL}/assets/images/users/${data.ranking.opponent.profile_image_filename}`;
                        avatar.innerHTML = `<img src="${imgUrl}" alt="${data.ranking.opponent.name}">`;
                        console.log('avatar atualizado com:', imgUrl);
                    }
                }
            }
            
            if (data.ranking.progress_percentage !== undefined) {
                const progressBar = document.getElementById('ranking-progress-bar');
                console.log('ranking-progress-bar encontrado:', !!progressBar, 'porcentagem:', data.ranking.progress_percentage);
                if (progressBar) {
                    progressBar.style.width = `${data.ranking.progress_percentage}%`;
                    console.log('ranking-progress-bar atualizado');
                }
            }
        } else {
            console.warn('data.ranking não existe ou está vazio');
        }
        
        // Atualizar pontos do usuário
        // Pode estar em data.user_points, data.user.points, ou data.points
        let userPoints = data.user_points || data.user?.points || data.points || data.user?.total_points;
        console.log('Atualizando pontos do usuário...', userPoints);
        if (userPoints !== undefined && userPoints !== null) {
            const pointsDisplay = document.getElementById('user-points-display');
            console.log('user-points-display encontrado:', !!pointsDisplay);
            if (pointsDisplay) {
                pointsDisplay.textContent = userPoints;
                console.log('user-points-display atualizado para:', userPoints);
            }
        } else {
            console.warn('Pontos do usuário não encontrados nos dados. Estrutura:', {
                user_points: data.user_points,
                'user.points': data.user?.points,
                points: data.points,
                'user.total_points': data.user?.total_points
            });
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

// Verificar se o script foi carregado
console.log('[main_app_logic] Script carregado!');

// Listener para evento SPA
window.addEventListener('spa:enter-main_app', async function(e) {
    console.log('[main_app_logic] Evento spa:enter-main_app disparado!', e.detail);
    
    // Aguardar um pouco para garantir que o HTML foi inserido no DOM
    setTimeout(async () => {
        // Verificar se o container existe
        const dashboardContainer = document.getElementById('dashboard-container');
        console.log('[main_app_logic] Dashboard container encontrado:', !!dashboardContainer);
        
        if (!dashboardContainer) {
            console.error('[main_app_logic] dashboard-container não encontrado no DOM!');
            // Tentar encontrar no spa-container
            const spaContainer = document.getElementById('spa-container');
            if (spaContainer) {
                console.log('[main_app_logic] spa-container encontrado, conteúdo:', spaContainer.innerHTML.substring(0, 200));
                // Tentar encontrar dentro do spa-container
                const containerInside = spaContainer.querySelector('#dashboard-container');
                if (containerInside) {
                    console.log('[main_app_logic] dashboard-container encontrado dentro do spa-container!');
                    await loadMainAppData();
                } else {
                    console.error('[main_app_logic] dashboard-container não encontrado nem dentro do spa-container!');
                }
            } else {
                console.error('[main_app_logic] spa-container também não existe!');
            }
            return;
        }
        
        console.log('[main_app_logic] Chamando loadMainAppData()...');
        await loadMainAppData();
    }, 200); // Aumentar timeout para 200ms
});

// Também escutar routeChanged como fallback
window.addEventListener('routeChanged', async function(e) {
    if (e.detail?.pageName === 'main_app') {
        console.log('[main_app_logic] routeChanged detectado para main_app!', e.detail);
        setTimeout(async () => {
            await loadMainAppData();
        }, 200);
    }
});

