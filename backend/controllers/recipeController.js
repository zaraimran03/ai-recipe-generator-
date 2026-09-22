const crypto = require('crypto');
const Recipe = require('../models/Recipe');
const History = require('../models/History');
const groqService = require('../services/groqService');
const User = require('../models/User');
const RecipeInteraction = require('../models/RecipeInteraction');

// Helper: deterministic hash of sorted ingredient list for caching
const hashIngredients = (ingredients) => {
  const normalized = Array.isArray(ingredients)
    ? [...ingredients].map(i => i.toLowerCase().trim()).sort().join(',')
    : String(ingredients).toLowerCase().trim();
  return crypto.createHash('md5').update(normalized).digest('hex');
};

// POST /api/recipes/generate/
exports.generate = async (req, res) => {
  try {
    const { ingredients, cuisine, taste, cooking_time, difficulty, servings, dietary_preference, allergies, calories, usePantry, strictPantryMode, pantryIngredients } = req.body;

    let finalIngredients = ingredients || '';
    if (strictPantryMode && pantryIngredients && pantryIngredients.length > 0) {
      const pantryStr = pantryIngredients.map(item => {
        let str = `${item.name}`;
        const details = [];
        if (item.quantity || item.unit) details.push(`${item.quantity} ${item.unit}`.trim());
        if (item.expiryDate) details.push(`exp: ${new Date(item.expiryDate).toISOString().split('T')[0]}`);
        if (details.length > 0) str += ` (${details.join(', ')})`;
        return str;
      }).join(', ');
      
      finalIngredients = finalIngredients ? `${finalIngredients}, ${pantryStr}` : pantryStr;
    } else if (usePantry && !strictPantryMode) {
      const PantryModel = require('../models/Pantry');
      const pantry = await PantryModel.findOne({ user: req.user.id });
      if (pantry && pantry.items.length > 0) {
        const pantryStr = pantry.items.map(item => {
          let str = `${item.name}`;
          const details = [];
          if (item.quantity || item.unit) details.push(`${item.quantity} ${item.unit}`.trim());
          if (item.expiryDate) details.push(`exp: ${new Date(item.expiryDate).toISOString().split('T')[0]}`);
          if (details.length > 0) str += ` (${details.join(', ')})`;
          return str;
        }).join(', ');
        
        finalIngredients = finalIngredients 
          ? `${finalIngredients}, ${pantryStr}`
          : pantryStr;
      }
    }

    // Cache check: if an identical ingredient combination exists for this user, return it
    const hash = hashIngredients(finalIngredients);
    const cached = await Recipe.findOne({ user: req.user.id, ingredientHash: hash });
    if (cached) {
      console.log('Cache hit for ingredient hash:', hash);
      const obj = cached.toObject();
      obj.id = obj._id;
      obj.fromCache = true;
      return res.status(200).json(obj);
    }

    const user = await User.findById(req.user.id);
    
    // Combine explicit request body params with user profile defaults/constraints
    const params = {
      ingredients: finalIngredients,
      cuisine: cuisine || user.favoriteCuisines?.join(','),
      taste: taste || user.spiceLevel,
      cooking_time: cooking_time,
      difficulty: difficulty || user.cookingSkill,
      servings: servings,
      dietary_preference: dietary_preference || user.diet_preference,
      allergies: allergies || user.allergies,
      calories: calories,
      dislikedIngredients: user.dislikedIngredients,
      budgetPreference: user.budgetPreference,
      generation: user.generation,
      strictPantryMode: strictPantryMode || false
    };

    // Generate via Groq
    const generated = await groqService.generateRecipe(params);

    const recipe = new Recipe({
      user: req.user.id,
      title: generated.title,
      summary: generated.summary,
      ingredients: generated.ingredients,
      instructions: generated.instructions,
      nutrition: generated.nutrition,
      metadata: generated.metadata,
      // Legacy flat fields for backward compatibility
      servings: generated.metadata.servings,
      difficulty: generated.metadata.difficulty,
      time: generated.metadata.totalTimeMinutes,
      cuisine: generated.metadata.cuisine,
      dietary_preferences: generated.metadata.dietaryTags,
      ingredientHash: hash,
      generationAdaptation: generated.generationAdaptation,
      estimatedCost: generated.estimatedCost,
      substitutions: generated.substitutions,
      tips: generated.tips
    });

    await recipe.save();

    const history = new History({ user: req.user.id, recipe: recipe._id });
    await history.save();

    const obj = recipe.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    console.error('Recipe generation error:', error.message);
    res.status(500).json({ message: 'Error generating recipe', error: error.message });
  }
};

