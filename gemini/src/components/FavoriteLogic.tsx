import React, { useState } from 'react';

export const FavoriteLogic = ({
  recipeId,
  initialIsFavorited,
  csrfToken,
  setView,
}: {
  recipeId: string;
  initialIsFavorited: boolean;
  csrfToken: string;
  setView: (view: string) => void;
}) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async () => {
    setIsLoading(true);
    const previousIsFavorited = isFavorited; // Store state for potential rollback

    // Optimistic UI update
    setIsFavorited(!isFavorited);

    const formData = new FormData();
    formData.append('action', 'toggle_favorite');
    formData.append('recipe_id', recipeId);
    formData.append('csrf_token', csrfToken);

    try {
      const response = await fetch('ajax_toggle_favorite.php', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!data.success) {
        // Revert UI if API call failed
        setIsFavorited(previousIsFavorited);
        alert('Erro ao favoritar a receita. Tente novamente.');
      }
      // If success, UI is already updated optimistically
    } catch (error) {
      // Revert UI if network error occurred
      setIsFavorited(previousIsFavorited);
      alert('Erro de conexão. Tente novamente.');
      console.error('Favorite toggle error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // The button's visual state (color, icon) will depend on `isFavorited`
  const buttonClasses = [
    'favorite-toggle-btn',
    'flex', 'items-center', 'justify-center', 'p-2', 'rounded-full',
    'transition-colors', 'duration-200', 'ease-in-out',
    isFavorited ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-500',
    isLoading ? 'opacity-50 cursor-not-allowed' : '',
  ].filter(Boolean).join(' ');

  const iconClasses = [
    isFavorited ? 'fas text-white' : 'far text-gray-500',
    'fa-heart', 'text-lg',
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={toggleFavorite}
      disabled={isLoading}
      data-recipe-id={recipeId}
      data-csrf-token={csrfToken}
      aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <i className={iconClasses}></i>
      {/* Optional: Add text label next to icon */}
      {/* <span className="ml-2">{isFavorited ? 'Favoritado' : 'Favoritar'}</span> */}
    </button>
  );
};