const rateLimit = require('express-rate-limit');
const rateLimiterUsingThirdParty = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
    max: 1000,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too Many Requests',
            message: 'You have exceeded the 100 requests limit.',
            retryAfter: res.getHeader('Retry-After') // Tells Vue how many seconds to wait
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { rateLimiterUsingThirdParty };