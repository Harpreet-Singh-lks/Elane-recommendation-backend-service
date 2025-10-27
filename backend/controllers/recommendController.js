const RecommendationService = require('../services/recomendation');

const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id; // from auth middleware
    const {
      eventType,
      eventDate,
      location,
      venue,
      preferences
    } = req.body;

    // Validate required fields
    if (!eventType || !eventDate || !location) {
      const error = new Error('Missing required fields: eventType, eventDate, location');
      error.statusCode = 400;
      throw error;
    }

    // Generate recommendations
    const recommendations = await RecommendationService.generateRecommendations({
      userId,
      eventType,
      eventDate,
      location,
      venue,
      userPreferences: preferences
    });

    res.json({
      success: true,
      data: {
        eventContext: {
          type: eventType,
          date: eventDate,
          location: location.city,
          vibe: recommendations.vibe
        },
        weather: recommendations.weather,
        outfits: recommendations.outfits,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };