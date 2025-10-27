const axios = require('axios');
const redis = require('../config/redis');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'http://api.weatherapi.com/v1';
    this.useMock = process.env.USE_MOCK_WEATHER === 'true';
  }

  async getForecast(location, date) {
    const cacheKey = `weather:${location.city}:${date}`;
    
    // Check cache
    const cached = await this._getFromCache(cacheKey);
    if (cached) return cached;

    let forecast;
    
    if (this.useMock) {
      forecast = this._getMockForecast(location, date);
    } else {
      forecast = await this._getRealForecast(location, date);
    }

    // Cache for 6 hours
    await this._setCache(cacheKey, forecast, 21600);
    
    return forecast;
  }

  async _getRealForecast(location, date) {
    try {
      // Use WeatherAPI.com forecast endpoint
      const response = await axios.get(`${this.baseUrl}/forecast.json`, {
        params: {
          key: this.apiKey,
          q: location.city,
          days: 3  // Get 3-day forecast
        },
        timeout: 5000
      });

      const targetDate = new Date(date).toISOString().split('T')[0];
      
      // Find forecast for the specific date
      const forecastForDate = response.data.forecast.forecastday.find(
        day => day.date === targetDate
      );

      // Use the specific date forecast or fallback to current day
      const weatherData = forecastForDate ? forecastForDate.day : response.data.current;

      return {
        temperature: Math.round(weatherData.avgtemp_c || weatherData.temp_c),
        condition: this._mapCondition(weatherData.condition?.code),
        description: weatherData.condition?.text || 'Unknown',
        precipitation: weatherData.daily_chance_of_rain || 0,
        humidity: weatherData.avghumidity || weatherData.humidity,
        windSpeed: weatherData.maxwind_kph || weatherData.wind_kph,
        isMock: false
      };
    } catch (error) {
      console.error('WeatherAPI.com error:', error.message);
      // Fallback to mock
      return this._getMockForecast(location, date);
    }
  }

  _mapCondition(conditionCode) {
    // Map WeatherAPI.com condition codes to simple categories
    if (!conditionCode) return 'Clouds';
    
    const conditionMap = {
      sunny: [1000],
      cloudy: [1003, 1006, 1009],
      rainy: [1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246],
      snowy: [1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1261, 1264],
      stormy: [1087, 1273, 1276, 1279, 1282]
    };

    for (const [category, codes] of Object.entries(conditionMap)) {
      if (codes.includes(conditionCode)) {
        return category;
      }
    }
    
    return 'cloudy'; // default fallback
  }

  _getMockForecast(location, date) {
    const month = new Date(date).getMonth();
    
    // Seasonal mock data
    const seasonalTemps = {
      winter: { temp: 8, condition: 'cloudy', description: 'overcast clouds' },
      spring: { temp: 18, condition: 'sunny', description: 'clear sky' },
      summer: { temp: 28, condition: 'sunny', description: 'sunny' },
      fall: { temp: 15, condition: 'rainy', description: 'light rain' }
    };

    const season = month < 3 || month > 10 ? 'winter' : 
                   month < 6 ? 'spring' : 
                   month < 9 ? 'summer' : 'fall';

    const base = seasonalTemps[season];

    return {
      temperature: base.temp + Math.floor(Math.random() * 5 - 2),
      condition: base.condition,
      description: base.description,
      precipitation: Math.random() * (season === 'fall' ? 60 : 20),
      humidity: 50 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 10,
      isMock: true
    };
  }

  async _getFromCache(key) {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (err) {
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

module.exports = new WeatherService();