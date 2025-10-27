const mongoose = require('mongoose');
// style preference will be color fabric brand 
const StylePreferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  preferredStyles: { type: [String], default: [] },
  favoriteColors: { type: [String], default: [] },
  preferredBrands: { type: [String], default: [] },
  preferredFabric:{ type: [String], default:[]},
 
}, { timestamps: true });

module.exports = mongoose.model('StylePreferences', StylePreferencesSchema);