import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecipes, getFavorites, deleteFavorite, deleteRecipe } from '../services/recipe';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { useToast, Toast } from '../components/ui/Toast';

const TABS = ['All Recipes', 'Favorites', 'History'];

export const SavedRecipes = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All Recipes');
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [r, f] = await Promise.all([getRecipes(), getFavorites()]);
      setRecipes(r);
      setFavorites(f);
    } catch (e) { addToast('Failed to load recipes', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const displayed = (tab === 'Favorites' ? favorites : recipes)
    .filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  const handleDeleteFav = async (recipeId, e) => {
    e.stopPropagation();
    await deleteFavorite(recipeId);
    addToast('Removed from favorites', 'info');
    load();
  };

  const handleDeleteRecipe = async (recipeId, e) => {
    e.stopPropagation();
    await deleteRecipe(recipeId);
    addToast('Recipe deleted', 'info');
    load();
  };

  const isFav = (id) => favorites.some(f => f.id === id);

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Saved Recipes</h1>
            <p className="text-on-surface-variant font-body-md">Your culinary collection</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/generate')}>
            <span className="material-symbols-outlined">add</span>New Recipe
          </Button>
        </div>

        {/* Search + Tabs */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2 bg-surface-container-high rounded-full px-4 py-2.5 border border-outline-variant/20 flex-1 max-w-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
            <input
              className="bg-transparent outline-none text-label-md text-on-surface placeholder:text-on-surface-variant/50 w-full"
              placeholder="Search recipes..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl">
            {TABS.map(t => (
              <button
                key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${tab === t ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({length: 4}).map((_, i) => <SkeletonLoader key={i} type="card"/>)
          ) : displayed.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-24 gap-4 text-center">
              <span className="material-symbols-outlined text-on-surface-variant text-6xl">restaurant</span>
              <h3 className="font-headline-md text-on-surface">No recipes found</h3>
              <p className="text-on-surface-variant">Try a different search or generate a new recipe.</p>
              <Button variant="primary" onClick={() => navigate('/generate')}>Generate Recipe</Button>
            </div>
          ) : displayed.map(recipe => (
            <div
              key={recipe.id}
              className="glass-card rounded-lg overflow-hidden flex flex-col group cursor-pointer"
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            >
              <div className="h-48 overflow-hidden relative bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[64px] text-primary opacity-50 absolute">restaurant</span>
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  {isFav(recipe.id) && (
                    <button onClick={(e) => handleDeleteFav(recipe.id, e)} className="w-8 h-8 bg-background/60 backdrop-blur-md rounded-full flex items-center justify-center text-primary hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>favorite</span>
                    </button>
                  )}
                  {tab === 'All Recipes' && (
                    <button onClick={(e) => handleDeleteRecipe(recipe.id, e)} className="w-8 h-8 bg-background/60 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:scale-110 transition-all">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-background/60 backdrop-blur-md rounded-lg text-primary text-[10px] font-bold">{recipe.difficulty?.toUpperCase()}</div>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h4 className="font-label-md text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-2 z-10 relative">{recipe.title}</h4>
                <p className="font-label-sm text-on-surface-variant mt-auto pt-2 z-10 relative">{recipe.time} mins • {recipe.nutrition?.calories || 0} kcal</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SavedRecipes;
