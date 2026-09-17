import React, { useState, useEffect } from 'react';
import { getNutritionSummary } from '../services/nutrition';
import GlassCard from '../components/ui/GlassCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const macroColors = {
  protein: 'bg-tertiary',
  carbs: 'bg-secondary',
  fat: 'bg-primary',
  calories: 'bg-gradient-to-r from-primary to-secondary',
};

export const NutritionAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getNutritionSummary('30d');
        setStats(data);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (!stats) return null;

  const totalRecipes = stats.total_recipes_generated || 0;
  const avgCalories = Math.round(stats.avg_calories || 0);
  const avgProtein = Math.round(stats.avg_protein || 0);
  const avgCarbs = Math.round(stats.avg_carbs || 0);
  const avgFat = Math.round(stats.avg_fat || 0);

  const macroStats = [
    { label: 'Avg. Calories', value: `${avgCalories} kcal`, target: '2,200 kcal', pct: Math.min(100, (avgCalories / 2200) * 100), color: macroColors.calories },
    { label: 'Avg. Protein', value: `${avgProtein}g`, target: '120g', pct: Math.min(100, (avgProtein / 120) * 100), color: macroColors.protein },
    { label: 'Avg. Carbs', value: `${avgCarbs}g`, target: '280g', pct: Math.min(100, (avgCarbs / 280) * 100), color: macroColors.carbs },
    { label: 'Avg. Fat', value: `${avgFat}g`, target: '80g', pct: Math.min(100, (avgFat / 80) * 100), color: macroColors.fat },
  ];

  const weeklyActivity = stats.calories_over_time?.slice(-7).map(d => ({
    day: new Date(d.date).toLocaleDateString('en-US', {weekday: 'short'}),
    calories: Math.round(d.calories),
    meals: 1 // We can just mock meals to 1 for the graph
  })) || [];
  const maxCal = Math.max(...weeklyActivity.map(d => d.calories), 2000);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface">Nutrition Analytics</h1>
        <p className="text-on-surface-variant font-body-md">Track your nutritional habits and cooking patterns</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({length: 4}).map((_, i) => <SkeletonLoader key={i} />)}
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Recipes Generated', value: totalRecipes, icon: 'auto_awesome', color: 'text-primary' },
              { label: 'Top Cuisine', value: stats.most_common_cuisine || 'N/A', icon: 'restaurant', color: 'text-secondary' },
              { label: 'Avg. Calories', value: `${avgCalories}`, icon: 'local_fire_department', color: 'text-tertiary' },
              { label: 'Common Diff.', value: stats.most_common_difficulty || 'N/A', icon: 'trending_up', color: 'text-primary-container' },
            ].map(s => (
              <GlassCard key={s.label} className="!p-5 text-center space-y-2">
                <span className={`material-symbols-outlined text-3xl ${s.color}`} style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
                <div className={`font-headline-md text-headline-md ${s.color}`}>{s.value}</div>
                <div className="font-label-sm text-on-surface-variant">{s.label}</div>
              </GlassCard>
            ))}
          </div>

          {/* Macro Breakdown */}
          <GlassCard>
            <h2 className="font-headline-md text-on-surface mb-6">Average Daily Macros</h2>
            <div className="space-y-5">
              {macroStats.map(m => (
                <div key={m.label}>
                  <div className="flex justify-between mb-2">
                    <span className="font-label-md text-on-surface">{m.label}</span>
                    <span className="font-label-md text-on-surface-variant">{m.value} <span className="text-outline">/ {m.target}</span></span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full transition-all duration-700`} style={{width: `${m.pct}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Weekly Activity Chart */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-on-surface">Weekly Activity</h2>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label-sm">This Week</span>
            </div>
            <div className="flex items-end justify-between h-48 gap-3">
              {weeklyActivity.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <span className="font-label-sm text-on-surface-variant">{d.calories}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary-container to-secondary hover:from-primary hover:to-secondary-container transition-all cursor-pointer shadow-lg shadow-primary/10"
                    style={{height: `${(d.calories / maxCal) * 100}%`}}
                    title={`${d.meals} meals`}
                  ></div>
                  <span className="font-label-sm text-on-surface-variant">{d.day}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Cuisine Distribution */}
          <GlassCard>
            <h2 className="font-headline-md text-on-surface mb-6">Top Cuisine Types</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.dietary_breakdown || {}).map(([name, count]) => (
                <div key={name} className="flex items-center gap-3 bg-surface-container/50 px-4 py-3 rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-colors">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <div className="font-label-md text-on-surface capitalize">{name}</div>
                    <div className="font-label-sm text-primary">{count} recipes</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default NutritionAnalytics;
