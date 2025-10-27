const WeatherService = require('./weatherService');
const ProductCatalogService = require('./productCatalogService');
const UserProfileService = require('./userProfile');
const redis = require('../config/redis');

class RecommendationService {
  constructor() {
    this.vibeMapping = {
      'café': 'casual',
      'coffee shop': 'casual',
      'park': 'casual',
      'brunch': 'casual-chic',
      'restaurant': 'smart-casual',
      'office': 'formal',
      'conference': 'business-formal',
      'bar': 'trendy',
      'rooftop': 'trendy',
      'club': 'party',
      'wedding': 'formal',
      'dinner': 'smart-casual',
      'party': 'party'
    };

    this.temperatureRanges = {
      hot: { min: 25, styles: ['light', 'breathable', 'summer'] },
      warm: { min: 18, max: 25, styles: ['light', 'transitional'] },
      mild: { min: 12, max: 18, styles: ['layered', 'transitional'] },
      cool: { min: 5, max: 12, styles: ['layered', 'warm'] },
      cold: { max: 5, styles: ['winter', 'warm', 'insulated'] }
    };
  }

  async generateRecommendations(context) {
    const {
      userId,
      eventType,
      eventDate,
      location,
      venue,
      userPreferences
    } = context;

    // Check cache first
    const cacheKey = `recommendations:${userId}:${eventType}:${eventDate}:${location.city}`;
    const cached = await this._getFromCache(cacheKey);
    if (cached) return cached;

    // 1. Get user profile
    const userProfile = await UserProfileService.getRecommendationProfile(userId);

    // 2. Determine vibe
    const vibe = this._inferVibe(eventType, venue);

    // 3. Get weather forecast
    const weather = await WeatherService.getForecast(location, eventDate);

    // 4. Get temperature-appropriate styles
    const tempCategory = this._categorizeTemperature(weather.temperature);

    // 5. Get product catalog
    const availableProducts = await ProductCatalogService.getAvailableProducts({
      location: location.city,
      deliveryDate: eventDate
    });

    // 6. Filter and score products
    const scoredProducts = this._scoreProducts(availableProducts, {
      userProfile,
      vibe,
      weather,
      tempCategory,
      eventType,
      userPreferences
    });

    // 7. Generate outfit combinations
    const outfits = this._generateOutfits(scoredProducts, {
      vibe,
      weather,
      eventType,
      userProfile
    });

    const result = {
      vibe,
      weather: {
        temperature: weather.temperature,
        condition: weather.condition,
        precipitation: weather.precipitation
      },
      outfits: outfits.slice(0, 5) // Top 5 outfits
    };

    // Cache for 1 hour
    await this._setCache(cacheKey, result, 3600);

    return result;
  }

  _inferVibe(eventType, venue) {
    const searchTerm = (venue || eventType).toLowerCase();
    
    for (const [keyword, vibe] of Object.entries(this.vibeMapping)) {
      if (searchTerm.includes(keyword)) {
        return vibe;
      }
    }

    return 'casual'; // default
  }

  _categorizeTemperature(temp) {
    if (temp >= 25) return 'hot';
    if (temp >= 18) return 'warm';
    if (temp >= 12) return 'mild';
    if (temp >= 5) return 'cool';
    return 'cold';
  }

  _scoreProducts(products, context) {
    const {
      userProfile,
      vibe,
      weather,
      tempCategory,
      eventType,
      userPreferences
    } = context;

    return products.map(product => {
      let score = 0;
      const reasons = [];

      // Color preference match (30%)
      if (userProfile.preferences.colors.includes(product.color)) {
        score += 30;
        reasons.push(`Matches your color preference: ${product.color}`);
      }

      // Style/vibe match (25%)
      if (product.occasions.includes(vibe) || product.occasions.includes(eventType)) {
        score += 25;
        reasons.push(`Perfect for ${vibe} ${eventType}`);
      }

      // Weather appropriateness (25%)
      const tempStyles = this.temperatureRanges[tempCategory].styles;
      if (tempStyles.some(style => product.tags.includes(style))) {
        score += 25;
        reasons.push(`Suitable for ${weather.condition} weather (${weather.temperature}°C)`);
      }

      // Fabric preference (10%)
      if (userProfile.preferences.fabrics.includes(product.fabric)) {
        score += 10;
        reasons.push(`Your preferred fabric: ${product.fabric}`);
      }

      // Trend boost (10%)
      if (product.isTrending) {
        score += 10;
        reasons.push('Currently trending');
      }

      return {
        ...product,
        score,
        reasons
      };
    }).sort((a, b) => b.score - a.score);
  }

