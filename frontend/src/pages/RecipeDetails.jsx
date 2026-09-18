import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipeById, addFavorite, deleteFavorite, getFavorites, substituteIngredient, adaptRecipe, interactRecipe } from '../services/recipe';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useToast, Toast } from '../components/ui/Toast';
import CookMode from '../components/ui/CookMode';

// Helper: read from new metadata or legacy flat field
const getMeta = (recipe) => ({
  servings: recipe?.metadata?.servings ?? recipe?.servings,
  difficulty: recipe?.metadata?.difficulty ?? recipe?.difficulty,
  totalTime: recipe?.metadata?.totalTimeMinutes ?? recipe?.time,
  prepTime: recipe?.metadata?.prepTimeMinutes ?? null,
  cookTime: recipe?.metadata?.cookTimeMinutes ?? null,
  cuisine: recipe?.metadata?.cuisine ?? recipe?.cuisine,
  dietaryTags: recipe?.metadata?.dietaryTags ?? recipe?.dietary_preferences ?? [],
});

export const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cookMode, setCookMode] = useState(false);
  const [substituteModal, setSubstituteModal] = useState(null);
  const [substituteResult, setSubstituteResult] = useState(null);
  const [substituting, setSubstituting] = useState(false);
  const [adaptModal, setAdaptModal] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const [r, favs] = await Promise.all([getRecipeById(id), getFavorites()]);
        setRecipe(r);
        setIsFavorite(favs.some(f => String(f.id) === id || String(f._id) === id));
      } catch (e) { navigate('/saved'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) { await deleteFavorite(id); addToast('Removed from favorites', 'info'); }
      else { await addFavorite(id); addToast('Saved to favorites!', 'success'); }
      setIsFavorite(!isFavorite);
    } catch { addToast('Action failed', 'error'); }
  };

  const handleSubstitute = async (ingredientName) => {
    setSubstituteModal(ingredientName);
    setSubstituteResult(null);
    setSubstituting(true);
    try {
      const result = await substituteIngredient(id, ingredientName);
      setSubstituteResult(result);
    } catch { setSubstituteResult({ error: 'Could not find a substitute right now.' }); }
    finally { setSubstituting(false); }
  };

  const handleAdapt = async (userRequest) => {
    setAdapting(true);
    try {
      const newRecipe = await adaptRecipe(recipe.id || recipe._id, userRequest);
      addToast('Recipe adapted successfully!', 'success');
      setAdaptModal(false);
      navigate(`/recipe/${newRecipe.id || newRecipe._id}`);
    } catch {
      addToast('Failed to adapt recipe', 'error');
    } finally {
      setAdapting(false);
    }
  };

  const handleRating = async (rating) => {
    try {
      await interactRecipe(recipe.id || recipe._id, { rating, liked: rating >= 4 });
      addToast('Rating saved!', 'success');
    } catch { addToast('Could not save rating', 'error'); }
  };

  if (loading) return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="shimmer-bg h-[300px] rounded-2xl animate-pulse" />
      <SkeletonLoader type="text" lines={4} />
    </div>
  );
  if (!recipe) return null;

  const meta = getMeta(recipe);

  const macros = [
    { label: 'Calories', value: recipe.nutrition?.calories, unit: 'kcal', color: 'text-primary', icon: 'local_fire_department' },
    { label: 'Protein',  value: recipe.nutrition?.protein,  unit: 'g',    color: 'text-tertiary',  icon: 'fitness_center' },
    { label: 'Carbs',    value: recipe.nutrition?.carbs,    unit: 'g',    color: 'text-secondary', icon: 'grain' },
    { label: 'Fat',      value: recipe.nutrition?.fat,      unit: 'g',    color: 'text-primary',   icon: 'water_drop' },
  ];

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      {cookMode && <CookMode recipe={recipe} onClose={() => setCookMode(false)} />}

      {/* Substitute Modal */}
      {substituteModal && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-headline-md text-on-surface">Smart Substitute</h3>
            <p className="text-on-surface-variant text-sm">Finding a replacement for <strong>{substituteModal}</strong>...</p>
            {substituting && <div className="animate-pulse h-4 bg-outline-variant rounded w-3/4" />}
            {substituteResult && !substituteResult.error && (
              <div className="space-y-2">
                <p className="text-on-surface"><span className="text-primary font-bold">Use instead:</span> {substituteResult.substitute}</p>
                <p className="text-on-surface-variant text-sm">{substituteResult.adjustmentNote}</p>
              </div>
            )}
            {substituteResult?.error && <p className="text-error text-sm">{substituteResult.error}</p>}
            <Button variant="outlined" onClick={() => { setSubstituteModal(null); setSubstituteResult(null); }}>Close</Button>
          </div>
        </div>
      )}

      {/* Adapt Modal */}
      {adaptModal && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-headline-md text-on-surface">Adapt this Recipe</h3>
            <p className="text-on-surface-variant text-sm">How would you like to adapt this recipe?</p>
            {adapting ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-label-md animate-pulse">Reimagining recipe...</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {['Make it cheaper', 'Make it healthier', 'Make it faster', 'Make it easier', 'Make it spicier', 'Make it less spicy', 'Make it vegetarian', 'Increase protein', 'Reduce calories', 'Make it family-sized', 'Make it more traditional', 'Modernize it'].map(opt => (
                  <Button key={opt} variant="secondary" className="!py-1.5 !px-3 !text-xs" onClick={() => handleAdapt(opt)}>{opt}</Button>
                ))}
              </div>
            )}
            <Button variant="outlined" onClick={() => setAdaptModal(false)} disabled={adapting}>Close</Button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero */}
        <div className="relative w-full h-[300px] md:h-[420px] rounded-2xl overflow-hidden group bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[120px] text-primary opacity-30 absolute">restaurant</span>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {meta.difficulty && <span className="glass-card px-4 py-1.5 rounded-full text-label-sm uppercase tracking-wider text-primary border-primary/20">{meta.difficulty}</span>}
              {recipe.fromCache && <span className="glass-card px-4 py-1.5 rounded-full text-label-sm uppercase tracking-wider text-secondary border-secondary/20">Cached</span>}
              {meta.dietaryTags?.map(tag => <span key={tag} className="glass-card px-4 py-1.5 rounded-full text-label-sm uppercase tracking-wider text-tertiary border-tertiary/20">{tag}</span>)}
            </div>
            <h1 className="font-headline-xl text-headline-xl text-heading">{recipe.title}</h1>
            <div className="flex flex-wrap gap-6 items-center text-on-surface-variant">
              {meta.prepTime !== null && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">hourglass_empty</span><span className="font-label-md">Prep {meta.prepTime} min</span></div>}
              {meta.cookTime !== null && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">local_fire_department</span><span className="font-label-md">Cook {meta.cookTime} min</span></div>}
              {meta.totalTime && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">schedule</span><span className="font-label-md">{meta.totalTime} min total</span></div>}
              {meta.servings && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">group</span><span className="font-label-md">{meta.servings} servings</span></div>}
              {meta.cuisine && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">public</span><span className="font-label-md">{meta.cuisine}</span></div>}
              {recipe.estimatedCost > 0 && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">payments</span><span className="font-label-md">~Rs. {recipe.estimatedCost}</span></div>}
            </div>
          </div>
          <div className="absolute top-6 right-6 flex gap-3">
            <button onClick={() => setCookMode(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full text-label-md hover:opacity-90 transition-all hover:scale-105">
              <span className="material-symbols-outlined text-lg">restaurant_menu</span> Cook Mode
            </button>
            <button onClick={toggleFavorite} className={`w-12 h-12 glass-card rounded-full flex items-center justify-center transition-all hover:scale-110 ${isFavorite ? 'text-primary' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined" style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            
            {recipe.generationAdaptation && (
              <GlassCard className="border-primary/30">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">person_check</span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-primary mb-1">AI Personalized For You</h3>
                    <p className="text-on-surface-variant font-body-sm">{recipe.generationAdaptation}</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {recipe.summary && (
              <GlassCard>
                <h2 className="font-headline-md text-on-surface mb-4">About This Recipe</h2>
                <p className="text-on-surface-variant font-body-md leading-relaxed">{recipe.summary}</p>
              </GlassCard>
            )}

            <GlassCard>
              <h2 className="font-headline-md text-on-surface mb-6">Step-by-Step Instructions</h2>
              <div className="space-y-5">
                {recipe.instructions?.map((step, i) => {
                  const instruction = typeof step === 'string' ? step : step.instruction;
                  const timer = typeof step === 'object' ? step.timerInMinutes : null;
                  return (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-all">
                        <span className="text-primary text-label-md group-hover:text-on-primary">{typeof step === 'object' ? step.stepNumber : i + 1}</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-on-surface-variant font-body-md leading-relaxed">{instruction}</p>
                        {timer && <span className="inline-flex items-center gap-1 mt-1 text-label-sm text-primary"><span className="material-symbols-outlined text-sm">timer</span>{timer} min</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GlassCard>
              <h3 className="font-headline-md text-on-surface mb-4">Nutrition Facts</h3>
              <div className="space-y-4">
                {macros.map(m => (
                  <div key={m.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-lg ${m.color}`}>{m.icon}</span>
                      <span className="font-label-md text-on-surface">{m.label}</span>
                    </div>
                    <span className={`font-label-md font-bold ${m.color}`}>{m.value ?? '—'} {m.unit}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="font-headline-md text-on-surface mb-4">Ingredients</h3>
              <ul className="space-y-3">
                {recipe.ingredients?.map((ing, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-on-surface-variant group">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="font-body-md">
                        {ing.quantity} {ing.unit} {ing.name}
                        {ing.isPantryStaple && <span className="ml-1 text-[10px] text-secondary uppercase">(pantry)</span>}
                      </span>
                    </div>
                    <button
                      onClick={() => handleSubstitute(ing.name)}
                      title="Find substitute"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-sm">swap_horiz</span>
                    </button>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <Button variant="primary" className="w-full !py-4" onClick={() => setAdaptModal(true)}>
              <span className="material-symbols-outlined">tune</span>
              Adapt Recipe
            </Button>
            <Button variant="outlined" className="w-full !py-4" onClick={() => navigate('/generate')}>
              <span className="material-symbols-outlined">auto_awesome</span>
              Generate Similar
            </Button>
            
            <GlassCard>
              <h3 className="font-label-md text-on-surface mb-2">Rate this recipe</h3>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => handleRating(star)} className="text-primary hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">star</span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecipeDetails;
