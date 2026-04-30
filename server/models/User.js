const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  refreshToken: { type: String },
}, { timestamps: true });

userSchema.pre('save', function (next) {
  if (!this.avatar && this.name) {
    const parts = this.name.trim().split(' ');
    this.avatar = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
