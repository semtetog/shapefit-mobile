// icon-fallback.js - Fallback para ícones quando Font Awesome não carrega

(function() {
    'use strict';
    
    // Aguardar um pouco para verificar se Font Awesome carregou
    setTimeout(function() {
        checkFontAwesome();
    }, 2000);
    
    function checkFontAwesome() {
        // Verificar se Font Awesome está disponível
        const testIcon = document.createElement('i');
        testIcon.className = 'fa-solid fa-envelope';
        testIcon.style.position = 'absolute';
        testIcon.style.visibility = 'hidden';
        document.body.appendChild(testIcon);
        
        const computedStyle = window.getComputedStyle(testIcon, ':before');
        const fontFamily = computedStyle.getPropertyValue('font-family');
        
        // Se não tiver 'Font Awesome' na font-family, Font Awesome não carregou
        if (!fontFamily || !fontFamily.includes('Font Awesome')) {
            console.log('[Icon Fallback] Font Awesome não carregou, usando fallback SVG');
            replaceIconsWithSVG();
        }
        
        document.body.removeChild(testIcon);
    }
    
    function replaceIconsWithSVG() {
        // Mapeamento de classes Font Awesome para SVG
        const iconMap = {
            'fa-envelope': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" width="16" height="16"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>`,
            'fa-lock': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="16" height="16"><path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/></svg>`,
            'fa-user': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="16" height="16"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>`,
            'fa-eye': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" width="16" height="16"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.2-1.8-11.1-1.8-16.3 0c-6.4 2.1-13.2 3.3-20.3 3.3c-35.3 0-64-28.7-64-64s28.7-64 64-64c7.1 0 13.9 1.2 20.3 3.3c5.2 1.8 11.1 1.8 16.3 0c6.4-2.1 13.2-3.3 20.3-3.3c35.3 0 64 28.7 64 64z"/></svg>`,
            'fa-eye-slash': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" width="16" height="16"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18 6.6-28.3c0-35.3-28.7-64-64-64c-5.5 0-10.9 .7-16 2.1l7.4 58.3 49.1 38.4c17.1-12.5 38.5-20.8 61.5-20.8c53 0 96 43 96 96c0 23-8.3 44.4-22.1 61.3zM15.5 95.4c-4.5 7.6-4.2 17.4 .6 24.6c23.1 38.4 57.7 69.7 96 90.6c-12.4 28-36.6 66.8-70.9 100.9C-11.5 405.2-11.5 442.8 9.2 477.2c20.7 34.4 50.1 63.5 86.9 84.8c37 21.3 77.8 32.1 119.6 32.1c24 0 47.9-3.1 70.8-9.3l-72.5-56.9c-1.1 .1-2.1 .1-3.2 .1c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-19.4 22.3-41.5 41.2-63.4l-72-56.4c-17.4 15.7-33.3 33.2-47.1 52.1z"/></svg>`,
            'fa-wifi-slash': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" width="80" height="80"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c5.2-11.8 8-24.8 8-38.5c0-53-43-96-96-96c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1C211.6 187.5 216.4 177.7 223.1 149.5zM320 512c35.3 0 64-28.7 64-64s-28.7-64-64-64s-64 28.7-64 64s28.7 64 64 64zM125.7 220.9c-3.4-7.9-3.4-16.7 0-24.6c5.4-13.1 14.5-24 25.5-31.4l59.8 46.9c-6.2 10.8-10 23-10 36.1c0 4.3 .7 8.4 1.9 12.3L125.7 220.9z"/></svg>`
        };
        
        // Substituir todos os ícones
        document.querySelectorAll('i[class*="fa-"]').forEach(function(icon) {
            const classes = icon.className.split(' ');
            let iconName = null;
            
            // Encontrar a classe do ícone (fa-envelope, fa-lock, etc)
            for (let i = 0; i < classes.length; i++) {
                if (classes[i].startsWith('fa-') && classes[i] !== 'fa-solid' && classes[i] !== 'fa-regular' && classes[i] !== 'fa-brands') {
                    iconName = classes[i];
                    break;
                }
            }
            
            if (iconName && iconMap[iconName]) {
                // Criar elemento SVG
                const svgWrapper = document.createElement('span');
                svgWrapper.className = 'icon-svg-fallback';
                svgWrapper.innerHTML = iconMap[iconName];
                svgWrapper.style.display = 'inline-block';
                svgWrapper.style.width = '1em';
                svgWrapper.style.height = '1em';
                svgWrapper.style.color = 'inherit';
                svgWrapper.style.verticalAlign = 'middle';
                
                // Copiar estilos do ícone original
                const computedStyle = window.getComputedStyle(icon);
                svgWrapper.style.color = computedStyle.color;
                svgWrapper.style.fontSize = computedStyle.fontSize;
                
                // Substituir o ícone
                icon.parentNode.replaceChild(svgWrapper, icon);
            }
        });
    }
    
    // Também verificar quando a página carregar completamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(checkFontAwesome, 1000);
        });
    }
})();

