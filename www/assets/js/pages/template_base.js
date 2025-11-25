// Scripts inline extraídos de template_base.html
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
        
        document.addEventListener('touchmove', function(event) {
            const scrollable = event.target.closest('.app-container, .container');
            if (!scrollable) {
                event.preventDefault();
            }
        }, { passive: false });
        
        (function preventIOSScroll() {
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('focusin', () => { 
                    setTimeout(() => { window.scrollTo(0, 0); }, 0); 
                });
                input.addEventListener('blur', () => { 
                    window.scrollTo(0, 0); 
                });
            });
        })();

// Script inline 3
(function detectAndroid() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                    const isAndroid = /android/i.test(userAgent);
                    if (isAndroid) {
                        document.body.classList.add('android-mobile');
                    }
                });
            } else {
                const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                const isAndroid = /android/i.test(userAgent);
                if (isAndroid) {
                    document.body.classList.add('android-mobile');
                }
            }
        })();

// Script inline 4
if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registrado:', registration.scope);
                })
                .catch(function(error) {
                    console.log('Falha no registro do ServiceWorker:', error);
                });
        });
    }

// Script inline 5
// BASE_APP_URL será definido dinamicamente baseado na localização atual
        window.BASE_APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        if (window.BASE_APP_URL.endsWith('/')) {
            window.BASE_APP_URL = window.BASE_APP_URL.slice(0, -1);
        }

// Script inline 6


// Script inline 7
document.addEventListener('DOMContentLoaded', function() {
            document.addEventListener('contextmenu', function(e) {
                const target = e.target.closest('a, button, .btn, [role="button"]');
                if (target) {
                    e.preventDefault();
                }
            });
            
            document.addEventListener('selectstart', function(e) {
                const target = e.target.closest('a, button, .btn, [role="button"]');
                if (target) {
                    e.preventDefault();
                }
            });
            
            document.addEventListener('dragstart', function(e) {
                e.preventDefault();
            });
        });

