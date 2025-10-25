import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import errorCodes from "../constants/errorCodes.js";
import responseMessages from "../constants/responseMessages.js";

/**
 * Validates incoming request data using express-validator results.
 *
 * If validation errors exist, responds with a 400 status and a formatted error object.
 * Otherwise, continues to the next middleware.
 */
async function respondWithValidationErrors(req, res, next) {
    const errors = validationResult(req);

    // Check if there are any validation errors from express-validator
    if (!errors.isEmpty()) {
        // Format errors into a clean response structure
        const customizedErrors = errors.array().map((err) => ({
            path: err.path,
            message: err.msg,
        }));

        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            errorCode: errorCodes.VALIDATION_ERROR,
            isOperational: true,
            message: responseMessages.VALIDATION_ERROR,
            errors: customizedErrors,
        });
    }

    // No validation errors, continue
    next();
}

export default respondWithValidationErrors;
