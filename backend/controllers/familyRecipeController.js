const FamilyRecipe = require('../models/FamilyRecipe');
const Recipe = require('../models/Recipe');
const groqService = require('../services/groqService');

// POST /api/family-recipes/
exports.create = async (req, res) => {
  try {
    const { originalText } = req.body;
    if (!originalText) return res.status(400).json({ message: 'originalText is required' });

    // AI parses unstructured text to structured recipe
    const structured = await groqService.preserveFamilyRecipe(originalText);

    const familyRecipe = new FamilyRecipe({
      userId: req.user.id,
      originalText: originalText,
      structuredRecipe: structured
    });

    await familyRecipe.save();
    res.status(201).json(familyRecipe);
  } catch (error) {
    console.error('Family recipe preserve error:', error.message);
    res.status(500).json({ message: 'Error preserving family recipe', error: error.message });
  }
};

// GET /api/family-recipes/
exports.list = async (req, res) => {
  try {
    const recipes = await FamilyRecipe.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/family-recipes/:id
exports.getById = async (req, res) => {
  try {
    const recipe = await FamilyRecipe.findOne({ _id: req.params.id, userId: req.user.id }).populate('aiAdaptations');
    if (!recipe) return res.status(404).json({ message: 'Family recipe not found' });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/family-recipes/:id/modernize
exports.modernize = async (req, res) => {
  try {
    const { options } = req.body;
    const familyRecipe = await FamilyRecipe.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!familyRecipe) return res.status(404).json({ message: 'Family recipe not found' });

    // Generate modernized adaptation
    const modernized = await groqService.modernizeFamilyRecipe(familyRecipe.structuredRecipe, options);

    const newRecipe = new Recipe({
      user: req.user.id,
      title: modernized.title,
      summary: modernized.summary,
      ingredients: modernized.ingredients,
      instructions: modernized.instructions,
      nutrition: modernized.nutrition,
      metadata: modernized.metadata,
      servings: modernized.metadata.servings,
      difficulty: modernized.metadata.difficulty,
      time: modernized.metadata.totalTimeMinutes,
      cuisine: modernized.metadata.cuisine,
      dietary_preferences: modernized.metadata.dietaryTags,
      generationAdaptation: modernized.generationAdaptation,
      estimatedCost: modernized.estimatedCost,
      substitutions: modernized.substitutions,
      tips: modernized.tips,
      originalRecipeId: familyRecipe._id,
      adaptationType: options
    });

    await newRecipe.save();

    // Link adaptation back to FamilyRecipe
    familyRecipe.aiAdaptations.push(newRecipe._id);
    await familyRecipe.save();
    
    const obj = newRecipe.toObject();
    obj.id = obj._id;
    res.status(201).json(obj);
  } catch (error) {
    console.error('Modernize error:', error.message);
    res.status(500).json({ message: 'Error modernizing recipe', error: error.message });
  }
};
