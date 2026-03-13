const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
// const {Logger} = require("concurrently");

// Load environment variables from .env file (if you're using dotenv)
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable or default
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // Example: 1 hour

// Generate a new JWT token
function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Validate and verify a JWT token
function validateToken(token) {
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        return {valid: true, decoded: decoded}
    } catch (err) {
        return { valid: false, error: err.message };  // Return error if invalid
    }
}

module.exports = {
    generateToken,
    validateToken
};
