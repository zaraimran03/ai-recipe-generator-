const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const History = require('../models/History');
const Favorite = require('../models/Favorite');

// Admin middleware check
const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.is_superuser) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users/', async (req, res) => {
  try {
    const search = req.query.search;
    let query = {};
    if (search) {
      query = { $or: [{ email: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }] };
    }
    const users = await User.find(query).select('-password');
    const results = users.map(u => ({...u.toObject(), id: u._id}));
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/users/:id/', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({...user.toObject(), id: user._id});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/users/:id/', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/recipes/', async (req, res) => {
  try {
    const { search, user_id } = req.query;
    let query = {};
    if (search) query.title = new RegExp(search, 'i');
    if (user_id) query.user = user_id;
    
    const recipes = await Recipe.find(query).populate('user', 'email name');
    const results = recipes.map(r => ({...r.toObject(), id: r._id}));
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/recipes/:id/', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    await Favorite.deleteMany({ recipe: req.params.id });
    await History.deleteMany({ recipe: req.params.id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/stats/', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const totalFavorites = await Favorite.countDocuments();
    
    res.json({
      total_users: totalUsers,
      total_recipes: totalRecipes,
      total_favorites: totalFavorites
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
