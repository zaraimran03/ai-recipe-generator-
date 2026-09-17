const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
}, { timestamps: true }); // Using timestamps will add createdAt which maps to generated_at

module.exports = mongoose.model('History', historySchema);
