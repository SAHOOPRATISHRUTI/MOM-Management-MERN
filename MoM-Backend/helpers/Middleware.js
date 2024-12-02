const jwt = require('jsonwebtoken');
const Response = require('../helpers/response');  
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_USER_SECRET, { expiresIn: '1h' }); 
};

const authenticateToken = (req, res, next) => {
   
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; 


    if (!token) {
        const errorMessage = 'Token is required for authentication';
        console.log(`Token missing for request to ${req.method} ${req.url}: ${errorMessage}`);
        return Response.failResponse(req, res, null, errorMessage, 401);
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_USER_SECRET); 
        req.user = verified; 
        next(); 
    } catch (error) {
  
        console.error(`Token verification failed for request to ${req.method} ${req.url}:`, error);

 
        if (error.name === 'TokenExpiredError') {
            return Response.failResponse(req, res, null, 'Token has expired', 401); 
        }

        return Response.failResponse(req, res, null, 'Invalid or expired token', 403);
    }
};

module.exports = {
    generateToken,  
    authenticateToken,
};