  _generateOutfits(scoredProducts, context) {
    const outfits = [];
    const { vibe, weather, eventType, userProfile } = context;

    // Group products by category
    const byCategory = {};
    scoredProducts.forEach(product => {
      if (!byCategory[product.category]) {
        byCategory[product.category] = [];
      }
      byCategory[product.category].push(product);
    });

    // Define outfit structures based on vibe
    const outfitStructures = this._getOutfitStructures(vibe);

    // Generate combinations
    for (const structure of outfitStructures) {
      const outfit = this._buildOutfit(structure, byCategory);
      if (outfit) {
        outfit.explanation = this._generateExplanation(outfit, context);
        outfit.totalScore = this._calculateOutfitScore(outfit);
        outfits.push(outfit);
      }
    }

    return outfits.sort((a, b) => b.totalScore - a.totalScore);
  }

  _getOutfitStructures(vibe) {
    const structures = {
      'casual': [
        ['top', 'bottom', 'shoes'],
        ['dress', 'shoes', 'accessory'],
        ['top', 'jeans', 'sneakers']
      ],
      'casual-chic': [
        ['blouse', 'trousers', 'heels'],
        ['dress', 'jacket', 'shoes'],
        ['top', 'skirt', 'boots']
      ],
      'smart-casual': [
        ['shirt', 'chinos', 'loafers'],
        ['blouse', 'skirt', 'heels'],
        ['blazer', 'jeans', 'shoes']
      ],
      'formal': [
        ['suit', 'dress-shirt', 'dress-shoes'],
        ['dress', 'heels', 'clutch'],
        ['blazer', 'trousers', 'dress-shoes']
      ],
      'business-formal': [
        ['suit', 'dress-shirt', 'tie', 'dress-shoes'],
        ['blazer', 'skirt', 'blouse', 'heels']
      ],
      'trendy': [
        ['statement-top', 'jeans', 'heels'],
        ['dress', 'jacket', 'boots'],
        ['crop-top', 'skirt', 'sneakers']
      ],
      'party': [
        ['party-dress', 'heels', 'clutch'],
        ['sequin-top', 'leather-pants', 'heels'],
        ['jumpsuit', 'heels', 'statement-earrings']
      ]
    };

    return structures[vibe] || structures['casual'];
  }

  _buildOutfit(structure, productsByCategory) {
    const items = [];
    
    for (const categoryNeeded of structure) {
      const availableItems = productsByCategory[categoryNeeded] || [];
      if (availableItems.length === 0) return null;
      
      // Pick highest scored item
      items.push(availableItems[0]);
    }

    if (items.length !== structure.length) return null;

    return {
      items,
      structure
    };
  }

  _calculateOutfitScore(outfit) {
    const itemScores = outfit.items.map(item => item.score);
    const avgScore = itemScores.reduce((a, b) => a + b, 0) / itemScores.length;
    
    // Bonus for color coordination
    const colors = outfit.items.map(item => item.color);
    const uniqueColors = new Set(colors);
    const colorBonus = uniqueColors.size <= 3 ? 10 : 0; // Max 3 colors
    
    return avgScore + colorBonus;
  }

  _generateExplanation(outfit, context) {
    const { vibe, weather, eventType } = context;
    const allReasons = outfit.items.flatMap(item => item.reasons);
    const uniqueReasons = [...new Set(allReasons)];

    return `This outfit is perfect for your ${vibe} ${eventType}. ${uniqueReasons.slice(0, 3).join('. ')}.`;
  }

  async _getFromCache(key) {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
      console.error('Cache read error:', err);
      return null;
    }
  }

  async _setCache(key, value, ttl) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (err) {
      console.error('Cache write error:', err);
    }
  }
}

module.exports = new RecommendationService();