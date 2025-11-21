import React from 'react';

// NOTA: O nome do componente "Sw.js" fornecido na instrução é sintaticamente inválido em TypeScript/JavaScript.
// Foi corrigido para "Swjs" para gerar um código TSX válido.

// O input fornecido foi código JavaScript para um Service Worker, não HTML.
// Service Workers operam em um contexto separado do navegador e não podem ser diretamente
// convertidos em um componente React de interface do usuário, nem sua lógica executada
// dentro do `useEffect` de um componente React para seu propósito original.
// Este código (o Service Worker em si) é tipicamente salvo como um arquivo separado (ex: `public/sw.js`)
// e registrado a partir do entry point da aplicação React (ex: `index.tsx`).

// Conforme a Regra 6 (extrair lógica de <script> complexo ou deixar comentado com TODO),
// toda a lógica do Service Worker é mantida comentada aqui, pois não é destinada à execução
// direta no ciclo de vida de um componente React.

export const Swjs = ({ setView }: { setView: (view: string) => void }) => {
  /*
  // Conteúdo original do Service Worker (comentado porque não é HTML nem para execução direta em React UI)
  const CACHE_NAME = 'shapefit-v7'; // Versão do cache atualizada para forçar a atualização
  const urlsToCache = [
    '/assets/css/style.css',
    '/assets/js/script.js',
    '/assets/js/banner-carousel.js',
    '/assets/images/icon-192x192.png',
    '/assets/images/icon-512x512.png'
  ];

  // Install event - cache resources
  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Cache aberto');
          return cache.addAll(urlsToCache);
        })
    );
    // Força ativação imediata do novo service worker
    self.skipWaiting();
  });

  // Fetch event - network first para HTML, cache first para assets
  self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    const isHTML = event.request.headers.get('accept')?.includes('text/html') || 
                   url.pathname.endsWith('.html') || 
                   url.pathname.endsWith('/') ||
                   url.pathname.endsWith('.php');
    
    if (isHTML) {
      // Para HTML: SEMPRE buscar do network, NUNCA do cache
      event.respondWith(
        fetch(event.request, { cache: 'no-store' })
          .then(response => {
            // Retorna resposta do network sem cachear
            return response;
          })
          .catch(() => {
            // Se falhar completamente, retorna erro
            return new Response('Erro ao carregar página. Verifique sua conexão.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          })
      );
    } else {
      // Para assets: cache first, depois network
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            return response || fetch(event.request);
          })
      );
    }
  });

  // Activate event - clean up old caches
  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deletando cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
    // Força controle imediato de todas as páginas
    return self.clients.claim();
  });
  */

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Componente Swjs (Service Worker Placeholder)
      </h1>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        O conteúdo fornecido era código JavaScript para um Service Worker, não HTML.
        Service Workers operam em um contexto separado do navegador e não podem ser
        diretamente convertidos em um componente React de interface do usuário.
        Este componente serve como um placeholder e demonstra a estrutura esperada.
      </p>
      <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
        Para usar o Service Worker, o código original deve ser salvo como 'sw.js'
        (por exemplo, na pasta `public/`) e registrado em seu arquivo `index.tsx`
        ou `App.tsx` usando `navigator.serviceWorker.register('/sw.js')`.
      </p>
      <button
        onClick={() => setView("Home")} // Exemplo de uso da prop setView
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
      >
        Voltar para a Página Inicial
      </button>
    </div>
  );
};