# Elara Outfit Recommendation — Backend Architecture

## Overview
- Stateless Node.js + Express API that recommends personalized outfits.
- Combines user preferences, event “vibe,” weather, and product availability.
- MongoDB for user data, Redis for caching, product catalog from JSON.

## Tech Stack
- Runtime: Node.js, Express
- DB: MongoDB (Mongoose)
- Cache: Redis
- Auth: JWT (Bearer)
- Config: .env

## High-level Design
- Server (server.js): bootstraps Express, connects Mongo/Redis, mounts routers, registers error middleware.
- Routers (routes/*): map URLs to controllers.
  - /auth → authRoutes.js
  - /recommend → recommendRoute.js (+ user profile subroutes)
- Controllers (controllers/*): validate input, orchestrate services, handle HTTP responses.
- Services (services/*): business logic (recommendation, weather, catalog, user profile).
- Models (models/*): Mongoose schemas (User, UserProfile, StylePreference, Closet).
- Middleware (middleware/*): auth (JWT), centralized error handling.
- Config (config/*): db and Redis clients.
- Utils (utils/jwt.js): token generation/verification.

## Request Flow (POST /recommend)
1) Auth: middleware/auth.js verifies JWT and attaches req.user.
2) Cache: check Redis key recommendations:{userId}:{eventType}:{eventDate}:{city}.
3) Context build:
   - services/userProfile.getRecommendationProfile(userId) → prefs + closet summary (Mongo).
   - services/weatherService.getForecast({ city, date }) → Redis 6h cache → API/mock.
   - services/productCatalogService.getAvailableProducts({ city, deliveryDate }) → in-memory catalog filter.
4) Engine: services/recomendation.generateRecommendations()
   - Infer vibe, score products, assemble outfits, explanations.
5) Cache: store result in Redis (TTL 1h) and return.

## Other Endpoints
- Auth: POST /auth/register, POST /auth/login
- Profile:
  - GET /recommend/users/:userId/profile
  - PUT /recommend/users/:userId/preferences
  - POST /recommend/users/:userId/closet
  - GET /recommend/users/:userId/recommendation-profile

## Caching Strategy
- Weather: weather:{city}:{date} (TTL 6h) in weatherService.
- Recommendations: recommendations:{userId}:{eventType}:{eventDate}:{city} (TTL 1h) in recommendation service.
- Catalog: in-process memory after initial load of data/product.json.

## Error Handling
- Controllers use try/catch → next(err).
- middleware/errorhandle.js formats { success: false, error } with statusCode.
- Weather and Redis operations fail gracefully (mock/fallbacks).

## Security
- JWT Bearer auth on protected routes.
- Passwords hashed (bcrypt) and not selected by default.
- Stateless design → easy horizontal scaling.

## Data Models
- User: auth info (email, password hash).
- UserProfile: body/size info; refs to StylePreference and Closet items.
- StylePreference: preferred styles/colors/fabrics/occasions.
- Closet: user-owned items (category, color, size, brand, isFavorite).

## Run Locally (macOS)
- brew services start mongodb-community
- brew services start redis
- cp .env.example .env (or follow README)
- cd backend && npm install && npm run dev
