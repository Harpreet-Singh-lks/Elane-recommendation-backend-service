# Elara AI Outfit Recommendation Microservice

Production-ready microservice that recommends personalized outfits based on event type, date, location, weather, and user preferences.

## 🚀 Features

- **Context-Aware Recommendations**: Combines event type, weather, location vibe, and user preferences
- **Weather Integration**: Real OpenWeatherMap API with mock fallback
- **Smart Product Filtering**: Delivery time and location-based availability
- **Explainable AI**: Each outfit includes reasoning for recommendations
- **Redis Caching**: Multi-layer caching strategy for performance
- **Scalable Architecture**: Stateless design ready for horizontal scaling

## 📋 Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- Redis >= 6.x
- npm or yarn

## 🛠️ Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/elara-assignment
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Weather API (OpenWeatherMap)
WEATHER_API_KEY=your-openweather-api-key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
USE_MOCK_WEATHER=true

# Node environment
NODE_ENV=development
```

## 🏃 Running the Application

### Start MongoDB (if not running)
```bash
# macOS
brew services start mongodb-community

# Or manual start
mongod --config /usr/local/etc/mongod.conf
```

### Start Redis (if not running)
```bash
# macOS
brew services start redis

# Or manual start
redis-server
```

### Start the Application
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

Server will start on `http://localhost:3000`

## 📡 API Endpoints

### 1. Register User
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**: Returns JWT token

### 3. Get Outfit Recommendations (Main Endpoint)
```bash
POST /recommend
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "eventType": "brunch",
  "eventDate": "2025-11-05",
  "location": {
    "city": "Delhi",
    "country": "India"
  },
  "venue": "café",
  "preferences": {
    "colors": ["pastel", "white"],
    "fabrics": ["cotton", "linen"],
    "styles": ["casual", "casual-chic"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "eventContext": {
      "type": "brunch",
      "date": "2025-11-05",
      "location": "Delhi",
      "vibe": "casual"
    },
    "weather": {
      "temperature": 28,
      "condition": "Clear",
      "precipitation": 10
    },
    "outfits": [
      {
        "items": [
          {
            "id": "p26",
            "name": "White Linen Shirt",
            "category": "top",
            "color": "white",
            "price": 54.99,
            "buyUrl": "https://example.com/white-linen-shirt",
            "canDeliverBy": "2025-11-03"
          },
          {
            "id": "p2",
            "name": "Linen Beige Trousers",
            "category": "bottom",
            "color": "beige",
            "price": 65.99,
            "buyUrl": "https://example.com/linen-beige-trousers"
          },
          {
            "id": "p25",
            "name": "Tan Loafers",
            "category": "shoes",
            "color": "tan",
            "price": 94.99,
            "buyUrl": "https://example.com/tan-loafers"
          }
        ],
        "explanation": "This outfit is perfect for your casual brunch. Matches your color preference: white. Perfect for casual brunch. Suitable for Clear weather (28°C).",
        "totalScore": 85
      }
    ],
    "generatedAt": "2025-10-27T10:30:00.000Z"
  }
}
```

### 4. User Profile Endpoints

#### Get Profile
```bash
GET /recommend/users/:userId/profile
Authorization: Bearer <token>
```

#### Update Style Preferences
```bash
PUT /recommend/users/:userId/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferredStyles": ["casual", "smart-casual"],
  "favoriteColors": ["blue", "white", "grey"],
  "preferredBrands": ["Zara", "H&M"],
  "preferredFabric": ["cotton", "linen"]
}
```

#### Add Closet Item
```bash
POST /recommend/users/:userId/closet
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "top",
  "subcategory": "shirt",
  "brand": "Zara",
  "color": "white",
  "size": "M",
  "isFavorite": true
}
```

## 🧪 Testing with Sample Data

Use the provided sample requests in `data/sample_request.json`:

