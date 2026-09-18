const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, default: '' },
  unit: { type: String, default: '' },
}, { _id: true });

const pantrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: { type: [pantryItemSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Pantry', pantrySchema);
