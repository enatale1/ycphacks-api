const JWTUtil = require('../util/JWTUtil');

// Used for protected routes
function authMiddleware(req, res, next) {
        const authHeader = req.headers.authorization;
        //Expecting bearer token format
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({message: 'Authorization header missing or malformed'});
        }

        const token = authHeader.split(' ')[1];

        try {
            const validation = JWTUtil.validateToken(token);

            if (!validation.valid || !validation) {
                console.error("Auth Middleware: Token validation failed", validation?.error);
                return res.status(401).json({ message: 'Invalid or expired token' });
            }

            req.user = validation.decoded;  // Attach decoded token data to request
            next();  // Proceed to next middleware or route handler
        } catch (err){
            console.error("Auth Middleware: Critical error during validation", err);
            return res.status(500).json({ message: 'Authentication service error' });
        }

}

module.exports = {
    authMiddleware
}