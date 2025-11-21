import React, { useEffect, useState, useRef } from 'react';

export const MeasurementsProgress = ({ setView }: { setView: (view: string) => void }) => {
  // Mimic setRealViewportHeight and touchmove scripts
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

    // TODO: The global touchmove prevention script for non-scrollable elements is complex to replicate
    // in a component-specific manner without affecting the entire application. Consider a global utility
    // or alternative CSS solutions if this behavior is critical for specific elements.
    // document.addEventListener('touchmove', function(event) {
    //     const scrollable = event.target.closest('.app-container, .container');
    //     if (!scrollable) {
    //         event.preventDefault();
    //     }
    // }, { passive: false });

    return () => {
      window.removeEventListener('resize', setRealViewportHeight);
      window.removeEventListener('orientationchange', setRealViewportHeight);
      // document.removeEventListener('touchmove', ...);
    };
  }, []);

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    setImage(null);
  };

  return (
    <div className="flex flex-col gap-5 p-[20px_8px_15px_8px]">
      <div className="flex items-center gap-3 mb-2 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] px-4">
        <button
          onClick={() => setView("Home")}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white transition-all duration-300 ease-in-out hover:bg-[rgba(255,255,255,0.12)] hover:-translate-x-0.5 focus:outline-none"
          aria-label="Voltar"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <h1 className="text-[1.9rem] font-bold text-white m-0">Fotos e Medidas</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 px-4">
        <div className="flex flex-col items-center justify-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-[20px_16px] text-center min-h-[120px] transition-all duration-300 ease-in-out hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5">
          <i className="fas fa-weight-hanging text-4xl mb-2 leading-none text-orange-500"></i>
          <h3 className="text-sm font-semibold text-white mb-2">Peso Atual</h3>
          <p className="text-lg font-bold text-white leading-tight">92.5 <span className="block text-xs font-normal text-gray-400 mt-0.5">kg</span></p>
        </div>
        <div className="flex flex-col items-center justify-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-[20px_16px] text-center min-h-[120px] transition-all duration-300 ease-in-out hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5">
          <i className="fas fa-ruler-combined text-4xl mb-2 leading-none text-orange-500"></i>
          <h3 className="text-sm font-semibold text-white mb-2">Ultima Atualização</h3>
          <p className="text-lg font-bold text-white leading-tight">2 semanas <span className="block text-xs font-normal text-gray-400 mt-0.5">atrás</span></p>
        </div>
        <p className="col-span-2 text-gray-400 text-xs text-center mt-1">Dados de 22/02/2024</p>
      </div>

      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 backdrop-blur-[10px] mx-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="fas fa-camera text-orange-500 mr-2"></i> Upload de Fotos
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[frontImage, sideImage, backImage].map((image, index) => {
              const label = ['Frente', 'Lado', 'Costas'][index];
              const setImage = [setFrontImage, setSideImage, setBackImage][index];
              return (
                <div
                  key={index}
                  className={`relative flex flex-col items-center justify-center bg-[rgba(255,255,255,0.05)] border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-xl p-[20px_12px] min-h-[120px] cursor-pointer transition-all duration-300 ease-in-out hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,107,0,0.5)] ${image ? 'border-solid border-[rgba(255,107,0,0.3)]' : ''}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                    onChange={(e) => handleImageUpload(e, setImage)}
                  />
                  {image ? (
                    <div className="w-full h-full flex flex-col items-center justify-center relative rounded-lg overflow-hidden">
                      <img src={image} alt={label} className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute top-2 right-2 text-white text-base bg-black/70 p-1 rounded-full backdrop-blur-sm">
                        <i className="fas fa-camera"></i>
                      </div>
                      <div className="absolute bottom-2 left-2 text-white text-sm font-medium bg-black/70 p-[4px_8px] rounded-md backdrop-blur-sm">
                        {label}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(setImage); }}
                        className="absolute bottom-2 right-2 w-9 h-9 bg-black/60 border-none rounded-full text-white/80 text-sm cursor-pointer transition-all duration-300 ease-in-out backdrop-blur-[10px] flex items-center justify-center shadow-md hover:bg-red-600 hover:text-white hover:scale-110"
                        aria-label={`Remover foto ${label}`}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center">
                      <i className="fas fa-plus-circle text-2xl text-gray-400 mb-2"></i>
                      <p className="text-sm font-semibold text-white mb-1">{`Adicionar Foto ${label}`}</p>
                      <p className="text-xs text-gray-400">Toque para enviar</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="fas fa-tape text-orange-500 mr-2"></i> Medidas Corporais
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="weight" className="text-sm font-medium text-white">Peso (kg)</label>
              <input
                type="number"
                id="weight"
                placeholder="Ex: 75.5"
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl p-[12px_16px] text-white text-sm transition-all duration-300 ease-in-out w-full box-border max-w-full min-w-0 overflow-hidden focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="height" className="text-sm font-medium text-white">Altura (cm)</label>
              <input
                type="number"
                id="height"
                placeholder="Ex: 170"
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl p-[12px_16px] text-white text-sm transition-all duration-300 ease-in-out w-full box-border max-w-full min-w-0 overflow-hidden focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-gray-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="chest" className="text-sm font-medium text-white">Peito (cm)</label>
              <input type="number" id="chest" placeholder="Ex: 100" className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl p-[12px_16px] text-white text-sm transition-all duration-300 ease-in-out w-full box-border max-w-full min-w-0 overflow-hidden focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-gray-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="waist" className="text-sm font-medium text-white">Cintura (cm)</label>
              <input type="number" id="waist" placeholder="Ex: 80" className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl p-[12px_16px] text-white text-sm transition-all duration-300 ease-in-out w-full box-border max-w-full min-w-0 overflow-hidden focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-gray-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="hips" className="text-sm font-medium text-white">Quadril (cm)</label>
              <input type="number" id="hips" placeholder="Ex: 95" className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl p-[12px_16px] text-white text-sm transition-all duration-300 ease-in-out w-full box-border max-w-full min-w-0 overflow-hidden focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-gray-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="arms" className="text-sm font-medium text-white">Braços (cm)</label>
              <input type="number" id="arms" placeholder="Ex: 30" className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl p-[12px_16px] text-white text-sm transition-all duration-300 ease-in-out w-full box-border max-w-full min-w-0 overflow-hidden focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-gray-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="legs" className="text-sm font-medium text-white">Coxas (cm)</label>
              <input type="number" id="legs" placeholder="Ex: 50" className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl p-[12px_16px] text-white text-sm transition-all duration-300 ease-in-out w-full box-border max-w-full min-w-0 overflow-hidden focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-gray-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="calves" className="text-sm font-medium text-white">Panturrilhas (cm)</label>
              <input type="number" id="calves" placeholder="Ex: 35" className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl p-[12px_16px] text-white text-sm transition-all duration-300 ease-in-out w-full box-border max-w-full min-w-0 overflow-hidden focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-gray-400" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="date" className="text-sm font-medium text-white">Data da Medida</label>
              <input
                type="date"
                id="date"
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-xl p-[12px_16px] text-white text-sm transition-all duration-300 ease-in-out w-full box-border max-w-full min-w-0 overflow-hidden text-ellipsis focus:outline-none focus:border-[rgba(255,107,0,0.5)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => console.log('Salvar Medidas clicked')}
            className="bg-gradient-to-br from-[#FF6B00] to-[#FF8533] border-none rounded-xl py-[14px] px-8 text-white text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,107,0,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none focus:outline-none"
          >
            Salvar Medidas
          </button>
        </div>
      </div>

      <div className="px-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <i className="fas fa-history text-orange-500 mr-2"></i> Histórico de Medidas
          </h2>
          <div className="flex flex-col gap-5">
            {/* Exemplo de histórico: */}
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 transition-all duration-300 ease-in-out hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.12)]">
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-calendar-alt text-orange-500"></i>
                <h3 className="text-base font-semibold text-white">22 de Fevereiro de 2024</h3>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-3">
                  <div className="aspect-square rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)]">
                    <img src="https://placehold.co/600x400?text=Frente" alt="Foto da frente" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)]">
                    <img src="https://placehold.co/600x400?text=Lado" alt="Foto de lado" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)]">
                    <img src="https://placehold.co/600x400?text=Costas" alt="Foto de costas" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                  <div className="text-center p-2 bg-[rgba(255,255,255,0.05)] rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Peso</p>
                    <p className="text-sm font-semibold text-white">92.5 kg</p>
                  </div>
                  <div className="text-center p-2 bg-[rgba(255,255,255,0.05)] rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Peito</p>
                    <p className="text-sm font-semibold text-white">100 cm</p>
                  </div>
                  <div className="text-center p-2 bg-[rgba(255,255,255,0.05)] rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Cintura</p>
                    <p className="text-sm font-semibold text-white">80 cm</p>
                  </div>
                  <div className="text-center p-2 bg-[rgba(255,255,255,0.05)] rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Quadril</p>
                    <p className="text-sm font-semibold text-white">95 cm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center p-[40px_20px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl text-gray-400">
              <p>Nenhum histórico de medidas encontrado.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <i className="fas fa-images text-orange-500 mr-2"></i> Galeria de Progresso
          </h2>

          <div className="bg-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
            <div className="bg-[rgba(255,255,255,0.05)] p-[15px_20px] border-b border-[rgba(255,255,255,0.08)]">
              <h4 className="m-0 text-white text-lg font-semibold flex items-center gap-2">
                Sessão de Fotos: 15 de Março, 2024
              </h4>
            </div>
            <div className="p-[15px_20px] border-b border-[rgba(255,255,255,0.08)] last:border-b-0">
              <div className="flex gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-[rgba(255,255,255,0.05)] p-[6px_10px] rounded-md">
                  <i className="fas fa-calendar-alt"></i>
                  <span>01/03/2024</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-[rgba(255,255,255,0.05)] p-[6px_10px] rounded-md">
                  <i className="fas fa-weight-hanging"></i>
                  <span>90 kg</span>
                </div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <div className="w-full h-full relative cursor-pointer transition-transform duration-300 ease-in-out hover:scale-102">
                    <img src="https://placehold.co/600x400?text=Frente+01-03" alt="Foto da frente 01/03" className="w-full h-full object-cover block" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-sm font-medium">Frente</p>
                    </div>
                    <button
                      onClick={() => console.log('Delete photo 1')}
                      className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 rounded-full text-white/80 text-xs flex items-center justify-center backdrop-blur-sm shadow-md transition-all hover:bg-red-600 hover:text-white"
                      aria-label="Deletar foto"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <div className="w-full h-full relative cursor-pointer transition-transform duration-300 ease-in-out hover:scale-102">
                    <img src="https://placehold.co/600x400?text=Lado+01-03" alt="Foto de lado 01/03" className="w-full h-full object-cover block" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-sm font-medium">Lado</p>
                    </div>
                    <button
                      onClick={() => console.log('Delete photo 2')}
                      className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 rounded-full text-white/80 text-xs flex items-center justify-center backdrop-blur-sm shadow-md transition-all hover:bg-red-600 hover:text-white"
                      aria-label="Deletar foto"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-[15px_20px] border-b border-[rgba(255,255,255,0.08)] last:border-b-0">
              <div className="flex gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-[rgba(255,255,255,0.05)] p-[6px_10px] rounded-md">
                  <i className="fas fa-calendar-alt"></i>
                  <span>01/02/2024</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-[rgba(255,255,255,0.05)] p-[6px_10px] rounded-md">
                  <i className="fas fa-weight-hanging"></i>
                  <span>93 kg</span>
                </div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <div className="w-full h-full relative cursor-pointer transition-transform duration-300 ease-in-out hover:scale-102">
                    <img src="https://placehold.co/600x400?text=Frente+01-02" alt="Foto da frente 01/02" className="w-full h-full object-cover block" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-white text-sm font-medium">Frente</p>
                    </div>
                    <button
                      onClick={() => console.log('Delete photo 3')}
                      className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 rounded-full text-white/80 text-xs flex items-center justify-center backdrop-blur-sm shadow-md transition-all hover:bg-red-600 hover:text-white"
                      aria-label="Deletar foto"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center p-[40px_20px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl text-gray-400">
            <p>Nenhuma foto de progresso encontrada.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
