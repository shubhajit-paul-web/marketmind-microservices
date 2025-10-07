import { rateLimit } from "express-rate-limit";
import RateLimiterResponse from "../utils/rateLimiterResponse.js";

// For all routes (100 requests per IP per 5 minutes)
export const generalLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        return res.status(options.statusCode).json(new RateLimiterResponse(req));
    },
});
