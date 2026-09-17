import React from 'react';

export const FavoriteCard = ({ recipe, onUnfavorite, onClick }) => {
  return (
    <div
      className="glass-card rounded-lg overflow-hidden flex group cursor-pointer hover:border-primary/30"
      onClick={onClick}
    >
      <div className="w-24 h-24 shrink-0 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={recipe.image}
          alt={recipe.title}
        />
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between">
        <h4 className="font-label-md text-on-surface group-hover:text-primary transition-colors line-clamp-1">
          {recipe.title}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-on-surface-variant text-label-sm">{recipe.calories} kcal</span>
          {onUnfavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onUnfavorite(); }}
              className="material-symbols-outlined text-primary text-lg hover:scale-110 transition-transform"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoriteCard;
