import React from 'react';
import RecipeCard from './RecipeCard';
import SkeletonLoader from './SkeletonLoader';

export const RecipeGrid = ({ recipes, loading, onRecipeClick, emptyMessage = 'No recipes found', columns = 4 }) => {
  const colClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns] || 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  if (loading) {
    return (
      <div className={`grid grid-cols-1 ${colClass} gap-6`}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLoader key={i} type="card" />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 gap-4 text-center">
        <span className="material-symbols-outlined text-on-surface-variant text-6xl">restaurant</span>
        <h3 className="font-headline-md text-on-surface">{emptyMessage}</h3>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-6`}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onClick={() => onRecipeClick?.(recipe)}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