```bash
# First, register and login to get a JWT token
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login to get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Use the token for recommendations
curl -X POST http://localhost:3000/recommend \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "brunch",
    "eventDate": "2025-11-05",
    "location": {"city": "Delhi"},
    "venue": "café",
    "preferences": {
      "colors": ["pastel"],
      "fabrics": ["cotton"],
      "styles": ["casual"]
    }
  }'
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── redis.js           # Redis client
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── recommendController.js  # Recommendation endpoint
│   └── user_controller.js # User profile management
├── data/
│   ├── product.json       # Product catalog (50 items)
│   └── sample_request.json # Sample API requests
├── middleware/
│   ├── auth.js            # JWT authentication middleware
│   └── errorhandle.js     # Error handling middleware
├── models/
│   ├── closet.js          # User closet schema
│   ├── stylePreference.js # Style preferences schema
│   ├── userProfile.js     # User profile schema
│   └── userSchema.js      # User authentication schema
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   └── recommendRoute.js  # Recommendation routes
├── services/
│   ├── productCatalogService.js  # Product filtering
│   ├── recomendation.js          # Core recommendation engine
│   ├── userProfile.js            # User profile service
│   └── weatherService.js         # Weather API integration
├── utils/
│   └── jwt.js             # JWT utility functions
├── .env                   # Environment variables (not in git)
├── .gitignore
├── package.json
└── server.js              # Application entry point
```

## 🏗️ Architecture

See [DESIGN.md](../DESIGN.md) for detailed architecture documentation including:
- System architecture & data flow
- Caching strategies
- Error handling & retry logic
- Scalability & rate limiting approach

## 🔑 Key Design Decisions

1. **Config-Driven**: Easy switching between real and mock APIs via environment variables
2. **Modular Services**: Separation of concerns (weather, products, recommendations)
3. **Multi-Layer Caching**: Redis caching for recommendations (1h), weather (6h)
4. **Explainable Recommendations**: Each outfit includes reasoning
5. **Delivery Awareness**: Only recommends products that can arrive before event
6. **Vibe Inference**: Automatically determines event formality from venue/type

## 📊 Product Catalog

The system includes 50 curated products across categories:
- **Tops**: 15 items (shirts, blouses, t-shirts, sweaters)
- **Bottoms**: 12 items (jeans, trousers, skirts, shorts)
- **Dresses**: 7 items (casual, formal, party)
- **Shoes**: 8 items (sneakers, heels, boots, loafers)
- **Outerwear**: 8 items (jackets, coats, blazers)
- **Accessories**: 5 items (jewelry, bags, scarves)

Each product includes:
- Color, fabric, occasions, temperature range
- Delivery time, location availability
- Buy links, pricing, trending status

## 🚀 Scalability Features

- **Stateless Design**: Can run multiple instances behind load balancer
- **Redis Clustering**: Shared cache across all instances
- **MongoDB Replica Set**: High availability database
- **Rate Limiting Ready**: Framework for user/IP rate limits
- **Horizontal Scaling**: Add more app servers as needed

## 🔒 Security

- JWT authentication required for all recommendation endpoints
- Password hashing with bcryptjs
- CORS configured
- Environment-based secrets management
- Input validation on all endpoints

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
brew services list

# Start MongoDB
brew services start mongodb-community
```

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG

# Start Redis
brew services start redis
```

### Weather API Issues
Set `USE_MOCK_WEATHER=true` in `.env` to use mock data

## 📝 TODO / Future Enhancements

- [ ] Add unit tests (Jest)
- [ ] Add integration tests
- [ ] Implement actual rate limiting middleware
- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement ML-based personalization weights
- [ ] Add WebSocket support for real-time updates
- [ ] Implement A/B testing framework
- [ ] Add Prometheus metrics
- [ ] Multi-language support

## 📄 License

ISC

## 👥 Author

Assignment for Elara AI

---

For detailed architecture and scalability documentation, see [DESIGN.md](../DESIGN.md)
