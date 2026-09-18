const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Recipe = require('../models/Recipe');

router.use(authMiddleware);

router.get('/summary/', async (req, res) => {
  try {
    const range = req.query.range || '30d';

    let startDate = new Date();
    if (range === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (range === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (range === '90d') startDate.setDate(startDate.getDate() - 90);
    else startDate = new Date(2000, 0, 1); // all time

    const recipes = await Recipe.find({
      user: req.user.id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    const total = recipes.length;

    // --- Macro Averages ---
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    recipes.forEach(r => {
      if (r.nutrition) {
        totalCalories += r.nutrition.calories || 0;
        totalProtein  += r.nutrition.protein  || 0;
        totalCarbs    += r.nutrition.carbs    || 0;
        totalFat      += r.nutrition.fat      || 0;
      }
    });

    const avg_calories = total > 0 ? totalCalories / total : 0;
    const avg_protein  = total > 0 ? totalProtein  / total : 0;
    const avg_carbs    = total > 0 ? totalCarbs    / total : 0;
    const avg_fat      = total > 0 ? totalFat      / total : 0;

    // --- Calories Over Time (group by date) ---
    const calByDate = {};
    recipes.forEach(r => {
      const dateKey = new Date(r.createdAt).toISOString().split('T')[0];
      if (!calByDate[dateKey]) calByDate[dateKey] = { calories: 0, count: 0 };
      calByDate[dateKey].calories += r.nutrition?.calories || 0;
      calByDate[dateKey].count += 1;
    });
    const calories_over_time = Object.entries(calByDate).map(([date, v]) => ({
      date,
      calories: v.calories,
      meals: v.count,
    }));

    // --- Most Common Cuisine ---
    const cuisineCounts = {};
    recipes.forEach(r => {
      const c = r.metadata?.cuisine || r.cuisine || '';
      if (c) cuisineCounts[c] = (cuisineCounts[c] || 0) + 1;
    });
    const most_common_cuisine = Object.entries(cuisineCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // --- Most Common Difficulty ---
    const diffCounts = {};
    recipes.forEach(r => {
      const d = r.metadata?.difficulty || r.difficulty || '';
      if (d) diffCounts[d] = (diffCounts[d] || 0) + 1;
    });
    const most_common_difficulty = Object.entries(diffCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // --- Dietary / Cuisine Breakdown (for tag chips) ---
    const dietary_breakdown = {};
    recipes.forEach(r => {
      const tags = r.metadata?.dietaryTags || r.dietary_preferences || [];
      tags.forEach(tag => {
        dietary_breakdown[tag] = (dietary_breakdown[tag] || 0) + 1;
      });
    });
    // If no dietary tags, fall back to cuisine breakdown
    const breakdown = Object.keys(dietary_breakdown).length > 0
      ? dietary_breakdown
      : cuisineCounts;

    res.json({
      total_recipes_generated: total,
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fat: totalFat,
      avg_calories,
      avg_protein,
      avg_carbs,
      avg_fat,
      most_common_cuisine,
      most_common_difficulty,
      calories_over_time,
      dietary_breakdown: breakdown,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
