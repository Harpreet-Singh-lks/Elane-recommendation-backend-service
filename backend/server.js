const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorhandle');
const authRoutes = require('./routes/authRoutes');
const recommendRoute = require('./routes/recommendRoute');
const connectDB = require('./config/db');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration (MUST be before routes)
app.use(cors({
    origin: '*', // Allow all origins for testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
//app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: "Elara AI Outfit Recommendation API",
        version: "1.0.0",
        status: "running"
    });
});

// Health check endpoint - Place BEFORE other routes
app.get('/health', (req, res) => {
    console.log('🏥 Health check requested');
    res.status(200).json({ 
        status: 'OK', 
        service: 'User Profile Service',
        timestamp: new Date().toISOString(),
        mongodb: 'connected',
        redis: 'connected'
    });
});

app.use('/auth', authRoutes);
app.use('/recommend', recommendRoute);

// 404 handler
// app.all('*', (req, res) => {
//    res.status(404).json({ 
//         success: false,
//         error: 'Route not found',
//         path: req.originalUrl,
//         method: req.method
//   });
// });

// Error handler (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}`);
    console.log(`📖 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 CORS enabled for all origins`);
});

module.exports = app;
