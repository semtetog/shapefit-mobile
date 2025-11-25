// Scripts inline extraídos de main_app.html
// Gerado automaticamente - não editar manualmente

// Script inline 1


// Script inline 2
function setRealViewportHeight() { 
            const vh = window.innerHeight * 0.01; 
            document.documentElement.style.setProperty('--vh', `${vh}px`); 
        }
        setRealViewportHeight();
        window.addEventListener('resize', setRealViewportHeight);
        window.addEventListener('orientationchange', function() {
            setTimeout(setRealViewportHeight, 100);
        });
        
        if (window.visualViewport) {
            const updateKeyboardOffset = () => {
                const viewportHeight = window.visualViewport.height;
                const offset = Math.max(0, window.innerHeight - viewportHeight);
                document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`);
            };
            
            window.visualViewport.addEventListener('resize', updateKeyboardOffset);
            window.visualViewport.addEventListener('scroll', updateKeyboardOffset);
            window.addEventListener('orientationchange', updateKeyboardOffset);
            updateKeyboardOffset();
        }
        
        document.addEventListener('touchmove', function(event) {
            const checkinModal = document.getElementById('checkinModal');
            const isModalOpen = checkinModal && checkinModal.classList.contains('active');
            
            if (isModalOpen) {
                const insideMessages = event.target.closest('#checkinMessages');
                if (insideMessages) {
                    // Permitir scroll dentro do chat
                    return;
                }
                
                const insideModal = event.target.closest('#checkinModal');
                if (insideModal) {
                    // Dentro do modal mas fora das mensagens -> bloquear
                    event.preventDefault();
                    return;
                }
            }
            
            const scrollable = event.target.closest('.app-container, .container');
            if (!scrollable) {
                event.preventDefault();
            }
        }, { passive: false });

// Script inline 3


// Script inline 4
// BASE_APP_URL já foi definido pelo www-config.js
        // Se não foi definido (fallback), usar URL local
        if (!window.BASE_APP_URL) {
            window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
            if (window.BASE_APP_URL.endsWith('/')) {
                window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
            }
        }

// Script inline 5


// Script inline 6


// Script inline 7


