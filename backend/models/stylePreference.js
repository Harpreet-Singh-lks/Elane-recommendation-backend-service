const mongoose = require('mongoose');

const StylePreferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  preferredStyles: { type: [String], default: [] },
  favoriteColors: { type: [String], default: [] },
  avoidedColors: { type: [String], default: [] },
  preferredBrands: { type: [String], default: [] },
  budgetRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  comfortPriority: { type: Number, min: 1, max: 10, default: 5 },
  stylePriority: { type: Number, min:1, max:10, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('StylePreferences', StylePreferencesSchema);