// POST /api/recipes/substitute/
exports.substitute = async (req, res) => {
  try {
    const { recipeId, missingIngredient } = req.body;
    if (!missingIngredient) return res.status(400).json({ message: 'missingIngredient is required' });

    const recipe = recipeId
      ? await Recipe.findOne({ _id: recipeId, user: req.user.id })
      : null;

    const result = await groqService.getSubstitute(recipe?.title || 'Unknown recipe', missingIngredient);
    res.json(result);
  } catch (error) {
    console.error('Substitution error:', error.message);
    res.status(500).json({ message: 'Error finding substitute', error: error.message });
  }
};

// POST /api/recipes/adapt/
exports.adapt = async (req, res) => {
  try {
    const { recipeId, userRequest } = req.body;
    if (!recipeId || !userRequest) {
      return res.status(400).json({ message: 'recipeId and userRequest are required' });
    }

    const recipe = await Recipe.findOne({ _id: recipeId, user: req.user.id });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const user = await User.findById(req.user.id);
    const params = {
      dietary_preference: user.diet_preference,
      allergies: user.allergies,
      dislikedIngredients: user.dislikedIngredients,
      budgetPreference: user.budgetPreference,
      generation: user.generation
    };

    const adapted = await groqService.adaptRecipe(recipe, userRequest, params);

    const newRecipe = new Recipe({
      user: req.user.id,
      title: adapted.title,
      summary: adapted.summary,
      ingredients: adapted.ingredients,
      instructions: adapted.instructions,
      nutrition: adapted.nutrition,
      metadata: adapted.metadata,
      servings: adapted.metadata.servings,
      difficulty: adapted.metadata.difficulty,
      time: adapted.metadata.totalTimeMinutes,
      cuisine: adapted.metadata.cuisine,
      dietary_preferences: adapted.metadata.dietaryTags,
      generationAdaptation: adapted.generationAdaptation,
      estimatedCost: adapted.estimatedCost,
      substitutions: adapted.substitutions,
      tips: adapted.tips,
      originalRecipeId: recipe._id,
      adaptationType: userRequest
    });

    await newRecipe.save();
    
    const obj = newRecipe.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    console.error('Adaptation error:', error.message);
    res.status(500).json({ message: 'Error adapting recipe', error: error.message });
  }
};

// GET /api/recipes/recommendations/
exports.recommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Simple recommendation logic:
    // If the user has history/ratings, fetch recipes they liked, else fetch generic based on user prefs.
    // For now, we'll just fetch a few recipes that match their preferences or generation,
    // or recently generated recipes by other users with similar generation (for demo purposes).
    
    let query = {};
    if (user.generation) {
      // Find recipes generated for same generation, or just any recent recipes
      query = { user: { $ne: user._id } }; // recipes from others
    }
    const recipes = await Recipe.find(query).sort({ createdAt: -1 }).limit(10);
    const results = recipes.map(r => { const o = r.toObject(); o.id = o._id; return o; });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/recipes/:id/interact/
exports.interact = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { rating, liked, saved, cooked, feedback } = req.body;
    
    let interaction = await RecipeInteraction.findOne({ userId: req.user.id, recipeId });
    if (!interaction) {
      interaction = new RecipeInteraction({ userId: req.user.id, recipeId });
    }
    
    if (rating !== undefined) interaction.rating = rating;
    if (liked !== undefined) interaction.liked = liked;
    if (saved !== undefined) interaction.saved = saved;
    if (cooked !== undefined) interaction.cooked = cooked;
    if (feedback !== undefined) interaction.feedback = feedback;
    
    await interaction.save();
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ message: 'Error saving interaction', error: error.message });
  }
};

// GET /api/recipes/
exports.list = async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user.id }).sort({ createdAt: -1 });
    const results = recipes.map(r => { const o = r.toObject(); o.id = o._id; return o; });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/recipes/:id/
exports.getById = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, user: req.user.id });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    const obj = recipe.toObject();
    obj.id = obj._id;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/recipes/:id/
exports.delete = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    await require('../models/Favorite').deleteMany({ recipe: req.params.id });
    await History.deleteMany({ recipe: req.params.id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
