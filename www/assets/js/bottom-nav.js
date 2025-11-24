// Bottom Nav - Versão Fixa para SPA
(function() {
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'bottom-nav';
    bottomNav.innerHTML = `
        <nav class="bottom-nav">
            <a href="./main_app.html" class="nav-item">
                <i class="fas fa-home"></i>
                <span>Home</span>
            </a>
            <a href="./progress.html" class="nav-item">
                <i class="fas fa-chart-line"></i>
                <span>Progresso</span>
            </a>
            <a href="./diary.html" class="nav-item">
                <i class="fas fa-book"></i>
                <span>Diário</span>
            </a>
            <a href="./explore_recipes.html" class="nav-item">
                <i class="fas fa-utensils"></i>
                <span>Receitas</span>
            </a>
            <a href="./more_options.html" class="nav-item">
                <i class="fas fa-cog"></i>
                <span>Mais</span>
            </a>
        </nav>
    `;
    
    document.body.appendChild(bottomNav);
    
    // Atualizar active quando SPA carrega página
    window.addEventListener('spa:page-loaded', (e) => {
        const url = e.detail.url;
        bottomNav.querySelectorAll('a').forEach(a => {
            a.classList.toggle('active', url.includes(a.href));
        });
    });
})();
