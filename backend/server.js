const express= require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');

require('dotenv').config();

app.get('/', (req, res)=>{
    res.send("hello World");
})

app.use("/recommend", recommendRoute);

//health-check endpoint 
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    service: 'User Profile Service',
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(express.json());
app.use(cookieParser);

app.listen(PORT, ()=>{
    console.log("the server is running on local host ", PORT);
})
module.exports = app;