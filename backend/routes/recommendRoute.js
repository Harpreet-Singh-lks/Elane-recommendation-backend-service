//remaininng import 
const router = express.Router();

router.post("/", getRecommendations);

export default router;
const express = require('express');
const auth = require('../middleware/auth');
const { getProfile, updatePreferences, addClosetItem, getRecommendationProfile } = require('../controllers/userController');


router.get('/users/:userId/profile', auth, getProfile);
router.put('/users/:userId/preferences', auth, updatePreferences);
router.post('/users/:userId/closet', auth, addClosetItem);
router.get('/users/:userId/recommendation-profile', auth, getRecommendationProfile);

module.exports = router;
