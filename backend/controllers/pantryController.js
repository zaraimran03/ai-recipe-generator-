const Pantry = require('../models/Pantry');

// GET /api/pantry/ — get user's pantry
exports.get = async (req, res) => {
  try {
    const pantry = await Pantry.findOne({ user: req.user.id });
    res.json(pantry ? pantry.items : []);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/pantry/ — add item
exports.add = async (req, res) => {
  try {
    const { name, quantity, unit, expiryDate } = req.body;
    if (!name) return res.status(400).json({ message: 'Item name is required' });

    const pantry = await Pantry.findOneAndUpdate(
      { user: req.user.id },
      { $push: { items: { name, quantity: quantity || '', unit: unit || '', expiryDate: expiryDate || null } } },
      { new: true, upsert: true }
    );
    res.status(201).json(pantry.items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/pantry/:itemId/ — remove item
exports.remove = async (req, res) => {
  try {
    const pantry = await Pantry.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { items: { _id: req.params.itemId } } },
      { new: true }
    );
    res.json(pantry ? pantry.items : []);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/pantry/ — clear all items
exports.clear = async (req, res) => {
  try {
    await Pantry.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } });
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
