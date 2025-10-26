const mongoose = require('mongoose');

const UserSizeProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  heightCm: Number,
  weightKg: Number,
  bodyShape: { type: String, enum: ['hourglass','pear','apple','rectangle','athletic'] },
  topSize: String,
  bottomSize: String,
  shoeSize: String
}, { timestamps: true });

module.exports = mongoose.model('UserSizeProfile', UserSizeProfileSchema);
