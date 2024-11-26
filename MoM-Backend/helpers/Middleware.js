const jwt = require('jsonwebtoken');
const Response = require('../helpers/response');  // Assuming you're using a standardized response helper

// Function to generate JWT token
const generateToken = (userData) => {
    // Here, 'userData' is an object containing user info such as _id, name, email
    return jwt.sign(userData, process.env.JWT_USER_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    // Retrieve the token from the authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'

    // If no token is provided, respond with an error
    if (!token) {
        const errorMessage = 'Token is required for authentication';
        console.log(`Token missing for request to ${req.method} ${req.url}: ${errorMessage}`);
        return Response.failResponse(req, res, null, errorMessage, 401);
    }

    // Verify the token
    try {
        const verified = jwt.verify(token, process.env.JWT_USER_SECRET); // Verify token using JWT secret
        req.user = verified; // Attach the decoded user information to the request object
        next(); // Pass control to the next middleware/controller
    } catch (error) {
        // Enhanced error logging
        console.error(`Token verification failed for request to ${req.method} ${req.url}:`, error);

        // Handle specific error cases
        if (error.name === 'TokenExpiredError') {
            return Response.failResponse(req, res, null, 'Token has expired', 401); // Handle expired token case
        }

        // Generic error handling for invalid or malformed token
        return Response.failResponse(req, res, null, 'Invalid or expired token', 403);
    }
};

module.exports = {
    generateToken,  // Export the generateToken function
    authenticateToken,
};
