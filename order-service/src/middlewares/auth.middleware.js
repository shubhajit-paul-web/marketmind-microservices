import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import redis from "../db/redis.js";

/**
 * Creates an authentication middleware that validates JWT tokens and enforces role-based access control
 * @param {string[]} roles - Array of allowed roles (default: ["user"])
 * @returns {Function} Express middleware function
 */
function createAuthMiddleware(roles = ["user"]) {
    return async function (req, res, next) {
        // Extract access token from cookies or Authorization header
        const accessToken = req?.cookies?.accessToken ?? req.headers?.authorization?.split(" ")[1];

        if (!accessToken) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                responseMessages.MISSING_ACCESS_TOKEN,
                errorCodes.MISSING_TOKEN
            );
        }

        // Check if token is blacklisted (logged out)
        const isBlacklistedToken = await redis.get(`blacklist:${accessToken}`);

        if (isBlacklistedToken) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                responseMessages.TOKEN_BLACKLISTED,
                errorCodes.BLACKLISTED_TOKEN
            );
        }

        try {
            const decoded = jwt.verify(accessToken, config.JWT.ACCESS_TOKEN_SECRET);

            // Check if user has required role
            if (!roles.includes(decoded?.role)) {
                throw new ApiError(
                    StatusCodes.FORBIDDEN,
                    responseMessages.INSUFFICIENT_PERMISSIONS,
                    errorCodes.INSUFFICIENT_PERMISSIONS
                );
            }

            req.user = decoded;
            req.accessToken = accessToken;
            next();
        } catch (error) {
            if (error.statusCode === StatusCodes.FORBIDDEN) {
                throw new ApiError(
                    StatusCodes.FORBIDDEN,
                    responseMessages.INSUFFICIENT_PERMISSIONS,
                    errorCodes.INSUFFICIENT_PERMISSIONS
                );
            }

            if (error.name === "TokenExpiredError") {
                throw new ApiError(
                    StatusCodes.UNAUTHORIZED,
                    responseMessages.TOKEN_EXPIRED,
                    errorCodes.EXPIRED_TOKEN
                );
            }

            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                responseMessages.INVALID_TOKEN,
                errorCodes.INVALID_TOKEN
            );
        }
    };
}

export default createAuthMiddleware;
