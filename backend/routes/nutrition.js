const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Recipe = require('../models/Recipe');

router.use(authMiddleware);

router.get('/summary/', async (req, res) => {
  try {
    const range = req.query.range || '30d';
    // Dummy aggregation for now, or real if we want
    // The previous django app returned some basic stats
    // We'll calculate total macros across user's recipes for the last 30 days
    
    let date = new Date();
    if (range === '7d') date.setDate(date.getDate() - 7);
    else if (range === '30d') date.setDate(date.getDate() - 30);
    else if (range === '90d') date.setDate(date.getDate() - 90);
    else date.setFullYear(2000); // all time

    const recipes = await Recipe.find({ 
      user: req.user.id,
      createdAt: { $gte: date }
    });

    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    
    recipes.forEach(r => {
      if (r.nutrition) {
        totalCalories += r.nutrition.calories || 0;
        totalProtein += r.nutrition.protein || 0;
        totalCarbs += r.nutrition.carbs || 0;
        totalFat += r.nutrition.fat || 0;
      }
    });

    res.json({
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
