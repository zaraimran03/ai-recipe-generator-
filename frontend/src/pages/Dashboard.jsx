import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRecipes, getFavorites, getRecommendations } from '../services/recipe';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const weekDays = [
  { day: 'M', height: 40 }, { day: 'T', height: 65 }, { day: 'W', height: 55 },
  { day: 'T', height: 90 }, { day: 'F', height: 70 }, { day: 'S', height: 100, active: true }, { day: 'S', height: 30 }
];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRecommendations();
        setRecipes(data.slice(0, 4));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-headline-xl text-headline-xl text-on-surface">
            Welcome back, <span className="text-primary-container">{user?.name || user?.username || 'Chef'}</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-xl">
            What are we cooking today? Your AI assistant has 3 new seasonal recommendations.
          </p>
        </div>
        <div className="flex gap-4">
          <GlassCard className="!p-4 flex flex-col items-center justify-center text-center min-w-[90px]">
            <span className="font-headline-md text-headline-md text-primary">{recipes.length}</span>
            <span className="font-label-sm text-on-surface-variant">Saved Recipes</span>
          </GlassCard>
          <GlassCard className="!p-4 flex flex-col items-center justify-center text-center min-w-[90px]">
            <span className="font-headline-md text-headline-md text-secondary">4.8</span>
            <span className="font-label-sm text-on-surface-variant">Avg. Score</span>
          </GlassCard>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Quick AI Generator */}
        <GlassCard className="col-span-1 md:col-span-8 !p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[120px] text-primary" style={{fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
          </div>
          <div className="relative z-10">
            <h3 className="font-headline-md text-on-surface mb-2">Magic Recipe Generator</h3>
            <p className="font-body-md text-on-surface-variant mb-6 max-w-md">Type what's in your fridge or a craving, and let AI do the rest.</p>
            <div className="flex flex-col gap-4">
              <div className="w-full bg-surface-container rounded-2xl border-none p-4 font-body-md text-on-surface-variant min-h-[60px] text-sm cursor-pointer hover:bg-surface-container-high transition-colors"
                onClick={() => navigate('/generate')}>
                Ingredients like salmon, miso, asparagus... or 'Something spicy for dinner'
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-full border border-outline-variant/30 text-label-sm text-on-surface-variant">Vegan</span>
                <span className="px-4 py-2 rounded-full border border-outline-variant/30 text-label-sm text-on-surface-variant">Gluten-free</span>
                <span className="px-4 py-2 rounded-full border border-outline-variant/30 text-label-sm text-on-surface-variant">Low Carb</span>
                <Button variant="primary" className="ml-auto !px-8 !py-2 !rounded-full" onClick={() => navigate('/generate')}>Generate Recipe</Button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Nutrition Summary */}
        <GlassCard className="col-span-1 md:col-span-4 !p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md text-on-surface mb-6">Nutrition Focus</h3>
            <div className="space-y-6">
              {[
                { label: 'Calories', value: '1,840 / 2,200', color: 'bg-gradient-to-r from-primary to-secondary', pct: '83%' },
                { label: 'Proteins', value: '92g / 120g', color: 'bg-tertiary', pct: '76%' },
                { label: 'Carbs', value: '210g / 280g', color: 'bg-secondary', pct: '75%' },
              ].map(n => (
                <div key={n.label}>
                  <div className="flex justify-between mb-2">
                    <span className="font-label-md text-on-surface">{n.label}</span>
                    <span className="font-label-md text-primary">{n.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${n.color} rounded-full`} style={{width: n.pct}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link to="/nutrition" className="mt-8 pt-6 border-t border-outline-variant/10 text-primary text-label-md hover:underline block">
            View Full Report →
          </Link>
        </GlassCard>

        {/* Recent Recipes */}
        <div className="col-span-1 md:col-span-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-on-surface">Recent Masterpieces</h3>
            <Link to="/saved" className="text-primary text-label-md hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({length: 3}).map((_, i) => <SkeletonLoader key={i} type="card" />)
            ) : (
              recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="glass-card rounded-lg overflow-hidden flex flex-col group cursor-pointer"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  <div className="h-48 overflow-hidden relative bg-gradient-to-tr from-primary-container to-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[64px] text-primary opacity-50" style={{fontVariationSettings: "'FILL' 1"}}>restaurant</span>
                    <div className="absolute top-4 right-4 px-2 py-1 bg-background/60 backdrop-blur-md rounded-lg text-primary text-[10px] font-bold">{recipe.difficulty?.toUpperCase()}</div>
                  </div>
                  <div className="p-4 flex-grow">
                    <h4 className="font-label-md text-on-surface mb-1 group-hover:text-primary transition-colors">{recipe.title}</h4>
                    <p className="font-label-sm text-on-surface-variant">{recipe.time} mins • {recipe.nutrition?.calories || 0} kcal</p>
                  </div>
                </div>
              ))
            )}
            {/* Add New Card */}
            <div
              className="border-2 border-dashed border-outline-variant/30 rounded-lg flex flex-col items-center justify-center p-6 group cursor-pointer hover:border-primary-container transition-all"
              onClick={() => navigate('/generate')}
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-4 group-hover:bg-primary-container group-hover:text-on-primary-container transition-all">
                <span className="material-symbols-outlined text-[32px]">add</span>
              </div>
              <p className="font-label-md text-on-surface-variant">New Creation</p>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <GlassCard className="col-span-1 md:col-span-12 lg:col-span-5 !p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>lightbulb</span>
            <h3 className="font-headline-md text-on-surface">AI Kitchen Intelligence</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-container/50 border border-border-subtle/5 p-4 rounded-xl flex gap-4 hover:bg-surface-container transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">warning</span>
              </div>
              <div>
                <h5 className="font-label-md text-on-surface">Spinach expiring soon</h5>
                <p className="font-label-sm text-on-surface-variant">Try making a Spinach & Feta frittata for tomorrow's breakfast.</p>
              </div>
            </div>
            <div className="bg-surface-container/50 border border-border-subtle/5 p-4 rounded-xl flex gap-4 hover:bg-surface-container transition-colors">
              <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-tertiary">eco</span>
              </div>
              <div>
                <h5 className="font-label-md text-on-surface">Meatless Monday</h5>
                <p className="font-label-sm text-on-surface-variant">Your protein intake is high. Consider a plant-based alternative today.</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Cooking Streak */}
        <GlassCard className="col-span-1 md:col-span-12 lg:col-span-7 !p-8 bg-gradient-to-br from-primary-container/10 to-transparent">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-on-surface">Cooking Streak</h3>
            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label-sm">7 Days 🔥</span>
          </div>
          <div className="flex items-end justify-between h-40 gap-2">
            {weekDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <div
                  className={`w-full rounded-t-lg transition-all ${d.active ? 'bg-primary-container shadow-[0_0_20px_rgba(255,126,95,0.4)]' : 'bg-surface-container-high hover:bg-primary-container/50'}`}
                  style={{height: `${d.height}%`}}
                ></div>
                <span className={`font-label-sm ${d.active ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
