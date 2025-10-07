import { StatusCodes } from "http-status-codes";
import logger from "../loggers/winston.logger.js";

/**
 * Represents a standardized response when a client exceeds the allowed request rate.
 * Used to handle and log "Too Many Requests" (HTTP 429) errors.
 */
export default class RateLimiterResponse {
    /**
     * Creates a rate limiter response instance.
     * @param {Object} request - The incoming HTTP request object.
     * @param {string} [message="Too many requests from this IP, please try again after a minute"] - Custom error message.
     */
    constructor(
        request,
        message = "To many requests from this IP, please try again after a minute"
    ) {
        this.success = false;
        this.statusCode = StatusCodes.TOO_MANY_REQUESTS;
        this.errorCode = "TOO_MANY_REQUESTS";
        this.message = message;

        logger.warn(`Rate limit exceeded for IP: ${request.ip}`);
    }
}
