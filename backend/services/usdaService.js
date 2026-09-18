const axios = require('axios');

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const API_KEY = process.env.USDA_API_KEY;

/**
 * Search for a food item and return its calories per 100g
 */
const lookupCaloriesPer100g = async (foodName) => {
  if (!API_KEY) return null;
  try {
    const { data } = await axios.get(`${BASE_URL}/foods/search`, {
      params: { query: foodName, pageSize: 1, api_key: API_KEY },
    });
    const food = data.foods?.[0];
    if (!food) return null;
    const energyNutrient = food.foodNutrients?.find(n =>
      n.nutrientName?.toLowerCase().includes('energy') && n.unitName === 'KCAL'
    );
    return energyNutrient?.value ?? null;
  } catch {
    return null;
  }
};

/**
 * Verify AI-estimated nutrition against USDA data.
 * Returns a delta object so the frontend can show accuracy.
 */
exports.verifyNutrition = async (ingredients, aiCalories) => {
  if (!API_KEY) {
    return { verified: false, reason: 'USDA_API_KEY not configured' };
  }

  try {
    const lookups = await Promise.all(
      ingredients.slice(0, 5).map(ing => lookupCaloriesPer100g(ing.name))
    );
    const validLookups = lookups.filter(v => v !== null);
    if (validLookups.length === 0) return { verified: false, reason: 'No USDA matches found' };

    const usdaEstimate = Math.round(validLookups.reduce((a, b) => a + b, 0) / validLookups.length);
    const delta = Math.abs(usdaEstimate - aiCalories);
    const withinRange = delta <= 150;

    return {
      verified: true,
      aiCalories,
      usdaEstimate,
      delta,
      withinRange,
      accuracy: withinRange ? 'good' : 'approximate',
    };
  } catch (err) {
    return { verified: false, reason: err.message };
  }
};
