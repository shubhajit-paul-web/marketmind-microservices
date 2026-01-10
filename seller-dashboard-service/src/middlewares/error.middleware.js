/* eslint-disable no-unused-vars */
import { StatusCodes } from "http-status-codes";
import logger from "../loggers/winston.logger.js";

async function errorHandler(err, req, res, next) {
    const statusCode = err?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;

    // Log unexpected/non-operational errors for visibility; operational ones are expected flows
    if (!err?.isOperational) logger.error(err);

    const message = err?.isOperational && err?.message;

    return res.status(statusCode).json({
        success: false,
        statusCode,
        errorCode: err?.errorCode ?? "UNKNOWN",
        isOperational: err?.isOperational ?? false,
        message: message || "Something went wrong",
    });
}

export default errorHandler;
