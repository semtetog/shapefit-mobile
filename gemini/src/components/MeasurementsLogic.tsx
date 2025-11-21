import React, { useState, useRef } from 'react';

export const MeasurementsLogic = ({ setView }: { setView: (view: string) => void }) => {
    // State para o status de envio do formulário
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitButtonText, setSubmitButtonText] = useState('Salvar Medidas');

    // State para o modal de fotos
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');

    // States para a pré-visualização das fotos (assumindo 2 inputs de foto)
    const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
    const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);

    // Referência para o formulário para facilitar a coleta de dados
    const formRef = useRef<HTMLFormElement>(null);

    // --- Handler de Envio do Formulário ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitButtonText('Salvando...');

        if (formRef.current) {
            const formData = new FormData(formRef.current);

            try {
                // TODO: Ajustar o endpoint da API para sua aplicação real
                const response = await fetch('includes/ajax_handler.php', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();

                if (data.success) {
                    alert(data.message || 'Medidas salvas com sucesso!');
                    // O script original recarregava a página. Para uma SPA, considerar atualizar o estado ou buscar dados novamente.
                    window.location.reload(); 
                } else {
                    alert(data.message || 'Ocorreu um erro ao salvar as medidas.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Ocorreu um erro de conexão. Verifique sua internet.');
            } finally {
                setIsSubmitting(false);
                setSubmitButtonText('Salvar Medidas');
            }
        }
    };

    // --- Handlers do Modal de Fotos ---
    const openModal = (imageUrl: string) => {
        setModalImageUrl(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalImageUrl(''); // Limpa a imagem ao fechar
    };

    // --- Handler de Pré-visualização de Fotos ---
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreview(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        } else {
            setPreview(null); // Limpa a pré-visualização se nenhum arquivo for selecionado
        }
    };

    // Dados de histórico simulados para demonstração
    const historyItems = [
        { id: 1, date: '2023-01-15', weight: '75.2 kg', photoUrl: 'https://placehold.co/800x600?text=Medida+1' },
        { id: 2, date: '2023-02-20', weight: '74.8 kg', photoUrl: 'https://placehold.co/800x600?text=Medida+2' },
        { id: 3, date: '2023-03-25', weight: '73.5 kg', photoUrl: 'https://placehold.co/800x600?text=Medida+3' }
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Cabeçalho e Navegação */}
                <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-200">
                    <h1 className="text-3xl font-extrabold text-gray-900">Gerenciamento de Medidas</h1>
                    <button
                        onClick={() => setView("Dashboard")}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>

                {/* Seção do Formulário de Registro de Medidas */}
                <div className="bg-white shadow-xl rounded-lg p-6 mb-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Novas Medidas</h2>
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                defaultValue={new Date().toISOString().split('T')[0]} // Padrão para a data de hoje
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                id="weight"
                                name="weight"
                                placeholder="Ex: 75.5"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 text-gray-900 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                required
                            />
                        </div>
                        {/* Adicione mais campos de medida aqui conforme necessário */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fotos (Opcional)</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="file"
                                        id="photo1"
                                        name="photo1"
                                        accept="image/*"
                                        className="hidden photo-input"
                                        onChange={(e) => handlePhotoChange(e, setPhoto1Preview)}
                                    />
                                    <label
                                        htmlFor="photo1"
                                        className={`flex flex-col items-center justify-center border-2 border-dashed ${photo1Preview ? 'border-green-500' : 'border-gray-300'} rounded-lg p-6 cursor-pointer h-40 bg-center bg-cover transition-all duration-300 hover:border-blue-500`}
                                        style={photo1Preview ? { backgroundImage: `url('${photo1Preview}')` } : {}}
                                    >
                                        {!photo1Preview && <span className="text-gray-500 text-lg">Adicionar Foto 1</span>}
                                        {photo1Preview && <span className="bg-white bg-opacity-75 p-1 rounded-md text-gray-800 font-semibold">Alterar Foto</span>}
                                    </label>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        id="photo2"
                                        name="photo2"
                                        accept="image/*"
                                        className="hidden photo-input"
                                        onChange={(e) => handlePhotoChange(e, setPhoto2Preview)}
                                    />
                                    <label
                                        htmlFor="photo2"
                                        className={`flex flex-col items-center justify-center border-2 border-dashed ${photo2Preview ? 'border-green-500' : 'border-gray-300'} rounded-lg p-6 cursor-pointer h-40 bg-center bg-cover transition-all duration-300 hover:border-blue-500`}
                                        style={photo2Preview ? { backgroundImage: `url('${photo2Preview}')` } : {}}
                                    >
                                        {!photo2Preview && <span className="text-gray-500 text-lg">Adicionar Foto 2</span>}
                                        {photo2Preview && <span className="bg-white bg-opacity-75 p-1 rounded-md text-gray-800 font-semibold">Alterar Foto</span>}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                            disabled={isSubmitting}
                        >
                            {submitButtonText}
                        </button>
                    </form>
                </div>

                {/* Seção do Histórico de Medidas */}
                <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Medidas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {historyItems.length > 0 ? (
                            historyItems.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-200 bg-gray-50">
                                    <p className="text-lg font-semibold text-gray-900 mb-1">Data: {item.date}</p>
                                    <p className="text-gray-700 mb-3">Peso: {item.weight}</p>
                                    <div className="w-full h-32 mb-3 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                                        <img
                                            src={`https://placehold.co/600x400?text=Medida+${item.id}+Thumbnail`}
                                            alt={`Medida ${item.id}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => openModal(item.photoUrl)}
                                        className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
                                    >
                                        Ver Foto
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-500 text-lg py-4">Nenhum registro de medidas encontrado.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Fotos */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={closeModal} // Fecha ao clicar no fundo (fora da imagem)
                >
                    <div className="relative bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <button
                            className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-4xl font-light leading-none cursor-pointer p-1 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                        <img
                            src={modalImageUrl}
                            alt="Foto Ampliada"
                            className="max-w-full max-h-[80vh] object-contain mx-auto"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};