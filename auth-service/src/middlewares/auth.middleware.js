import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import UserDAO from "../dao/user.dao.js";

/**
 * Verifies user authentication via access token
 * @description Validates JWT from cookies and attaches user to request
 */
async function authUser(req, res, next) {
    const accessToken = req?.cookies?.accessToken;

    if (!accessToken) {
        throw new ApiError(
            StatusCodes.UNAUTHORIZED,
            responseMessages.MISSING_ACCESS_TOKEN,
            errorCodes.MISSING_TOKEN
        );
    }

    try {
        const decoded = jwt.verify(accessToken, config.JWT.ACCESS_TOKEN_SECRET);

        const user = await UserDAO.findUserById(decoded?._id);

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.USER_NOT_FOUND,
                errorCodes.USER_NOT_FOUND
            );
        }

        req.user = user;
        next();
    } catch (error) {
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
}

export default authUser;
