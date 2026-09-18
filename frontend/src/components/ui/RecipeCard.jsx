import React from 'react';

// Safely read time from either new metadata or legacy flat field
const getTime = (recipe) =>
  recipe?.metadata?.totalTimeMinutes ?? recipe?.time ?? null;

const getCalories = (recipe) =>
  recipe?.nutrition?.calories ?? null;

const getDifficulty = (recipe) =>
  recipe?.metadata?.difficulty ?? recipe?.difficulty ?? null;

export const RecipeCard = ({ recipe, onClick, actions }) => {
  const time = getTime(recipe);
  const calories = getCalories(recipe);
  const difficulty = getDifficulty(recipe);

  return (
    <div
      className="glass-card rounded-lg overflow-hidden flex flex-col group cursor-pointer"
      onClick={onClick}
    >
      <div className="h-48 overflow-hidden relative bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center">
        <span className="material-symbols-outlined text-[72px] text-primary opacity-20 absolute select-none">restaurant</span>
        {difficulty && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-background/60 backdrop-blur-md rounded-lg text-primary text-[10px] font-bold uppercase">
            {difficulty}
          </div>
        )}
        {recipe.fromCache && (
          <div className="absolute top-3 right-10 px-2 py-1 bg-secondary/20 backdrop-blur-md rounded-lg text-secondary text-[10px] font-bold uppercase">
            Cached
          </div>
        )}
        {actions && <div className="absolute top-3 right-3 flex gap-2">{actions}</div>}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h4 className="font-label-md text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {recipe.title}
        </h4>
        {recipe.summary && (
          <p className="text-on-surface-variant text-xs line-clamp-2 mb-2">{recipe.summary}</p>
        )}
        <div className="mt-auto pt-2 flex items-center gap-3 text-on-surface-variant">
          {time !== null && (
            <span className="flex items-center gap-1 text-label-sm">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {time} min
            </span>
          )}
          {calories !== null && (
            <span className="flex items-center gap-1 text-label-sm">
              <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              {calories} kcal
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
