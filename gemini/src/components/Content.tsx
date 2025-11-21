import React, { useEffect, useState } from 'react';

// Assume Font Awesome CSS is imported globally or via a CDN in the main index.html
// e.g., <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

// Mock data and API functions for demonstration, as actual API calls are complex
// and involve external scripts/configs that are not part of the component itself.

// Dummy authenticated fetch
const authenticatedFetch = async (url: string) => {
  // In a real app, this would involve tokens, error handling, etc.
  // For this conversion, we'll mock a successful response or throw an error.
  console.log(`[Mock Fetch] Fetching from: ${url}`);
  return new Promise<Response>((resolve, reject) => {
    setTimeout(() => {
      if (url.includes('get_content_data.php')) {
        // Mock successful response with some content
        resolve(new Response(JSON.stringify({
          success: true,
          data: {
            contents: [
              {
                id: '1',
                title: 'Receita Fit de Salmão com Brócolis',
                description: 'Uma deliciosa e saudável receita para o seu almoço ou jantar, rica em ômega 3.',
                content_type: 'chef',
                thumbnail_url: 'https://placehold.co/600x400?text=Salmao',
                author_name: 'Chef Ana Silva',
                author_avatar_url: 'https://placehold.co/40x40?text=AS',
                date: '2023-10-26'
              },
              {
                id: '2',
                title: 'Guia Completo de Suplementos para Ganho de Massa',
                description: 'Descubra os melhores suplementos para otimizar seus resultados na academia.',
                content_type: 'supplements',
                thumbnail_url: 'https://placehold.co/600x400?text=Suplementos',
                author_name: 'Dr. João Mendes',
                author_avatar_url: '', // Placeholder for no avatar
                date: '2023-09-15'
              },
              {
                id: '3',
                title: 'Treino HIIT para Queima Rápida de Gordura',
                description: 'Sessão intensa de treino intervalado de alta intensidade para acelerar seu metabolismo.',
                content_type: 'videos',
                thumbnail_url: 'https://placehold.co/600x400?text=HIIT',
                author_name: 'Personal Trainer Carlos',
                author_avatar_url: 'https://placehold.co/40x40?text=PTC',
                date: '2023-08-01'
              }
            ]
          }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      } else {
        reject(new Error('URL de mock não reconhecida.'));
      }
    }, 500);
  });
};

// Dummy isAuthenticated function
const isAuthenticated = () => {
  // In a real app, this would check localStorage for a token or similar.
  // For this conversion, let's assume true.
  return true;
};

export const Content = ({ setView }: { setView: (view: string) => void }) => {
  const [contents, setContents] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Critical Script: setRealViewportHeight
  useEffect(() => {
    const setRealViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setRealViewportHeight();
    window.addEventListener('resize', setRealViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setRealViewportHeight, 100);
    });

    return () => {
      window.removeEventListener('resize', setRealViewportHeight);
      window.removeEventListener('orientationchange', setRealViewportHeight);
    };
  }, []);

  // Content Icons and Labels - Kept for reference but not used in the current static mock rendering
  const contentIcons: { [key: string]: string } = {
    'chef': 'fas fa-utensils',
    'supplements': 'fas fa-pills',
    'videos': 'fas fa-play',
    'articles': 'fas fa-file-alt',
    'pdf': 'fas fa-file-pdf'
  };

  const contentLabels: { [key: string]: string } = {
    'chef': 'Receitas',
    'supplements': 'Suplementos',
    'videos': 'Vídeos',
    'articles': 'Artigos',
    'pdf': 'PDFs'
  };

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      setView("Login"); // Redirect to login page as per original HTML logic
      return;
    }

    const loadContents = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming window.BASE_APP_URL is available or defined globally in the React environment
        // TODO: Replace with actual environment variable or context for BASE_APP_URL
        const baseUrl = (window as any).BASE_APP_URL || 'http://localhost:3000'; // Fallback for local dev
        const response = await authenticatedFetch(`${baseUrl}/api/get_content_data.php`);

        if (!response.ok) {
          const text = await response.text();
          console.error('HTTP Error:', response.status, text.substring(0, 500));
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Response is not JSON:', text.substring(0, 500));
          throw new Error('Server response is not JSON');
        }

        const result = await response.json();

        if (!result.success) {
          if (result.message && result.message.includes('Onboarding')) {
            setView("Onboarding"); // Redirect to onboarding as per original HTML logic
            return;
          }
          throw new Error(result.message || 'Error loading contents');
        }

        console.log('[Content] Data received from API:', result.data.contents);
        setContents(result.data.contents);

      } catch (e: any) {
        console.error('Error loading contents:', e);
        setError(e.message || 'Failed to load content.');
        setContents([]); // Show empty state if error occurs or no content
      } finally {
        setLoading(false);
      }
    };

    loadContents();
  }, [setView]);

  const renderContentCard = (content: any) => (
    <div
      key={content.id}
      onClick={() => setView("ViewContent")} // Rule 3: Use onClick instead of href. Generic 'ViewContent' page.
      className="content-card p-5 bg-white/[0.03] border border-white/[0.12] rounded-2xl transition-all duration-300 ease-in-out flex flex-col gap-4 cursor-pointer hover:bg-white/[0.06] hover:border-orange-500 hover:-translate-y-0.5"
    >
      <div className="content-card-header flex items-start gap-4 min-w-0">
        <div className="content-thumbnail relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={content.thumbnail_url || 'https://placehold.co/600x400?text=Imagem'}
            alt={content.title}
            className="w-full h-full object-cover rounded-lg"
          />
          {/* Replicating ::after with an overlay div for gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.1] pointer-events-none" />
        </div>
        <div className="content-info flex-1 min-w-0">
          <h3 className="m-0 mb-2 text-xl sm:text-lg font-semibold text-white leading-tight overflow-hidden text-ellipsis whitespace-normal break-words hyphens-auto">
            {content.title}
          </h3>
          <p className="content-description m-0 text-sm text-gray-400 leading-relaxed">
            {content.description}
          </p>
        </div>
      </div>
      <div className="content-meta flex items-center justify-between gap-3 flex-wrap pt-3 border-t border-white/[0.05] text-sm text-gray-400">
        <div className="content-author flex items-center gap-2">
          {content.author_avatar_url ? (
            <img
              src={content.author_avatar_url}
              alt={content.author_name}
              className="author-avatar w-9 h-9 rounded-full object-cover border-2 border-orange-500/[0.3] flex-shrink-0"
            />
          ) : (
            <div className="author-avatar-placeholder w-9 h-9 rounded-full bg-orange-500/[0.2] border-2 border-orange-500/[0.3] flex items-center justify-center text-xs font-semibold text-orange-500 flex-shrink-0">
              {content.author_name ? content.author_name.split(' ').map((n: string) => n[0]).join('') : 'UN'}
            </div>
          )}
          <span className="author-name font-medium text-white">{content.author_name || 'Desconhecido'}</span>
        </div>
        <div className="content-date flex items-center gap-1.5 text-gray-400">
          <i className="fas fa-calendar-alt text-xs" />
          <span>{content.date || 'Data Indisponível'}</span>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="empty-state text-center p-5 sm:p-10 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="empty-state-icon w-32 h-32 mx-auto mb-6 rounded-full bg-orange-500/[0.1] flex items-center justify-center relative">
        <i className="fas fa-box-open text-5xl text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none" />
      </div>
      <h3 className="text-2xl font-semibold text-white m-0 mb-3">
        Nenhum conteúdo encontrado
      </h3>
      <p className="text-base text-gray-400 m-0 leading-relaxed">
        Parece que ainda não há conteúdos disponíveis nesta seção. Volte mais tarde!
      </p>
    </div>
  );

  // Base container for the whole component
  // Assumes global styles for body/html/font-montserrat and background color are set.
  return (
    <div className="app-container max-w-xl mx-auto h-screen overflow-y-auto p-4 sm:p-6 bg-gray-900 text-white font-montserrat custom-scrollbar">
      {/* iOS PWA Fixes - The original CSS fix for iOS PWA is mostly about `body` and `html` height.
          In a React component, `h-screen` on the outermost div is usually sufficient,
          and global CSS will handle `body`/`html` to ensure full coverage.
          No specific in-component logic needed for this complex CSS hack; assumed handled by environment.
      */}
      <div className="page-header flex items-center mb-6 gap-4 justify-start">
        <button
          onClick={() => setView("MainApp")} // Rule 3: onClick for navigation (original: main_app.html)
          className="back-button flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white transition-all duration-300 ease-in-out flex-shrink-0 hover:bg-white/[0.1] hover:border-orange-500 hover:-translate-x-0.5"
          aria-label="Voltar"
        >
          <i className="fas fa-arrow-left" />
        </button>
        <h1 className="page-title text-3xl font-bold text-white m-0 flex items-center gap-3">
          Conteúdos
        </h1>
      </div>

      <div id="content-container">
        {loading ? (
          <div className="text-center text-gray-400">Carregando conteúdos...</div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">Erro ao carregar conteúdos: {error}</p>
            {renderEmptyState()} {/* Show empty state visuals even on error */}
          </div>
        ) : (contents && contents.length > 0) ? (
          <div className="content-grid grid grid-cols-1 gap-4 mb-6">
            {contents.map(renderContentCard)}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
}