import { rateLimit } from "express-rate-limit";

// General API guard: caps overall requests per IP
// 500 requests per 2 minutes, with modern rate limit headers
const generalLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: async (req, res, next, options) => {
        return res.status(options.statusCode).json({
            statusCode: options.statusCode,
            message: "To many requests from this IP, please try again after a minute",
        });
    },
});

function createLimiter(windowMinutes, limit, action) {
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
