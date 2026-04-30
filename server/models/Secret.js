const mongoose = require('mongoose');

const secretSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  key: { type: String, required: true, uppercase: true, trim: true },
  encryptedValue: { type: String, required: true },
  iv: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

secretSchema.index({ projectId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Secret', secretSchema);
