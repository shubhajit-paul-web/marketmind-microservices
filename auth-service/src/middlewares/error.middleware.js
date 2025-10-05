import responseMessage from "../constants/responseMessage.js";

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
    const statusCode = err?.statusCode ?? 500;

    return res.status(statusCode).json({
        success: false,
        statusCode,
        errorCode: err?.errorCode ?? "UNKNOWN",
        isOperational: err?.isOperational ?? false,
        message: err?.message ?? responseMessage.SOMETHING_WENT_WRONG,
    });
}
