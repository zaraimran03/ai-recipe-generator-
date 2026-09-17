const Recipe = require('../models/Recipe');
const History = require('../models/History');
const groqService = require('../services/groqService');

exports.generate = async (req, res) => {
  try {
    const { 
      ingredients, cuisine, taste, cooking_time, difficulty, 
      servings, dietary_preference, allergies, calories 
    } = req.body;

    const generatedData = await groqService.generateRecipe(
      ingredients, cuisine, taste, cooking_time, difficulty, 
      servings, dietary_preference, allergies, calories
    );

    const recipe = new Recipe({
      user: req.user.id,
      title: generatedData.title,
      ingredients: generatedData.ingredients,
      instructions: generatedData.instructions,
      nutrition: generatedData.nutrition,
      servings: generatedData.servings,
      difficulty: generatedData.difficulty,
      time: generatedData.time,
      cuisine,
      taste,
      dietary_preferences: dietary_preference
    });

    await recipe.save();

    // Create history record
    const history = new History({
      user: req.user.id,
      recipe: recipe._id
    });
    await history.save();

    res.status(201).json({
      id: recipe._id,
      ...recipe.toObject()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating recipe', error: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user.id }).sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility
    const results = recipes.map(r => {
      const obj = r.toObject();
      obj.id = obj._id;
      return obj;
    });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, user: req.user.id });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    const obj = recipe.toObject();
    obj.id = obj._id;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    // Delete associated favorites and history
    await require('../models/Favorite').deleteMany({ recipe: req.params.id });
    await History.deleteMany({ recipe: req.params.id });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
