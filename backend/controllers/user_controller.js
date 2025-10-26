//containt the authorization of the user const UserProfileService = require('../services/userProfileService');

const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // optional: authorize user can only access own profile unless admin
    const profile = await UserProfileService.getUserProfile(userId);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const prefs = req.body;
    const updated = await UserProfileService.upsertStylePreferences(userId, prefs);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const addClosetItem = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const item = req.body;
    const created = await UserProfileService.addClosetItem(userId, item);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

const getRecommendationProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const rp = await UserProfileService.getRecommendationProfile(userId);
    res.json({ success: true, data: rp });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updatePreferences, addClosetItem, getRecommendationProfile };
