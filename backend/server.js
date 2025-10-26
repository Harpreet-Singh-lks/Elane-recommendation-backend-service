const express= require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.get('/', (req, res)=>{
    res.send("hello World");
})

app.listen(PORT, ()=>{
    console.log("the server is running on local host ", PORT);
})
