const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' },
  isPantryStaple: { type: Boolean, default: false },
}, { _id: false });

const instructionSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true },
  timerInMinutes: { type: Number, default: null },
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  ingredients: { type: [ingredientSchema], default: [] },
  instructions: { type: [instructionSchema], default: [] },
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  metadata: {
    servings: { type: Number, default: 1 },
    difficulty: { type: String, default: 'Intermediate' },
    prepTimeMinutes: { type: Number, default: 0 },
    cookTimeMinutes: { type: Number, default: 0 },
    totalTimeMinutes: { type: Number, default: 0 },
    cuisine: { type: String, default: '' },
    dietaryTags: { type: [String], default: [] },
  },
  generationAdaptation: { type: String, default: '' },
  estimatedCost: { type: Number, default: 0 },
  substitutions: { type: [mongoose.Schema.Types.Mixed], default: [] },
  tips: { type: [String], default: [] },
  generatedByAI: { type: Boolean, default: true },
  originalRecipeId: { type: mongoose.Schema.Types.ObjectId, default: null }, // ref could be Recipe or FamilyRecipe
  adaptationType: { type: String, default: '' },
  // Legacy flat fields kept for backward compatibility
  servings: { type: Number },
  difficulty: { type: String },
  time: { type: Number },
  cuisine: { type: String, default: '' },
  taste: { type: String, default: '' },
  dietary_preferences: { type: [String], default: [] },
  // MD5 hash of sorted ingredients for cache lookup
  ingredientHash: { type: String, index: true },
}, { timestamps: true });

recipeSchema.index({ user: 1, createdAt: -1 });
recipeSchema.index({ ingredientHash: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
