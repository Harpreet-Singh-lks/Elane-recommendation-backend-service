const express = require('express');
const auth = require('../middleware/auth');
const { getRecommendations } = require('../controllers/recommendController');
const { getProfile, updatePreferences, addClosetItem, getRecommendationProfile } = require('../controllers/user_controller');

const router = express.Router();

// Recommendation endpoint
router.post('/', auth, getRecommendations);

// User profile endpoints
router.get('/users/:userId/profile', auth, getProfile);
router.put('/users/:userId/preferences', auth, updatePreferences);
router.post('/users/:userId/closet', auth, addClosetItem);
router.get('/users/:userId/recommendation-profile', auth, getRecommendationProfile);

module.exports = router;
