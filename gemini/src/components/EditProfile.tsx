import React, { useState, useEffect } from 'react';

export const EditProfile = ({ setView }: { setView: (view: string) => void }) => {
    const [showRestrictionsModal, setShowRestrictionsModal] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [profilePhotoForCrop, setProfilePhotoForCrop] = useState<string | null>(null); // Image selected for cropping
    const [displayProfilePhoto, setDisplayProfilePhoto] = useState<string | null>('https://placehold.co/100x100?text=Profile+Image'); // Actual profile photo displayed
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isLoading, setIsLoading] = useState(true); // Placeholder for loading state

    useEffect(() => {
        // TODO: Implement logic to fetch user profile data and set initial form values
        // Simulate API call
        const timer = setTimeout(() => {
            setIsLoading(false);
            // Example: setDisplayProfilePhoto('https://example.com/user-photo.jpg');
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePhotoForCrop(e.target?.result as string);
                setShowCropModal(true);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const handleCropAndSave = () => {
        // TODO: Implement actual image cropping logic here using profilePhotoForCrop
        // For now, just set the cropped image to the display photo
        if (profilePhotoForCrop) {
            setDisplayProfilePhoto(profilePhotoForCrop); // Or the result of actual crop
            setUploadStatus({ type: 'success', message: 'Foto de perfil atualizada!' });
            setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
        }
        setShowCropModal(false);
        setProfilePhotoForCrop(null); // Clear image data after crop
    };

    const handleRemovePhoto = () => {
        setDisplayProfilePhoto('https://placehold.co/100x100?text=Profile+Image'); // Reset to placeholder
        setUploadStatus({ type: 'success', message: 'Foto de perfil removida.' });
        setTimeout(() => setUploadStatus({ type: null, message: '' }), 3000);
    };

    // TODO: Extract complex script logic or integrate with React state/API calls.
    // const BASE_APP_URL = window.BASE_APP_URL || (window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/'));
    // if (BASE_APP_URL.endsWith('/')) { BASE_APP_URL = BASE_APP_URL.slice(0, -1); }
    // auth.js functions would need to be integrated into React hooks or utility functions.

    return (
        <div className="app-container min-h-screen bg-gray-900 text-white font-montserrat">
            <div className={`edit-profile-grid flex flex-col gap-5 px-2 py-5 ${isLoading ? 'profile-loading' : 'profile-loaded'}`}>
                {/* Header com título */}
                <div className="profile-header flex items-center mb-6 gap-4 justify-start">
                    <button
                        className="back-button flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white no-underline transition-all duration-300 ease-in-out flex-shrink-0 hover:bg-white/[0.1] hover:border-orange-500 hover:text-orange-500 hover:-translate-x-0.5"
                        onClick={() => setView("Dashboard")}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <h1 className="profile-title text-3xl font-bold text-white m-0 flex items-center gap-3 flex-1 min-w-0">
                        <i className="fas fa-user-circle text-orange-500 text-2xl flex-shrink-0"></i>
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">Editar Perfil</span>
                    </h1>
                </div>

                {/* Card de foto de perfil */}
                <div className="profile-photo-card bg-white/[0.03] backdrop-blur-xl -webkit-backdrop-blur-xl border border-white/[0.05] rounded-2xl p-6 mb-5 shadow-lg text-center">
                    <div className="profile-photo-wrapper relative inline-block mb-4">
                        <label htmlFor="profilePhotoInput" className="cursor-pointer">
                            {displayProfilePhoto ? (
                                <img src={displayProfilePhoto} alt="Profile" className="profile-photo w-24 h-24 rounded-full object-cover border-3 border-orange-500 transition-transform duration-300 ease-in-out hover:scale-105" />
                            ) : (
                                <div className="profile-photo profile-icon-placeholder flex items-center justify-center bg-white/[0.05] border-3 border-orange-500 transition-transform duration-300 ease-in-out w-24 h-24 rounded-full hover:scale-105">
                                    <i className="fas fa-camera text-orange-500 text-4xl"></i>
                                </div>
                            )}
                        </label>
                        <input
                            id="profilePhotoInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </div>
                    <p className="photo-upload-text text-gray-400 text-sm m-0 mb-3">Toque para alterar a foto</p>
                    {displayProfilePhoto !== 'https://placehold.co/100x100?text=Profile+Image' && (
                        <button
                            className="remove-photo-btn bg-red-500/[0.1] border border-red-500/[0.3] text-red-500 py-2 px-4 rounded-lg text-sm cursor-pointer transition-all duration-300 ease-in-out inline-flex items-center gap-1.5 border-none hover:bg-red-500/[0.2] hover:border-red-500/[0.5] hover:-translate-y-0.5"
                            onClick={handleRemovePhoto}
                        >
                            <i className="fas fa-trash"></i> Remover Foto
                        </button>
                    )}
                     {uploadStatus.type && (
                        <div className={`upload-status mt-3 p-3 rounded-lg text-sm text-center ${uploadStatus.type === 'success' ? 'bg-green-500/[0.1] text-green-400 border border-green-500/[0.3]' : 'bg-red-500/[0.1] text-red-500 border border-red-500/[0.3]'}`}>
                            {uploadStatus.message}
                        </div>
                    )}
                </div>

                {/* Card de Informações Pessoais */}
                <div className="info-card bg-white/[0.03] backdrop-blur-xl -webkit-backdrop-blur-xl border border-white/[0.05] rounded-2xl p-6 mb-5 shadow-lg">
                    <div className="card-header flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.1]">
                        <i className="fas fa-info-circle card-icon text-2xl text-orange-500"></i>
                        <h2 className="card-title text-xl font-semibold text-white m-0">Informações Pessoais</h2>
                    </div>
                    <form className="form-grid flex flex-col gap-4">
                        <div className="form-group flex flex-col gap-2">
                            <label htmlFor="name" className="form-label text-sm font-medium text-gray-400 m-0">Nome Completo</label>
                            <input type="text" id="name" name="name" className="form-input w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-base transition-all duration-300 ease-in-out box-border max-w-full focus:outline-none focus:border-orange-500 focus:bg-white/[0.08] focus:ring-3 focus:ring-orange-500/[0.1]" placeholder="Seu nome completo" />
                        </div>
                        <div className="form-group flex flex-col gap-2">
                            <label htmlFor="email" className="form-label text-sm font-medium text-gray-400 m-0">E-mail</label>
                            <input type="email" id="email" name="email" className="form-input form-input-readonly !bg-white/[0.03] !border-white/[0.08] !text-white/[0.6] cursor-not-allowed opacity-80 px-4 py-3 rounded-xl" value="usuario@email.com" readOnly />
                            <span id="email-display" className="hidden"></span> {/* Original HTML had this, keeping as reference if dynamic content needed later */}
                        </div>
                        <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-4 w-full box-border">
                            <div className="form-group flex flex-col gap-2">
                                <label htmlFor="birthdate" className="form-label text-sm font-medium text-gray-400 m-0">Data de Nascimento</label>
                                <input type="date" id="birthdate" name="birthdate" className="form-input w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-base transition-all duration-300 ease-in-out box-border max-w-full focus:outline-none focus:border-orange-500 focus:bg-white/[0.08] focus:ring-3 focus:ring-orange-500/[0.1] appearance-none" />
                            </div>
                            <div className="form-group flex flex-col gap-2 group">
                                <label htmlFor="gender" className="form-label text-sm font-medium text-gray-400 m-0">Gênero</label>
                                <div className="select-wrapper relative block w-full">
                                    <select id="gender" name="gender" className="form-select w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-base transition-all duration-300 ease-in-out box-border max-w-full focus:outline-none focus:border-orange-500 focus:bg-white/[0.08] focus:ring-3 focus:ring-orange-500/[0.1] pr-10 appearance-none cursor-pointer">
                                        <option value="">Selecione</option>
                                        <option value="male">Masculino</option>
                                        <option value="female">Feminino</option>
                                        <option value="other">Outro</option>
                                    </select>
                                    <i className="select-arrow fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white text-xs opacity-80 transition-opacity duration-200 ease-in-out transition-colors duration-200 ease-in-out"></i>
                                </div>
                            </div>
                        </div>
                        <div className="form-row grid grid-cols-1 md:grid-cols-2 gap-4 w-full box-border">
                            <div className="form-group flex flex-col gap-2">
                                <label htmlFor="height" className="form-label text-sm font-medium text-gray-400 m-0">Altura (cm)</label>
                                <input type="number" id="height" name="height" className="form-input w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-base transition-all duration-300 ease-in-out box-border max-w-full focus:outline-none focus:border-orange-500 focus:bg-white/[0.08] focus:ring-3 focus:ring-orange-500/[0.1]" placeholder="Ex: 175" />
                            </div>
                            <div className="form-group flex flex-col gap-2">
                                <label htmlFor="weight" className="form-label text-sm font-medium text-gray-400 m-0">Peso (kg)</label>
                                <input type="number" id="weight" name="weight" className="form-input w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-base transition-all duration-300 ease-in-out box-border max-w-full focus:outline-none focus:border-orange-500 focus:bg-white/[0.08] focus:ring-3 focus:ring-orange-500/[0.1]" placeholder="Ex: 70.5" step="0.1" />
                                <p className="weight-lock-info mt-2 text-orange-500 text-sm flex items-center gap-1.5">
                                    <i className="fas fa-lock"></i> Peso bloqueado. Atualize no progresso.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="restrictions-button group w-full px-5 py-4 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white text-base cursor-pointer transition-all duration-300 ease-in-out flex justify-between items-center text-left hover:bg-white/[0.08] hover:border-orange-500"
                            onClick={() => setShowRestrictionsModal(true)}
                        >
                            Restrições Alimentares
                            <i className="fas fa-chevron-right text-orange-500 transition-transform duration-300 ease-in-out group-hover:translate-x-1"></i>
                        </button>
                    </form>
                </div>

                <button type="submit" className="save-button w-full py-4 px-6 bg-gradient-to-br from-orange-500 to-orange-600 border-none rounded-2xl text-white text-lg font-semibold cursor-pointer transition-all duration-300 ease-in-out mt-5 flex items-center justify-center gap-3 hover:-translate-y-0.5" disabled={isLoading}>
                    <i className="fas fa-save"></i> Salvar Alterações
                </button>
            </div>

            {/* Modal de Crop de Foto */}
            <div className={`modal-overlay fixed inset-0 bg-black/[0.8] backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${showCropModal ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="crop-modal bg-gray-900/[0.95] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-4 max-w-sm w-[90%] max-h-[75vh] overflow-hidden flex flex-col">
                    <div className="modal-header flex justify-between items-center mb-5 pb-4 border-b border-white/[0.1]">
                        <h3 className="modal-title text-xl font-semibold text-white m-0">Recortar Imagem</h3>
                        <button className="modal-close bg-none border-none text-gray-400 text-3xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ease-in-out hover:bg-white/[0.1] hover:text-white" onClick={() => setShowCropModal(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="crop-container w-full h-70 relative mb-4 rounded-xl overflow-hidden bg-black">
                        {profilePhotoForCrop && (
                            <>
                                <img src={profilePhotoForCrop} alt="Crop background" className="crop-background absolute inset-0 w-full h-full object-cover blur-xl brightness-75 scale-125 z-10 opacity-80" />
                                <img src={profilePhotoForCrop} alt="Crop target" className="crop-image absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto h-auto max-w-none max-h-none cursor-move z-10 select-none" />
                            </>
                        )}
                        <div className="crop-overlay absolute inset-0 pointer-events-none z-20">
                            <div className="crop-circle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-50 h-50 border-2 border-orange-500 rounded-full bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
                        </div>
                    </div>
                    <div className="modal-actions flex gap-3 mt-auto pt-5 border-t border-white/[0.1]">
                        <button className="modal-btn modal-btn-secondary flex-1 py-3 px-5 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out border border-white/[0.2] bg-white/[0.1] text-white hover:bg-white/[0.15]" onClick={() => setShowCropModal(false)}>
                            Cancelar
                        </button>
                        <button className="modal-btn modal-btn-primary flex-1 py-3 px-5 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:-translate-y-0.5" onClick={handleCropAndSave}>
                            Salvar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Restrições Alimentares */}
            <div className={`modal-overlay fixed inset-0 bg-black/[0.8] backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${showRestrictionsModal ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="restrictions-modal bg-gray-900/[0.95] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-5 max-w-sm w-[90%] max-h-[70vh] overflow-y-auto flex flex-col scrollbar-hide">
                    <div className="modal-header flex justify-between items-center mb-5 pb-4 border-b border-white/[0.1]">
                        <h3 className="modal-title text-xl font-semibold text-white m-0">Restrições Alimentares</h3>
                        <button className="modal-close bg-none border-none text-gray-400 text-3xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ease-in-out hover:bg-white/[0.1] hover:text-white" onClick={() => setShowRestrictionsModal(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="restrictions-grid flex flex-col gap-3 mb-5">
                        {/* Exemplo de restrição, pode ser mapeado de um array de dados */}
                        <div className="restriction-item flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg transition-colors duration-200 ease-in-out hover:bg-white/[0.06]">
                            <label className="custom-checkbox flex items-center gap-3 cursor-pointer flex-1">
                                <input type="checkbox" className="w-5 h-5 cursor-pointer accent-orange-500" />
                                <span className="checkbox-label text-white text-base">Sem Glúten</span>
                            </label>
                        </div>
                        <div className="restriction-item flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg transition-colors duration-200 ease-in-out hover:bg-white/[0.06]">
                            <label className="custom-checkbox flex items-center gap-3 cursor-pointer flex-1">
                                <input type="checkbox" className="w-5 h-5 cursor-pointer accent-orange-500" />
                                <span className="checkbox-label text-white text-base">Sem Lactose</span>
                            </label>
                        </div>
                        <div className="restriction-item flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg transition-colors duration-200 ease-in-out hover:bg-white/[0.06]">
                            <label className="custom-checkbox flex items-center gap-3 cursor-pointer flex-1">
                                <input type="checkbox" className="w-5 h-5 cursor-pointer accent-orange-500" />
                                <span className="checkbox-label text-white text-base">Vegetariano</span>
                            </label>
                        </div>
                        <div className="restriction-item flex items-center gap-3 p-3 bg-white/[0.03] rounded-lg transition-colors duration-200 ease-in-out hover:bg-white/[0.06]">
                            <label className="custom-checkbox flex items-center gap-3 cursor-pointer flex-1">
                                <input type="checkbox" className="w-5 h-5 cursor-pointer accent-orange-500" />
                                <span className="checkbox-label text-white text-base">Vegano</span>
                            </label>
                        </div>
                        {/* Adicione mais restrições conforme necessário */}
                    </div>
                    <div className="modal-actions flex gap-3 mt-auto pt-5 border-t border-white/[0.1]">
                        <button className="modal-btn modal-btn-secondary flex-1 py-3 px-5 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out border border-white/[0.2] bg-white/[0.1] text-white hover:bg-white/[0.15]" onClick={() => setShowRestrictionsModal(false)}>
                            Cancelar
                        </button>
                        <button className="modal-btn modal-btn-primary flex-1 py-3 px-5 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:-translate-y-0.5" onClick={() => setShowRestrictionsModal(false)}>
                            Aplicar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
