const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  stylePreferences: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StylePreferences' 
  },
  closetItems: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserCloset' 
  }],
  bodyType: String,
  sizePreferences: {
    topSize: String,
    bottomSize: String,
    shoeSize: String
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', UserProfileSchema);
