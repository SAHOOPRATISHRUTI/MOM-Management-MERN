require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./Connection/dbConnection');
const mainRouter = require('./routers/index');

const app = express();
const PORT = process.env.PORT || 5555;

const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for parsing JSON and url-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dynamic CORS options
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
    },
}));



// Connect to the database
connectDB();

// Routes
app.use('/api', mainRouter);

// Serve uploaded files
// app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});