const jwt = require('jsonwebtoken');
const Responses = require('../helpers/response');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extract token

    if (!token) {
        console.log('Token missing in request'); // Logging the missing token
        return Responses.failResponse(req, res, null, 'Token is required for authentication', 401);
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_USER_SECRET); // Verify token
        req.user = verified; // Attach user data to request
        next(); // Proceed
    } catch (error) {
        console.error('Token verification failed:', error); // Logging the error for debugging

        if (error.name === 'TokenExpiredError') {
            return Responses.failResponse(req, res, null, 'Token has expired', 401); // Handle expired token specifically
        }

        return Responses.failResponse(req, res, null, 'Invalid or expired token', 403); // Default invalid token message
    }
};

module.exports = {authenticateToken};
