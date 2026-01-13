import { rateLimit } from "express-rate-limit";

// General API guard: caps overall requests per IP
// 50 requests per 5 minutes, with modern rate limit headers
const generalLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 50,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: async (req, res, next, options) => {
        return res.status(options.statusCode).json({
            statusCode: options.statusCode,
            message: "To many requests from this IP, please try again after a minute",
        });
    },
});

// Create payment guard: prevents rapid charge attempts
// 10 requests per 2 minutes to avoid abuse and duplicates
const createPaymentLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: async (req, res, next, options) => {
        return res.status(options.statusCode).json({
            statusCode: options.statusCode,
            message: "Payment rate limit exceeded. Please try again in a minute",
        });
    },
});

// Verify payment guard: limits polling/spam on verification
// 5 requests per 1 minute for smoother provider load
const verifyPaymentLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: async (req, res, next, options) => {
        return res.status(options.statusCode).json({
            statusCode: options.statusCode,
            message: "Verify payment rate limit exceeded. Please try again in a minute",
        });
    },
});

export default { generalLimiter, createPaymentLimiter, verifyPaymentLimiter };
