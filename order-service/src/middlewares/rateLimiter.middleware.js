import { rateLimit } from "express-rate-limit";

// Default rate limiter (app level): 200 requests per minute per IP
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: async (req, res, next, options) => {
        return res.status(options.statusCode).json({
            statusCode: options.statusCode,
            message: "To many requests from this IP, please try again after a minute",
        });
    },
});

// Helper to create a rate limiter with custom settings
function createLimiter(windowMinutes, limit, action = "") {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        handler: async (req, res, next, options) => {
            return res.status(options.statusCode).json({
                statusCode: options.statusCode,
                message: `${action} rate limit exceeded. Please try again in a minute`,
            });
        },
    });
}

export default { generalLimiter, createLimiter };
