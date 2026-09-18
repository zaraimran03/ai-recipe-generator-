const mongoose = require('mongoose');

const recipeInteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  rating: { type: Number, min: 1, max: 5, default: null },
  liked: { type: Boolean, default: null },
  saved: { type: Boolean, default: false },
  cooked: { type: Boolean, default: false },
  feedback: { type: String, default: '' },
}, { timestamps: true });

// A user should only have one interaction record per recipe
recipeInteractionSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('RecipeInteraction', recipeInteractionSchema);
