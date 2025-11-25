// Scripts inline extraídos de content.html
// Gerado automaticamente - não editar manualmente

// Script inline 1
function setRealViewportHeight() { 
            const vh = window.innerHeight * 0.01; 
            document.documentElement.style.setProperty('--vh', `${vh}px`); 
        }
        setRealViewportHeight();
        window.addEventListener('resize', setRealViewportHeight);
        window.addEventListener('orientationchange', function() {
            setTimeout(setRealViewportHeight, 100);
        });

// Script inline 2


// Script inline 3
// BASE_APP_URL já foi definido pelo www-config.js
        // Se não foi definido (fallback), usar URL local
        if (!window.BASE_APP_URL) {
            // BASE_APP_URL já foi definido pelo www-config.js
            if (!window.BASE_APP_URL) { window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/'); } if (window.BASE_APP_URL && window.BASE_APP_URL.endsWith('/')) {
                window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
            }
        }
        console.log('[content] BASE_APP_URL:', window.BASE_APP_URL);

// Script inline 4


// Script inline 5


// Script inline 6


// Script inline 7


// Script inline 8


// Script inline 9
// Verificar autenticação
        if (!isAuthenticated()) {
            window.location.href = './auth/login.html';
        }
        
        const contentContainer = document.getElementById('content-container');
        
        // Ícones e labels por tipo
        const contentIcons = {
            'chef': 'fas fa-utensils',
            'supplements': 'fas fa-pills',
            'videos': 'fas fa-play',
            'articles': 'fas fa-file-alt',
            'pdf': 'fas fa-file-pdf'
        };
        
        const contentLabels = {
            'chef': 'Receitas',
            'supplements': 'Suplementos',
            'videos': 'Vídeos',
            'articles': 'Artigos',
            'pdf': 'PDFs'
        };
        
        // Carregar conteúdos
        async function loadContents() {
            try {
                const response = await authenticatedFetch(`${window.BASE_APP_URL}/api/get_content_data.php`);
                
                if (!response.ok) {
                    const text = await response.text();
                    console.error('Erro HTTP:', response.status, text.substring(0, 500));
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                
                // Verificar se a resposta é JSON
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Resposta não é JSON:', text.substring(0, 500));
                    throw new Error('Resposta do servidor não é JSON');
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    if (result.message && result.message.includes('Onboarding')) {
                        window.location.href = './onboarding/onboarding.html';
                        return;
                    }
                    throw new Error(result.message || 'Erro ao carregar conteúdos');
                }
                
                // Log para debug
                console.log('[Content] Dados recebidos da API:', result.data.contents);
                if (result.data.contents && result.data.contents.length > 0) {
                    result.data.contents.forEach((content, index) => {
                        console.log(`[Content] Conteúdo ${index + 1}:`, {
                            id: content.id,
                            title: content.title,
                            content_type: content.content_type,
                            thumbnail_url: content.thumbnail_url
                        });
                    });
                }
                
                renderContents(result.data.contents);
                
            } catch (error) {
                console.error('Erro ao carregar conteúdos:', error);
                // Se o erro for de parsing JSON, tentar ler como texto
                if (error.message && error.message.includes('JSON')) {
                    try {
                        const response = await authenticatedFetch(`${window.BASE_APP_URL}/api/get_content_data.php`);
                        const text = await response.text();
                        console.error('Resposta do servidor (texto):', text.substring(0, 1000));
                    } catch (e) {
                        console.error('Erro ao ler resposta:', e);
                    }
                }
                renderEmptyState();
            }
        }
        
        function renderContents(contents) {
            if (!contents || contents.length === 0) {
                renderEmptyState();
                return;
            }
            
            const grid = document.createElement('div');
            grid.className = 'content-grid';
            
            contents.forEach(content => {
                const card = createContentCard(content);
                grid.appendChild(card);
            });
            
            contentContainer.innerHTML = '';
            contentContainer.appendChild(grid);
        }
        
        function createContentCard(content) {
            const card = document.createElement('a');
            card.href = `./view_content.html?id=${content.id}`;
            card.className = 'content-card';
            
            let thumbnailHTML = '';
            
            // Thumbnail para vídeos
            if (content.thumbnail_url && content.content_type === 'videos') {
                let thumbnailUrl = content.thumbnail_url;
                // Construir URL da mesma forma que o arquivo da raiz
                if (!thumbnailUrl.match(/^https?:\/\//)) {
                    if (thumbnailUrl.startsWith('/')) {
                        // URL relativa começando com / - usar BASE_APP_URL
                        thumbnailUrl = window.BASE_APP_URL + thumbnailUrl;
                    } else {
                        // URL relativa sem / - adicionar / e usar BASE_APP_URL
                        thumbnailUrl = window.BASE_APP_URL + '/' + thumbnailUrl.replace(/^\//, '');
                }
                }
                
                console.log('[Content] Thumbnail URL:', thumbnailUrl);
                
                thumbnailHTML = `
                    <div class="content-thumbnail" style="width: 100%; height: 200px; border-radius: 12px; overflow: hidden; margin-bottom: 16px; background: rgba(0, 0, 0, 0.2); position: relative; pointer-events: none;">
                        <img src="${escapeHtml(thumbnailUrl)}" 
                             alt="${escapeHtml(content.title)}" 
                             style="width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none;"
                             onerror="this.style.display='none';">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0, 0, 0, 0.6); border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; pointer-events: none;">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                `;
            } else if (content.content_type === 'pdf') {
                // Preview de PDF
                thumbnailHTML = `
                    <div class="content-thumbnail" style="width: 100%; height: 200px; border-radius: 12px; overflow: hidden; margin-bottom: 16px; background: rgba(255, 107, 0, 0.1); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-file-pdf" style="font-size: 4rem; color: var(--accent-orange);"></i>
                    </div>
                `;
            }
            
            // Autor
            let authorHTML = '';
            if (content.author_name) {
                let authorPhotoHTML = '';
                if (content.author_image_url) {
                    authorPhotoHTML = `<img src="${escapeHtml(content.author_image_url)}" alt="${escapeHtml(content.author_name)}" class="author-avatar" onerror="this.parentElement.innerHTML='<div class=\\'author-avatar-placeholder\\'>${getInitials(content.author_name)}</div>';">`;
                } else {
                    authorPhotoHTML = `<div class="author-avatar-placeholder">${getInitials(content.author_name)}</div>`;
                }
                
                authorHTML = `
                    <div class="content-author">
                        ${authorPhotoHTML}
                        <span class="author-name">${escapeHtml(content.author_name)}</span>
                    </div>
                `;
            }
            
            // Data
            const date = content.created_at ? new Date(content.created_at) : null;
            const dateStr = date ? date.toLocaleDateString('pt-BR') : '';
            
            card.innerHTML = `
                ${thumbnailHTML}
                <div class="content-card-header">
                    <div class="content-info">
                        <h3>${escapeHtml(content.title)}</h3>
                        ${content.description ? `<p class="content-description">${escapeHtml(content.description)}</p>` : ''}
                    </div>
                </div>
                <div class="content-meta">
                    ${authorHTML}
                    ${dateStr ? `
                        <div class="content-date">
                            <i class="fas fa-calendar"></i>
                            <span>${dateStr}</span>
                        </div>
                    ` : ''}
                </div>
            `;
            
            return card;
        }
        
        function getInitials(name) {
            if (!name) return '??';
            const parts = name.trim().split(' ');
            if (parts.length > 1) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return parts[0].substring(0, 2).toUpperCase();
        }
        
        function renderEmptyState() {
            contentContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3>Nenhum conteúdo disponível</h3>
                    <p>Nenhum conteúdo disponível no momento. Volte mais tarde!</p>
                </div>
            `;
        }
        
        // Função para inicializar a página
        function initializePage() {
            loadContents();
        }
        
        // Re-executar quando carregado via SPA
        window.addEventListener('spa-page-loaded', function(e) {
            if (e.detail && e.detail.isSPANavigation) {
                const pageName = window.location.pathname.split('/').pop();
                if (pageName === 'content.html') {
                    setTimeout(() => {
                        initializePage();
                    }, 100);
                }
            }
        });
        
        // Carregar dados ao iniciar
        document.addEventListener('DOMContentLoaded', function() {
            initializePage();
        });

