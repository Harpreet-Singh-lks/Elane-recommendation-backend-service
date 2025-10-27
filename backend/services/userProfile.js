const UserProfile = require('../models/userProfile');
const StylePreference = require('../models/stylePreference');
const Closet = require('../models/closet');

class UserProfileService {
  /**
   * Get complete user profile with preferences and closet
   */
  async getUserProfile(userId) {
    const profile = await UserProfile.findOne({ userId })
      .populate('stylePreferences')
      .populate('closetItems');
    
    if (!profile) {
      const error = new Error('User profile not found');
      error.statusCode = 404;
      throw error;
    }
    
    return profile;
  }

  /**
   * Create or update style preferences
   */
  async upsertStylePreferences(userId, prefsData) {
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = await UserProfile.create({ userId });
    }

    let prefs = await StylePreference.findOne({ userId });
    
    if (prefs) {
      Object.assign(prefs, prefsData);
      await prefs.save();
    } else {
      prefs = await StylePreference.create({ userId, ...prefsData });
      profile.stylePreferences = prefs._id;
      await profile.save();
    }

    return prefs;
  }

  /**
   * Add item to user's closet
   */
  async addClosetItem(userId, itemData) {
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      profile = await UserProfile.create({ userId });
    }

    const closetItem = await Closet.create({
      userId,
      ...itemData,
      addedAt: new Date()
    });

    profile.closetItems.push(closetItem._id);
    await profile.save();

    return closetItem;
  }

  /**
   * Get aggregated recommendation profile
   */
  async getRecommendationProfile(userId) {
    const profile = await UserProfile.findOne({ userId })
      .populate('stylePreferences')
      .populate('closetItems');

    if (!profile) {
      // Return default profile if not found
      return {
        userId,
        preferences: {
          colors: [],
          styles: [],
          fabrics: [],
          occasions: []
        },
        closetSummary: {
          totalItems: 0,
          categories: {},
          colors: [],
          brands: []
        },
        profile: {
          bodyType: null,
          sizePreferences: null
        }
      };
    }

    const prefs = profile.stylePreferences || {};
    const closet = profile.closetItems || [];

    // Aggregate data for recommendation engine
    return {
      userId,
      preferences: {
        colors: prefs.colors || [],
        styles: prefs.styles || [],
        fabrics: prefs.fabrics || [],
        occasions: prefs.occasions || []
      },
      closetSummary: {
        totalItems: closet.length,
        categories: this._categorizeCloset(closet),
        colors: this._extractColors(closet),
        brands: this._extractBrands(closet)
      },
      profile: {
        bodyType: profile.bodyType,
        sizePreferences: profile.sizePreferences
      }
    };
  }

  /**
   * Helper: Categorize closet items
   */
  _categorizeCloset(items) {
    const categories = {};
    items.forEach(item => {
      const cat = item.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return categories;
  }

  /**
   * Helper: Extract unique colors from closet
   */
  _extractColors(items) {
    const colors = new Set();
    items.forEach(item => {
      if (item.color) colors.add(item.color);
    });
    return Array.from(colors);
  }

  /**
   * Helper: Extract unique brands from closet
   */
  _extractBrands(items) {
    const brands = new Set();
    items.forEach(item => {
      if (item.brand) brands.add(item.brand);
    });
    return Array.from(brands);
  }
}

module.exports = new UserProfileService();