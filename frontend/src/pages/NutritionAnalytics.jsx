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

const RANGES = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'All Time', value: 'all' },
];

export const NutritionAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getNutritionSummary(range);
        setStats(data);
      } catch (e) {
        console.error('Nutrition fetch error:', e);
        setStats(null);
      } finally { setLoading(false); }
    };
    load();
  }, [range]);

  const totalRecipes = stats?.total_recipes_generated || 0;
  const avgCalories = Math.round(stats?.avg_calories || 0);
  const avgProtein = Math.round(stats?.avg_protein || 0);
  const avgCarbs = Math.round(stats?.avg_carbs || 0);
  const avgFat = Math.round(stats?.avg_fat || 0);

  const macroStats = [
    { label: 'Avg. Calories', value: `${avgCalories} kcal`, target: '2,200 kcal', pct: Math.min(100, (avgCalories / 2200) * 100), color: macroColors.calories },
    { label: 'Avg. Protein', value: `${avgProtein}g`, target: '120g', pct: Math.min(100, (avgProtein / 120) * 100), color: macroColors.protein },
    { label: 'Avg. Carbs', value: `${avgCarbs}g`, target: '280g', pct: Math.min(100, (avgCarbs / 280) * 100), color: macroColors.carbs },
    { label: 'Avg. Fat', value: `${avgFat}g`, target: '80g', pct: Math.min(100, (avgFat / 80) * 100), color: macroColors.fat },
  ];

  const weeklyActivity = stats?.calories_over_time?.slice(-7).map(d => ({
    day: new Date(d.date).toLocaleDateString('en-US', {weekday: 'short'}),
    calories: Math.round(d.calories),
    meals: d.meals || 1
  })) || [];
  const maxCal = Math.max(...weeklyActivity.map(d => d.calories), 500);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Nutrition Analytics</h1>
          <p className="text-on-surface-variant font-body-md">Track your nutritional habits and cooking patterns</p>
        </div>
        {/* Range Selector */}
        <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit">
          {RANGES.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all ${range === r.value ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({length: 4}).map((_, i) => <SkeletonLoader key={i} />)}
        </div>
      ) : totalRecipes === 0 ? (
        /* Empty State */
        <GlassCard className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-30 mb-4 block">analytics</span>
          <h2 className="font-headline-md text-on-surface mb-2">No Data Yet</h2>
          <p className="text-on-surface-variant font-body-md max-w-md mx-auto">
            Generate some recipes first! Your nutritional data from AI-generated recipes will appear here automatically.
          </p>
        </GlassCard>
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
            <h2 className="font-headline-md text-on-surface mb-6">Average Macros per Recipe</h2>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Activity Chart */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-md text-on-surface">Recent Activity</h2>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label-sm">Last {weeklyActivity.length} days</span>
              </div>
              {weeklyActivity.length > 0 ? (
                <div className="flex items-end justify-between h-48 gap-3">
                  {weeklyActivity.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <span className="font-label-sm text-on-surface-variant">{d.calories}</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary-container to-secondary hover:from-primary hover:to-secondary-container transition-all cursor-pointer shadow-lg shadow-primary/10"
                        style={{height: `${Math.max((d.calories / maxCal) * 100, 5)}%`}}
                        title={`${d.meals} meal(s) — ${d.calories} kcal`}
                      ></div>
                      <span className="font-label-sm text-on-surface-variant">{d.day}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant text-center py-8">No activity data for this period.</p>
              )}
            </GlassCard>

            {/* Totals Summary */}
            <GlassCard>
              <h2 className="font-headline-md text-on-surface mb-6">Period Totals</h2>
              <div className="space-y-4">
                {[
                  { label: 'Total Calories', value: `${Math.round(stats.total_calories || 0).toLocaleString()} kcal`, icon: 'local_fire_department', color: 'text-primary' },
                  { label: 'Total Protein', value: `${Math.round(stats.total_protein || 0)}g`, icon: 'fitness_center', color: 'text-tertiary' },
                  { label: 'Total Carbs', value: `${Math.round(stats.total_carbs || 0)}g`, icon: 'grain', color: 'text-secondary' },
                  { label: 'Total Fat', value: `${Math.round(stats.total_fat || 0)}g`, icon: 'water_drop', color: 'text-primary' },
                ].map(t => (
                  <div key={t.label} className="flex items-center justify-between p-3 bg-surface-container/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined ${t.color}`}>{t.icon}</span>
                      <span className="font-label-md text-on-surface">{t.label}</span>
                    </div>
                    <span className={`font-label-md font-bold ${t.color}`}>{t.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Dietary / Cuisine Tags */}
          <GlassCard>
            <h2 className="font-headline-md text-on-surface mb-6">Recipe Tags</h2>
            {Object.keys(stats.dietary_breakdown || {}).length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.dietary_breakdown).sort((a,b) => b[1] - a[1]).map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3 bg-surface-container/50 px-4 py-3 rounded-xl border border-outline-variant/10 hover:border-primary/20 transition-colors">
                    <span className="text-2xl">🍽️</span>
                    <div>
                      <div className="font-label-md text-on-surface capitalize">{name}</div>
                      <div className="font-label-sm text-primary">{count} recipe{count > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-center py-4">No tag data available yet.</p>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default NutritionAnalytics;
