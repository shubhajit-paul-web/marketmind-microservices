import logger from "../loggers/winston.logger.js";

/**
 * Custom API Error class for structured error handling.
 * Automatically logs the error when instantiated.
 * @extends Error
 */
class ApiError extends Error {
    /**
     * @param {number} [statusCode=500] - HTTP status code.
     * @param {string} [message="Something went wrong"] - Error message.
     * @param {string} [errorCode="UNKNOWN"] - Custom error identifier.
     * @param {boolean} [isOperational=false] - Marks if the error is expected (handled).
     * @param {object|null} [details=null] - Extra error info (e.g. validation details).
     * @param {string} [stack] - Optional stack trace.
     */
    constructor(
        statusCode = 500,
        message = "Something went wrong",
        errorCode = "UNKNOWN",
        isOperational = true,
        details = null,
        stack
    ) {
        super(message);
        this.success = false;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.message = message;
        this.details = details;

        if (stack) this.stack = stack;
        else Error.captureStackTrace(this, this.constructor);

        // Meta info of the error (log payload)
        const logPayload = { errorCode, statusCode, isOperational, details };

        // Log error when it's created
        if (statusCode >= 500) {
            logger.error(`${errorCode} | ${message}`, {
                meta: {
                    ...logPayload,
                    stack: this.stack,
                },
            });
        } else {
            logger.error(`${errorCode} | ${message}`, {
                meta: logPayload,
            });
        }
    }
}

export default ApiError;
