/* eslint-disable no-unused-vars */
import { StatusCodes } from "http-status-codes";

async function errorHandler(err, req, res, next) {
    const statusCode = err?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json({
        success: false,
        statusCode,
        errorCode: err?.errorCode ?? "UNKNOWN",
        isOperational: err?.isOperational ?? false,
        message: err?.message ?? "Something went wrong",
    });
}

export default errorHandler;
