const mongoose = require('mongoose');

const UserClosetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  subcategory: String,
  brand: String,
  color: String,
  size: String,
  lastWornDate: Date,
  purchaseDate: Date,
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('UserCloset', UserClosetSchema);