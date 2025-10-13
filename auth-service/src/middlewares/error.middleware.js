import { StatusCodes } from "http-status-codes";
import responseMessages from "../constants/responseMessages.js";

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
    const statusCode = err?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;

    return res.status(statusCode).json({
        success: false,
        statusCode,
        errorCode: err?.errorCode ?? "UNKNOWN",
        isOperational: err?.isOperational ?? false,
        message: err?.message ?? responseMessages.SOMETHING_WENT_WRONG,
    });
}
