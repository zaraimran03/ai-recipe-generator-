import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRecipe, getPantry } from '../services/recipe';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import VoiceInputButton from '../components/ui/VoiceInputButton';

// Custom stepper control — no native spinner arrows
const Stepper = ({ label, unit, value, min, max, step, onChange }) => (
  <div className="space-y-2">
    <label className="font-label-md text-on-surface-variant block">{label}</label>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface hover:bg-primary/10 hover:border-primary/40 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
      >
        <span className="material-symbols-outlined text-[18px]">remove</span>
      </button>
      <div className="flex-1 flex items-baseline justify-center gap-1.5 bg-surface-container rounded-xl px-3 py-3 border border-outline-variant/20">
        <span className="font-title-md text-on-surface text-lg tabular-nums">{value}</span>
        <span className="text-label-sm text-on-surface-variant">{unit}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface hover:bg-primary/10 hover:border-primary/40 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
      </button>
    </div>
  </div>
);

const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Paleo', 'Low Carb', 'High Protein', 'Dairy-Free'];
const cuisineOptions = ['Any', 'Desi / South Asian', 'Italian', 'Mexican', 'Mediterranean', 'East Asian', 'Middle Eastern'];

export const GenerateRecipe = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [selectedDiet, setSelectedDiet] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('Any');
  const [generating, setGenerating] = useState(false);
  
  // Pantry Selection State
  const [pantryItems, setPantryItems] = useState([]);
  const [selectedPantry, setSelectedPantry] = useState([]);
  const [strictPantryMode, setStrictPantryMode] = useState(false);

  React.useEffect(() => {
    getPantry().then(setPantryItems).catch(console.error);
  }, []);

  // Stepper state — managed independently from react-hook-form
  const [maxTime, setMaxTime] = useState(30);
  const [calories, setCalories] = useState(500);
  const [servings, setServings] = useState(2);

  const addIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      setIngredients(prev => [...prev, ingredientInput.trim()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (item) => setIngredients(prev => prev.filter(i => i !== item));
  const toggleDiet = (d) => setSelectedDiet(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const togglePantryItem = (id) => setSelectedPantry(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const onSubmit = async () => {
    setGenerating(true);
    try {
      const recipe = await generateRecipe({
        ingredients: ingredients.join(', '),
        preferences: selectedDiet,
        cuisine: selectedCuisine,
        maxTime,
        calories,
        servings,
        cooking_time: maxTime,
        strictPantryMode,
        pantryIngredients: pantryItems.filter(i => selectedPantry.includes(i._id)),
      });
      navigate(`/recipe/${recipe.id}`, { state: { fromGenerate: true } });
    } catch (e) {
      console.error(e);
      setGenerating(false);
    }
  };


  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-surface-container-high flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-t-primary border-r-secondary border-b-transparent border-l-transparent animate-spin absolute inset-0"></div>
            <span className="material-symbols-outlined text-primary text-5xl" style={{fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
          </div>
          <span className="sparkle-ai material-symbols-outlined text-primary text-2xl" style={{top:'-8px', left:'50%'}}>colors_spark</span>
          <span className="sparkle-ai material-symbols-outlined text-secondary text-lg" style={{bottom:'-8px', right:'10%', animationDelay:'1s'}}>colors_spark</span>
        </div>
        <div className="space-y-3">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Crafting Your Recipe...</h2>
          <p className="text-on-surface-variant font-body-md max-w-md">Our AI is analyzing your ingredients, balancing nutrition, and writing the perfect instructions for you.</p>
        </div>
        <div className="flex gap-2">
          {['Analyzing ingredients', 'Balancing nutrition', 'Writing instructions'].map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2 opacity-70" style={{animationDelay: `${i * 0.3}s`}}>
              <div className="shimmer-bg h-1.5 w-24 rounded-full"></div>
              <span className="text-label-sm text-on-surface-variant text-[10px]">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
          <span className="material-symbols-outlined text-primary text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
          <span className="text-label-md text-primary">AI Recipe Generator</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface">
          What's in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">fridge?</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant">Tell us what you have and we'll craft the perfect recipe.</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        {/* Ingredients */}
        <GlassCard>
          <h3 className="font-headline-md text-on-surface mb-4">Ingredients</h3>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center bg-surface-container rounded-xl border border-outline-variant/20 focus-within:ring-2 focus-within:ring-primary/30 transition-all pr-2">
              <input
                value={ingredientInput}
                onChange={e => setIngredientInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                placeholder="e.g. chicken, spinach, garlic..."
                className="flex-1 bg-transparent px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />
              <VoiceInputButton 
                size="md"
                onTranscript={(text, isFinal) => {
                  setIngredientInput(text);
                }} 
              />
            </div>
            <Button type="button" variant="primary" onClick={addIngredient} className="!px-5 shrink-0">
              <span className="material-symbols-outlined">add</span>
            </Button>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map(ing => (
                <span key={ing} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-label-sm">
                  {ing}
                  <button type="button" onClick={() => removeIngredient(ing)} className="material-symbols-outlined text-[14px] hover:text-error ml-1">close</button>
                </span>
              ))}
            </div>
          )}

          {pantryItems.length > 0 && (
            <div className="mt-6 pt-4 border-t border-outline-variant/10">
              <h4 className="font-label-md text-on-surface mb-3">Select from My Pantry</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {pantryItems.map(item => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => togglePantryItem(item._id)}
                    className={`px-3 py-1.5 rounded-full text-label-sm border transition-all flex items-center gap-1.5 ${
                      selectedPantry.includes(item._id)
                        ? 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_8px_rgba(255,200,160,0.2)]'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-secondary/40 hover:text-secondary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{selectedPantry.includes(item._id) ? 'check' : 'add'}</span>
                    {item.name}
                  </button>
                ))}
              </div>
              <div className={`mt-2 flex items-center justify-between rounded-xl p-4 border transition-colors ${strictPantryMode ? 'bg-primary/5 border-primary/30' : 'bg-surface-container-high/50 border-outline-variant/10'}`}>
                <div className="flex gap-3 items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${strictPantryMode ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <div>
                    <h5 className={`font-label-md transition-colors ${strictPantryMode ? 'text-primary font-bold' : 'text-on-surface'}`}>Use ONLY Selected Pantry Items</h5>
                    <p className="text-xs text-on-surface-variant mt-0.5">Strictly restricts AI to selected pantry items (ignores others)</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStrictPantryMode(!strictPantryMode)}
                  className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 shadow-inner ${strictPantryMode ? 'bg-primary shadow-[0_0_10px_rgba(255,180,163,0.3)]' : 'bg-surface-container-highest'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-md ${strictPantryMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Cuisine Preferences */}
        <GlassCard>
          <h3 className="font-headline-md text-on-surface mb-4">Cuisine Type</h3>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.map(c => (
              <button
                key={c} type="button"
                onClick={() => setSelectedCuisine(c)}
                className={`px-4 py-2 rounded-full text-label-sm border transition-all ${
                  selectedCuisine === c
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(255,180,163,0.2)]'
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary'
                }`}
              >{c}</button>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="font-headline-md text-on-surface mb-4">Dietary Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map(d => (
              <button
                key={d} type="button"
                onClick={() => toggleDiet(d)}
                className={`px-4 py-2 rounded-full text-label-sm border transition-all ${
                  selectedDiet.includes(d)
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(255,180,163,0.2)]'
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary'
                }`}
              >{d}</button>
            ))}
          </div>
        </GlassCard>

        {/* Parameters */}
        <GlassCard>
          <h3 className="font-headline-md text-on-surface mb-4">Recipe Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Max Cooking Time', unit: 'mins',   min: 10,  max: 120,  step: 5,  value: maxTime,  setter: setMaxTime  },
              { label: 'Target Calories',  unit: 'kcal',   min: 200, max: 2000, step: 50, value: calories, setter: setCalories },
              { label: 'Servings',         unit: 'people', min: 1,   max: 10,   step: 1,  value: servings, setter: setServings },
            ].map(f => (
              <Stepper
                key={f.label}
                label={f.label}
                unit={f.unit}
                min={f.min}
                max={f.max}
                step={f.step}
                value={f.value}
                onChange={f.setter}
              />
            ))}
          </div>
        </GlassCard>

        <Button type="submit" variant="primary" className="w-full !py-4 !text-base !rounded-xl">
          <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
          Generate My Recipe
        </Button>
      </form>
    </div>
  );
};

export default GenerateRecipe;
