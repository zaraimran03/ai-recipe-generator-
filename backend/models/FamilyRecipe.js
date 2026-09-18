const mongoose = require('mongoose');

const familyRecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalText: { type: String, required: true },
  structuredRecipe: { type: mongoose.Schema.Types.Mixed }, // Stores the parsed JSON recipe object
  aiAdaptations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }], // IDs of modernized variants
}, { timestamps: true });

module.exports = mongoose.model('FamilyRecipe', familyRecipeSchema);
