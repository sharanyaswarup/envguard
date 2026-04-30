const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  color: { type: String, default: '#00d4ff' },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'], default: 'viewer' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
