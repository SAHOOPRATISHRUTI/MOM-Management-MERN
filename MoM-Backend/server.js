require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5555;

const corsOptions = {
    origin: 'http://localhost:3000',  
    methods: 'GET,POST',
    credentials: true
};

app.use(cors(corsOptions));

const connectDB = require('./Connection/dbConnection');  
const mainRouter = require('./routers/index'); 


connectDB();


app.use(bodyParser.json()); 
app.use(express.json());    

// Define your routes
app.use('/api', mainRouter); 


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
