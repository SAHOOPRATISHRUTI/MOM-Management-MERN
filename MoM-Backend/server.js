require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const PORT = process.env.PORT || 5555;

const corsOptions = {
    origin: 'http://localhost:3001',  
    methods: 'GET,POST',
    credentials: true
};

app.use(cors(corsOptions));

const connectDB = require('./Connection/dbConnection');  
const mainRouter = require('./routers/index'); 

// Connect to the database
connectDB();

// Session middleware - Place it before your routes
app.use(session({
    secret: 'your-secret-key',  
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }   
}));

// Middleware for parsing JSON and url-encoded data
app.use(bodyParser.json()); 
app.use(express.json());    

// Define your routes
app.use('/api', mainRouter); 

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});