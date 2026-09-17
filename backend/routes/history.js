const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const History = require('../models/History');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const history = await History.find({ user: req.user.id })
      .populate('recipe')
      .sort({ createdAt: -1 });
      
    const results = history.map(h => {
      const obj = h.toObject();
      obj.id = obj._id;
      if (obj.recipe) obj.recipe.id = obj.recipe._id;
      obj.generated_at = obj.createdAt;
      return obj;
    });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id/', async (req, res) => {
  try {
    const history = await History.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!history) {
      return res.status(404).json({ message: 'History not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
