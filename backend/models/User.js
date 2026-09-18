const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  diet_preference: {
    type: String,
    enum: ['vegetarian', 'vegan', 'paleo', 'keto', 'gluten_free', 'none', ''],
    default: 'none',
  },
  generation: {
    type: String,
    enum: ['GEN_Z', 'MILLENNIAL', 'GEN_X', 'OLDER_ADULT', null],
    default: null
  },
  spiceLevel: { type: String, default: '' },
  cookingSkill: { type: String, default: '' },
  favoriteCuisines: { type: [String], default: [] },
  dislikedIngredients: { type: [String], default: [] },
  allergies: { type: [String], default: [] },
  budgetPreference: { type: Number, default: null }, // e.g., max budget per meal
  is_superuser: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
