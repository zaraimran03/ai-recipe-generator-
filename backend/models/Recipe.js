const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  ingredients: { type: Array, default: [] },
  instructions: { type: Array, default: [] },
  nutrition: { type: Object, default: {} },
  servings: { type: Number, required: true },
  cuisine: { type: String, default: '' },
  taste: { type: String, default: '' },
  dietary_preferences: { type: Array, default: [] },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  time: { type: Number, required: true }, // Time in minutes
}, { timestamps: true });

// Create index
recipeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Recipe', recipeSchema);
