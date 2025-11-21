import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';

// Assuming an initial profile picture URL
const INITIAL_PROFILE_PIC = 'https://placehold.co/100x100?text=Profile';

export const EditProfileLogic = ({ setView }: { setView: (view: string) => void }) => {
    const [profilePicture, setProfilePicture] = useState<string>(INITIAL_PROFILE_PIC);
    const [uploadStatusMessage, setUploadStatusMessage] = useState<string>('');
    const [uploadStatusClass, setUploadStatusClass] = useState<string>(''); // 'success' or 'error'
    const [isLoadingPictureUpload, setIsLoadingPictureUpload] = useState<boolean>(false);
    const [isSavingForm, setIsSavingForm] = useState<boolean>(false);
    const [isRestrictionsModalOpen, setIsRestrictionsModalOpen] = useState<boolean>(false);
    const [csrfToken, setCsrfToken] = useState<string>('');

    const profilePictureInputRef = useRef<HTMLInputElement>(null);
    const editProfileFormRef = useRef<HTMLFormElement>(null); // For submit logic

    // Simulate fetching CSRF token from a hidden input or context
    useEffect(() => {
        // In a real app, this might come from a context, a server-side rendered prop,
        // or a dedicated API call. For this exercise, we simulate reading from an input.
        const csrfElement = document.getElementById('csrf_token_main_app') as HTMLInputElement;
        if (csrfElement) {
            setCsrfToken(csrfElement.value);
        } else {
            // Fallback for demonstration if the element doesn't exist initially
            setCsrfToken('mock_csrf_token_123');
        }
    }, []);

    const handleProfilePictureChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            if (e.target?.result) {
                setProfilePicture(e.target.result as string); // Optimistic update
            }
        };
        reader.readAsDataURL(file);

        setIsLoadingPictureUpload(true);
        setUploadStatusMessage('');
        setUploadStatusClass('');

        const formData = new FormData();
        formData.append('action', 'update_profile_picture');
        formData.append('profile_picture', file);
        formData.append('csrf_token', csrfToken);

        try {
            // Simulate API call
            const response = await fetch('/includes/ajax_handler.php', { method: 'POST', body: formData });
            const result = await response.json();

            setUploadStatusMessage(result.message);
            setUploadStatusClass(result.success ? 'success' : 'error');

            if (result.success && result.new_image_url) {
                setProfilePicture(result.new_image_url); // Update with actual URL from server
            }
        } catch (error) {
            console.error("Failed to upload profile picture:", error);
            setUploadStatusMessage("Falha de comunicação.");
            setUploadStatusClass('error');
        } finally {
            setIsLoadingPictureUpload(false);
            setTimeout(() => {
                setUploadStatusMessage('');
                setUploadStatusClass('');
            }, 3000);
        }
    };

    const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editProfileFormRef.current) return;

        setIsSavingForm(true);
        setUploadStatusMessage('');
        setUploadStatusClass('');

        const formData = new FormData(editProfileFormRef.current);
        formData.append('action', 'update_profile_details');
        formData.append('csrf_token', csrfToken);

        try {
            // Simulate API call
            const response = await fetch('/includes/ajax_handler.php', { method: 'POST', body: formData });
            const result = await response.json();

            setUploadStatusMessage(result.message);
            setUploadStatusClass(result.success ? 'success' : 'error');
        } catch (error) {
            console.error("Failed to save profile details:", error);
            setUploadStatusMessage('Falha ao conectar com o servidor.');
            setUploadStatusClass('error');
        } finally {
            setIsSavingForm(false);
            setTimeout(() => {
                setUploadStatusMessage('');
                setUploadStatusClass('');
            }, 3000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Editar Perfil</h1>

                <input type="hidden" id="csrf_token_main_app" value={csrfToken} />

                {/* Profile Picture Upload Section */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 group">
                        <img
                            id="profile-picture-display"
                            src={profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <div
                            className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${isLoadingPictureUpload ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} edit-picture-overlay`}
                        >
                            <label
                                htmlFor="profile-picture-input"
                                className="cursor-pointer text-white text-sm font-semibold p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                {isLoadingPictureUpload ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Editar Foto'
                                )}
                            </label>
                            <input
                                id="profile-picture-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePictureChange}
                                ref={profilePictureInputRef}
                                disabled={isLoadingPictureUpload}
                            />
                        </div>
                    </div>
                    {uploadStatusMessage && (
                        <p
                            id="upload-status"
                            className={`mt-3 text-sm font-medium ${uploadStatusClass === 'success' ? 'text-green-600' : 'text-red-600'}`}
                        >
                            {uploadStatusMessage}
                        </p>
                    )}
                </div>

                {/* Main Edit Profile Form */}
                <form id="edit-profile-form" onSubmit={handleFormSubmit} ref={editProfileFormRef} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Nome Completo
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            defaultValue="João da Silva" // Example default value
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            defaultValue="joao.silva@example.com" // Example default value
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            defaultValue="Desenvolvedor front-end apaixonado por React e Tailwind CSS." // Example default value
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        ></textarea>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            type="button"
                            id="open-restrictions-modal"
                            onClick={() => setIsRestrictionsModalOpen(true)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Gerenciar Restrições de Privacidade
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isSavingForm}
                        >
                            {isSavingForm ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>

                    {/* Example of navigating to another page */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <button
                            onClick={() => setView('Dashboard')}
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                            Voltar para o Dashboard
                        </button>
                    </div>
                </form>

                {/* Restrictions Modal */}
                {isRestrictionsModalOpen && (
                    <div
                        id="restrictions-modal"
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-overlay"
                        onClick={() => setIsRestrictionsModalOpen(false)} // Close when clicking overlay
                    >
                        <div
                            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                        >
                            <h2 className="text-xl font-bold mb-4">Restrições de Privacidade</h2>
                            <p className="text-gray-700 mb-6">
                                Aqui você pode configurar suas preferências de privacidade.
                                Implemente a lógica para gerenciar essas configurações.
                            </p>
                            {/* Example Privacy Options */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center">
                                    <input type="checkbox" id="public_profile" name="privacy_options" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <label htmlFor="public_profile" className="ml-2 block text-sm text-gray-900">
                                        Tornar perfil público
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" id="show_email" name="privacy_options" className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <label htmlFor="show_email" className="ml-2 block text-sm text-gray-900">
                                        Mostrar meu email para outros usuários
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors modal-close-btn"
                                    onClick={() => setIsRestrictionsModalOpen(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors modal-confirm-btn"
                                    onClick={() => {
                                        // TODO: Adicionar lógica para salvar as restrições aqui
                                        console.log('Restrições salvas!');
                                        setIsRestrictionsModalOpen(false);
                                    }}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};