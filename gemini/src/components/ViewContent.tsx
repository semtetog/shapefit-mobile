import React, { useState, useEffect } from 'react';

interface ViewContentProps {
  setView: (view: string) => void;
}

// Mocking authentication and fetch utilities. In a real app, these would be imported or provided via context.
const isAuthenticated = (): boolean => {
  // TODO: Implement actual authentication check (e.g., check token in localStorage)
  return true;
};

const authenticatedFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  // TODO: Implement actual authenticated fetch logic (e.g., attach auth token to headers)
  console.log(`[ViewContent] authenticatedFetch: ${url}`);
  return fetch(url, options);
};

export const ViewContent = ({ setView }: ViewContentProps) => {
  const [contentData, setContentData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string>('Carregando...');

  // TODO: `BASE_APP_URL` should ideally come from an environment variable (e.g., process.env.REACT_APP_API_URL)
  const getBaseAppUrl = (): string => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/');
    // Remove the current file name (e.g., 'view_content.html') to get the base directory.
    // If the path ends with a slash (e.g., /app/), join all segments.
    // If it's a file (e.g., /app/index.html), remove the last segment.
    const baseDir = pathSegments.pop()?.includes('.') ? pathSegments.join('/') : pathSegments.join('/') + (pathSegments.length > 1 ? '/' : '');
    let url = window.location.origin + baseDir;
    if (url.endsWith('/')) { // Ensure no trailing slash if not the root
      url = url.slice(0, -1);
    }
    return url;
  };
  
  const BASE_APP_URL = getBaseAppUrl();
  

  useEffect(() => {
    if (!isAuthenticated()) {
      setView('AuthLogin'); // Redirect to login page
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const contentId = parseInt(urlParams.get('id') || '0');

    if (contentId <= 0) {
      setView('ContentList'); // Redirect to content list if no valid ID
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        setPageTitle('Carregando...');

        const apiUrl = `${BASE_APP_URL}/api/get_view_content_data.php?id=${contentId}`;
        console.log('Carregando conteúdo de:', apiUrl);

        const response = await authenticatedFetch(apiUrl);

        if (!response.ok) {
          const text = await response.text();
          console.error('Erro HTTP:', response.status);
          console.error('Resposta do servidor:', text.substring(0, 1000));
          throw new Error(`Erro HTTP: ${response.status} - ${text.substring(0, 100)}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Resposta não é JSON:', text.substring(0, 500));
          throw new Error('Resposta do servidor não é JSON');
        }

        const result = await response.json();

        if (!result.success) {
          if (result.message && result.message.includes('Onboarding')) {
            setView('Onboarding'); // Redirect to onboarding
            return;
          }
          if (result.message && result.message.includes('não encontrado')) {
            setView('ContentList'); // Redirect to content list
            return;
          }
          throw new Error(result.message || 'Erro ao carregar conteúdo');
        }

        setContentData(result.data);
        setPageTitle(result.data.content?.title || 'Conteúdo');

      } catch (err: any) {
        console.error('Erro ao carregar conteúdo:', err);
        setError(err.message || 'Falha ao carregar conteúdo.');
        setPageTitle('Erro');
      } finally {
        setLoading(false);
      }
    };

    loadContent();

  }, [setView, BASE_APP_URL]);

  return (
    <div className="max-w-[900px] mx-auto h-screen overflow-y-auto relative px-4 pb-20 scrollbar-hide">
      {/* Using arbitrary values for colors like textPrimary, accentOrange, glassBorder assumes Tailwind config setup, 
          or fallbacks to default Tailwind colors. For `white/5` etc. Tailwind's JIT handles this. */}
      <div className="flex items-center mb-6 gap-4 justify-start pt-6">
        <button
          onClick={() => setView('ContentList')}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white transition-all duration-300 flex-shrink-0 hover:bg-white/[0.1] hover:border-[#FF6B00] hover:text-[#FF6B00] hover:translate-x-[-2px]"
          aria-label="Voltar"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-white m-0 flex-1 overflow-visible text-clip whitespace-normal break-words leading-[1.3] min-w-0 md:text-[clamp(1.1rem,4vw,1.5rem)]">
          {pageTitle}
        </h1>
      </div>

      {loading && (
        <div className="text-center py-10 text-white">
          <i className="fas fa-spinner fa-spin text-4xl text-[#FF6B00]"></i>
          <p className="mt-4">Carregando conteúdo...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-10 text-red-500">
          <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p>{error}</p>
          <button
            onClick={() => setView('ContentList')}
            className="mt-6 px-4 py-2 bg-[#FF6B00] text-white rounded-lg transition-colors hover:bg-orange-600"
          >
            Voltar para a lista
          </button>
        </div>
      )}

      {!loading && !error && contentData && (
        <div className="bg-white/[0.03] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 mb-6">
          {contentData.content?.title && (
            <h2 className="text-2xl font-bold text-white mb-4">
              {contentData.content.title}
            </h2>
          )}

          {contentData.content?.description && (
            <p className="text-base text-gray-400 leading-[1.6] mb-6 whitespace-pre-wrap">
              {contentData.content.description}
            </p>
          )}

          {contentData.content?.mediaType === 'image' && contentData.content?.mediaUrl && (
            <div className="w-full my-6 rounded-xl overflow-hidden">
              <img
                src={contentData.content.mediaUrl.startsWith('http') ? contentData.content.mediaUrl : 'https://placehold.co/600x400?text=Imagem'}
                alt={contentData.content.title || 'Conteúdo de imagem'}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {contentData.content?.mediaType === 'video' && contentData.content?.mediaUrl && (
            <div className="w-full my-6 rounded-xl overflow-hidden">
              <video
                controls
                src={contentData.content.mediaUrl.startsWith('http') ? contentData.content.mediaUrl : 'https://www.w3schools.com/html/mov_bbb.mp4'} /* Placeholder video */
                className="w-full aspect-video bg-black object-contain"
              >
                Seu navegador não suporta a tag de vídeo.
              </video>
            </div>
          )}

          {contentData.files && contentData.files.length > 0 && (
            <div className="file-container mt-8">
              {contentData.files.map((file: any, index: number) => (
                <button
                  key={index}
                  onClick={() => window.open(file.url.startsWith('http') ? file.url : 'https://example.com/sample.pdf', '_blank')} // Placeholder PDF URL
                  className="w-full aspect-video bg-white/[0.05] border border-[rgba(255,255,255,0.12)] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 text-white relative overflow-hidden
                             hover:bg-[#FF6B00]/[0.1] hover:border-[#FF6B00] hover:translate-y-[-2px] group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/[0.05] to-[#FF6B00]/[0.1] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <i className="fas fa-file-pdf text-6xl text-[#FF6B00] mb-4 relative z-10 transition-transform duration-300 group-hover:scale-110"></i>
                  <span className="text-base font-semibold text-white relative z-10 flex items-center gap-2">
                    {file.label || 'Abrir PDF'}
                    <i className="fas fa-external-link-alt text-sm"></i>
                  </span>
                  {/* TODO: Add logic for download status if needed */}
                  {/* <div className="flex items-center justify-center gap-2 mt-3 text-sm text-[#FF6B00]">
                    <i className="fas fa-spinner fa-spin"></i> Baixando...
                  </div> */}
                </button>
              ))}
            </div>
          )}

          {contentData.content?.meta && (
            <div className="flex items-center gap-4 flex-wrap pt-4 mt-6 border-t border-white/[0.05] text-sm text-gray-400">
              {Object.entries(contentData.content.meta).map(([key, value], index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <i className="fas fa-info-circle"></i>
                  <span>{key}: {String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && !contentData && (
        <div className="text-center py-10 px-5">
          <div className="w-[120px] h-[120px] mx-auto mb-6 rounded-full bg-[#FF6B00]/[0.1] flex items-center justify-center">
            <i className="fas fa-box-open text-5xl text-[#FF6B00]"></i>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Nenhum conteúdo encontrado</h3>
          <p className="text-base text-gray-400 leading-normal">Parece que o conteúdo que você procura não existe ou foi removido.</p>
          <button
            onClick={() => setView('ContentList')}
            className="mt-6 px-4 py-2 bg-[#FF6B00] text-white rounded-lg transition-colors hover:bg-orange-600"
          >
            Voltar para a lista
          </button>
        </div>
      )}
    </div>
  );
};
