import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById, addFavorite, deleteFavorite, getFavorites } from '../services/recipe';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useToast, Toast } from '../components/ui/Toast';

export const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [r, favs] = await Promise.all([getRecipeById(id), getFavorites()]);
        setRecipe(r);
        setIsFavorite(favs.some(f => f.id === id));
      } catch (e) { navigate('/saved'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await deleteFavorite(id);
        addToast('Removed from favorites', 'info');
      } else {
        await addFavorite(id);
        addToast('Saved to favorites!', 'success');
      }
      setIsFavorite(!isFavorite);
    } catch (e) { addToast('Action failed', 'error'); }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="shimmer-bg h-[300px] rounded-2xl animate-pulse"></div>
        <SkeletonLoader type="text" lines={4} />
      </div>
    );
  }

  if (!recipe) return null;

  const macros = [
    { label: 'Calories', value: `${recipe.calories}`, unit: 'kcal', color: 'text-primary', icon: 'local_fire_department' },
    { label: 'Protein', value: recipe.nutrition?.protein, color: 'text-tertiary', icon: 'fitness_center' },
    { label: 'Carbs', value: recipe.nutrition?.carbs, color: 'text-secondary', icon: 'grain' },
    { label: 'Fat', value: recipe.nutrition?.fat, color: 'text-primary', icon: 'water_drop' },
  ];

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Image */}
        <div className="relative w-full h-[300px] md:h-[420px] rounded-2xl overflow-hidden group bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[120px] text-primary opacity-30 absolute">restaurant</span>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent"/>
          <div className="absolute bottom-0 left-0 w-full p-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="glass-card px-4 py-1.5 rounded-full text-label-sm uppercase tracking-wider text-primary border-primary/20">{recipe.difficulty}</span>
              <span className="glass-card px-4 py-1.5 rounded-full text-label-sm uppercase tracking-wider text-tertiary border-tertiary/20">AI Generated</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-heading">{recipe.title}</h1>
            <div className="flex flex-wrap gap-6 items-center text-on-surface-variant">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">schedule</span><span className="font-label-md">{recipe.time} mins</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">restaurant</span><span className="font-label-md">{recipe.difficulty}</span></div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">group</span><span className="font-label-md">{recipe.servings} servings</span></div>
            </div>
          </div>
          {/* Actions */}
          <div className="absolute top-6 right-6 flex gap-3">
            <button onClick={toggleFavorite} className={`w-12 h-12 glass-card rounded-full flex items-center justify-center transition-all hover:scale-110 ${isFavorite ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined" style={isFavorite ? {fontVariationSettings:"'FILL' 1"} : {}}>favorite</span>
            </button>
            <button className="w-12 h-12 glass-card rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-all hover:scale-110">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <GlassCard>
              <h2 className="font-headline-md text-on-surface mb-4">About This Recipe</h2>
              <p className="text-on-surface-variant font-body-md leading-relaxed">{recipe.description}</p>
            </GlassCard>

            {/* Instructions */}
            <GlassCard>
              <h2 className="font-headline-md text-on-surface mb-6">Step-by-Step Instructions</h2>
              <div className="space-y-5">
                {recipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <span className="text-primary text-label-md group-hover:text-on-primary">{i + 1}</span>
                    </div>
                    <p className="text-on-surface-variant font-body-md leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutrition */}
            <GlassCard>
              <h3 className="font-headline-md text-on-surface mb-4">Nutrition Facts</h3>
              <div className="space-y-4">
                {macros.map(m => (
                  <div key={m.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-lg ${m.color}`}>{m.icon}</span>
                      <span className="font-label-md text-on-surface">{m.label}</span>
                    </div>
                    <span className={`font-label-md font-bold ${m.color}`}>{m.value} {m.unit || ''}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Ingredients */}
            <GlassCard>
              <h3 className="font-headline-md text-on-surface mb-4">Ingredients</h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3 text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                    <span className="font-body-md">{ing.quantity} {ing.unit} {ing.name}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <Button variant="primary" className="w-full !py-4" onClick={() => navigate('/generate')}>
              <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
              Generate Similar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeDetails;
