import React from 'react';

export const RecipeCard = ({ recipe, onClick, actions }) => {
  return (
    <div
      className="glass-card rounded-lg overflow-hidden flex flex-col group cursor-pointer"
      onClick={onClick}
    >
      <div className="h-48 overflow-hidden relative">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={recipe.image}
          alt={recipe.title}
        />
        {recipe.difficulty && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-background/60 backdrop-blur-md rounded-lg text-primary text-[10px] font-bold uppercase">
            {recipe.difficulty}
          </div>
        )}
        {actions && <div className="absolute top-3 right-3 flex gap-2">{actions}</div>}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h4 className="font-label-md text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {recipe.title}
        </h4>
        {recipe.description && (
          <p className="text-on-surface-variant text-xs line-clamp-2 mb-2">{recipe.description}</p>
        )}
        <div className="mt-auto pt-2 flex items-center gap-3 text-on-surface-variant">
          {recipe.cookTime && (
            <span className="flex items-center gap-1 text-label-sm">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {recipe.cookTime}
            </span>
          )}
          {recipe.calories && (
            <span className="flex items-center gap-1 text-label-sm">
              <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              {recipe.calories} kcal
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
