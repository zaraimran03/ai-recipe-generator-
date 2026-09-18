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
  const [expandedId, setExpandedId] = useState(null);
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
      addToast('Recipe preserved successfully!', 'success');
      setNewRecipeText('');
      loadRecipes();
    } catch { addToast('Failed to preserve recipe', 'error'); }
    finally { setPreserving(false); }
  };

  const handleModernize = async (id) => {
    setModernizingId(id);
    try {
      const newRecipe = await modernizeFamilyRecipe(id, 'Make it healthier and reduce cooking time');
      addToast('Modernized version created!', 'success');
      navigate(`/recipe/${newRecipe.id || newRecipe._id}`);
    } catch { addToast('Failed to modernize recipe', 'error'); }
    finally { setModernizingId(null); }
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="font-headline-xl text-headline-xl text-on-surface">
            Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Recipe Vault</span>
          </h1>
          <p className="text-on-surface-variant font-body-md max-w-lg">
            Preserve your grandmother's handwritten recipes. Our AI will structure them for you — without changing the soul of the dish.
          </p>
        </div>

        {/* Preserve Form */}
        <GlassCard className="relative overflow-hidden">
          {/* Decorative icon */}
          <div className="absolute -top-4 -right-4 opacity-[0.04]">
            <span className="material-symbols-outlined text-[160px] text-primary" style={{fontVariationSettings:"'FILL' 1"}}>menu_book</span>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">edit_note</span>
              </div>
              <div>
                <h2 className="font-headline-md text-on-surface">Preserve a Recipe</h2>
                <p className="text-on-surface-variant text-xs">Paste raw text — AI will structure it without inventing measurements</p>
              </div>
            </div>

            <textarea
              value={newRecipeText}
              onChange={(e) => setNewRecipeText(e.target.value)}
              rows={5}
              className="w-full p-4 bg-surface-container-highest/30 border border-outline-variant/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline resize-none transition-all mb-4"
              placeholder={"Paste your family recipe here...\n\nExample: \"Take some oil in a pan, add cumin seeds, when they splutter add chopped onions. Cook until golden brown, then add tomatoes and salt. Add turmeric and red chili. When oil separates, add soaked dal and water. Pressure cook for 3 whistles.\""}
            />

            <div className="flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">
                {newRecipeText.length > 0 && `${newRecipeText.length} characters`}
              </span>
              <Button variant="primary" onClick={handlePreserve} disabled={preserving || !newRecipeText.trim()}>
                {preserving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Preserving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                    Structure & Preserve
                  </>
                )}
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Recipes List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-outline-variant/20 rounded w-1/3 mb-4" />
                <div className="h-24 bg-outline-variant/10 rounded-xl" />
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <GlassCard className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-20 mb-4 block">menu_book</span>
            <h2 className="font-headline-md text-on-surface mb-2">No Family Recipes Yet</h2>
            <p className="text-on-surface-variant font-body-md max-w-sm mx-auto">
              Paste a raw recipe above to get started. We'll structure it and keep both versions safe.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-on-surface">Preserved Recipes ({recipes.length})</h2>
            </div>

            {recipes.map(recipe => {
              const structured = recipe.structuredRecipe;
              const isExpanded = expandedId === recipe._id;

              return (
                <GlassCard key={recipe._id} className="!p-0 overflow-hidden">
                  {/* Card Header */}
                  <div
                    className="p-6 cursor-pointer hover:bg-surface-container/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : recipe._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-headline-sm text-on-surface truncate">
                            {structured?.title || 'Untitled Recipe'}
                          </h3>
                          <p className="text-on-surface-variant text-label-sm mt-1 line-clamp-1">
                            {structured?.summary || recipe.originalText?.substring(0, 100) + '...'}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            {structured?.metadata?.cuisine && (
                              <span className="text-label-sm text-primary flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">public</span>
                                {structured.metadata.cuisine}
                              </span>
                            )}
                            {structured?.ingredients?.length > 0 && (
                              <span className="text-label-sm text-on-surface-variant">
                                {structured.ingredients.length} ingredients
                              </span>
                            )}
                            {structured?.instructions?.length > 0 && (
                              <span className="text-label-sm text-on-surface-variant">
                                {structured.instructions.length} steps
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-outline-variant/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-outline-variant/10">
                        {/* Left: Original Text */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">history_edu</span>
                            <h4 className="font-label-md text-on-surface-variant uppercase tracking-wider text-xs">Original Text</h4>
                          </div>
                          <div className="p-4 bg-surface-container/50 rounded-xl text-on-surface-variant font-body-sm whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                            {recipe.originalText}
                          </div>
                        </div>

                        {/* Right: Structured Recipe */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-sm text-primary">auto_fix_high</span>
                            <h4 className="font-label-md text-primary uppercase tracking-wider text-xs">AI Structured</h4>
                          </div>
                          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                            {/* Ingredients */}
                            <div>
                              <h5 className="font-label-sm text-on-surface-variant mb-2 uppercase tracking-wide text-[10px]">Ingredients</h5>
                              <div className="space-y-1.5">
                                {structured?.ingredients?.map((ing, i) => (
                                  <div key={i} className="flex items-center gap-2 text-on-surface-variant font-body-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    <span>
                                      <span className="text-on-surface font-medium">{ing.quantity} {ing.unit}</span> {ing.name}
                                      {ing.isPantryStaple && <span className="ml-1 text-[9px] text-secondary uppercase">(pantry)</span>}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Steps */}
                            {structured?.instructions?.length > 0 && (
                              <div>
                                <h5 className="font-label-sm text-on-surface-variant mb-2 uppercase tracking-wide text-[10px]">Steps</h5>
                                <ol className="space-y-2">
                                  {structured.instructions.map((step, i) => (
                                    <li key={i} className="flex gap-2 text-on-surface-variant font-body-sm">
                                      <span className="text-primary font-bold shrink-0 text-xs mt-0.5">{step.stepNumber || i+1}.</span>
                                      <span>{step.instruction}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Nutrition */}
                            {structured?.nutrition && (
                              <div className="flex gap-3 pt-2">
                                {[
                                  { label: 'Cal', val: structured.nutrition.calories, color: 'text-primary' },
                                  { label: 'Pro', val: `${structured.nutrition.protein}g`, color: 'text-tertiary' },
                                  { label: 'Carb', val: `${structured.nutrition.carbs}g`, color: 'text-secondary' },
                                  { label: 'Fat', val: `${structured.nutrition.fat}g`, color: 'text-primary' },
                                ].map(n => (
                                  <div key={n.label} className="px-3 py-2 bg-surface-container/50 rounded-lg text-center flex-1">
                                    <div className={`font-label-md font-bold ${n.color}`}>{n.val}</div>
                                    <div className="text-[9px] text-on-surface-variant uppercase">{n.label}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Tips */}
                            {structured?.tips?.length > 0 && (
                              <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                                <h5 className="font-label-sm text-primary mb-1 text-[10px] uppercase">AI Notes</h5>
                                {structured.tips.map((tip, i) => (
                                  <p key={i} className="text-on-surface-variant font-body-sm text-xs leading-relaxed">• {tip}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="px-6 py-4 border-t border-outline-variant/10 bg-surface-container/20 flex items-center justify-end gap-3">
                        <Button
                          variant="secondary"
                          className="!py-2 !px-4 !text-sm"
                          onClick={() => handleModernize(recipe._id)}
                          disabled={modernizingId === recipe._id}
                        >
                          {modernizingId === recipe._id ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
                              Modernizing...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-base">upgrade</span>
                              Modernize
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default FamilyRecipes;
