const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  operation: {
    type: String,
    required: true,
    enum: ['generate', 'adapt', 'preserve_family', 'modernize_family', 'substitute', 'other'],
    default: 'generate',
  },
  model: {
    type: String,
    required: true,
    default: 'openai/gpt-oss-120b',
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'error'],
    default: 'success',
  },
  durationMs: {
    type: Number,
    required: true,
    default: 0,
  },
  error: {
    type: String,
    default: null,
  },
  promptTokens: {
    type: Number,
    default: 0,
  },
  completionTokens: {
    type: Number,
    default: 0,
  },
  totalTokens: {
    type: Number,
    default: 0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

aiLogSchema.index({ createdAt: -1 });
aiLogSchema.index({ operation: 1, status: 1 });

module.exports = mongoose.model('AiLog', aiLogSchema);
