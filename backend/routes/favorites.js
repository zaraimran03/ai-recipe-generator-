const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Favorite = require('../models/Favorite');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('recipe')
      .sort({ createdAt: -1 });
    
    const results = favorites.map(f => {
      const obj = f.toObject();
      obj.id = obj._id;
      if (obj.recipe) obj.recipe.id = obj.recipe._id;
      return obj;
    });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { recipe_id } = req.body;
    
    // Check if already favorited
    const existing = await Favorite.findOne({ user: req.user.id, recipe: recipe_id });
    if (existing) {
      return res.status(400).json({ message: 'Already favorited' });
    }

    const favorite = new Favorite({
      user: req.user.id,
      recipe: recipe_id
    });
    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id/', async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
