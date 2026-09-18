import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFamilyRecipes, createFamilyRecipe, modernizeFamilyRecipe } from '../services/familyRecipe';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { useToast, Toast } from '../components/ui/Toast';

export const FamilyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRecipeText, setNewRecipeText] = useState('');
  const [preserving, setPreserving] = useState(false);
  const [modernizingId, setModernizingId] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const loadRecipes = async () => {
    try {
      const data = await getFamilyRecipes();
      setRecipes(data);
    } catch { addToast('Could not load family recipes', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadRecipes(); }, []);

  const handlePreserve = async () => {
    if (!newRecipeText.trim()) return;
    setPreserving(true);
    try {
      await createFamilyRecipe(newRecipeText);
      addToast('Recipe preserved!', 'success');
      setNewRecipeText('');
      loadRecipes();
    } catch { addToast('Failed to preserve recipe', 'error'); }
    finally { setPreserving(false); }
  };

  const handleModernize = async (id) => {
    setModernizingId(id);
    try {
      // Just a simple default modernization option for the demo
      const newRecipe = await modernizeFamilyRecipe(id, "Make it healthier and reduce cooking time");
      addToast('Modernized version created!', 'success');
      navigate(`/recipe/${newRecipe.id || newRecipe._id}`);
    } catch { addToast('Failed to modernize recipe', 'error'); }
    finally { setModernizingId(null); }
  };

  if (loading) return <div className="animate-pulse">Loading family legacy...</div>;

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Family Recipes</h1>
          <p className="text-on-surface-variant font-body-md">Preserve your grandmother's recipes with AI.</p>
        </div>

        <GlassCard>
          <h2 className="font-headline-md text-on-surface mb-4">Preserve a Recipe</h2>
          <textarea 
            value={newRecipeText}
            onChange={(e) => setNewRecipeText(e.target.value)}
            className="w-full h-32 p-4 bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface mb-4"
            placeholder="Type or paste the raw recipe here (e.g., 'Take some oil, add onions until brown...')"
          />
          <Button variant="primary" onClick={handlePreserve} disabled={preserving || !newRecipeText.trim()}>
            {preserving ? 'Preserving...' : 'Structure & Preserve'}
          </Button>
        </GlassCard>

        <div className="space-y-6">
          {recipes.map(recipe => (
            <GlassCard key={recipe._id} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-headline-sm text-on-surface mb-2">Original Text</h3>
                <div className="p-4 bg-surface-container rounded-xl text-on-surface-variant font-body-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {recipe.originalText}
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-on-surface mb-2">Structured Recipe</h3>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-on-surface-variant font-body-sm flex-1 overflow-y-auto max-h-64 mb-4">
                  <h4 className="font-bold text-primary mb-2">{recipe.structuredRecipe?.title}</h4>
                  <ul className="list-disc pl-4 mb-4">
                    {recipe.structuredRecipe?.ingredients?.map((ing, i) => (
                      <li key={i}>{ing.quantity} {ing.unit} {ing.name}</li>
                    ))}
                  </ul>
                </div>
                <Button variant="secondary" onClick={() => handleModernize(recipe._id)} disabled={modernizingId === recipe._id}>
                  {modernizingId === recipe._id ? 'Modernizing...' : 'Modernize Recipe'}
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </>
  );
};

export default FamilyRecipes;
