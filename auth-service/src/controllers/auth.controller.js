import { StatusCodes } from "http-status-codes";
import AuthService from "../services/auth.service.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import responseMessage from "../constants/responseMessage.js";
import { cookieOptions } from "../constants/constants.js";

/**
 * Authentication Controller.
 * @description Handles HTTP requests for user authentication operations
 */
class AuthController {
    /**
     * Register a new user
     * @route POST /api/v1/auth/register
     * @access Public
     */
    register = asyncHandler(async (req, res) => {
        const createdUser = await AuthService.registerUser({
            ...req.body,
            profilePicture: req.file,
        });

        const { accessToken, refreshToken } = await AuthService.generateAccessAndRefreshToken(
            createdUser?._id
        );

        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 1 * 60 * 60 * 1000, // 1h
        });
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1y
        });

        return res
            .status(StatusCodes.CREATED)
            .json(ApiResponse.created(responseMessage.REGISTERED_SUCCESS, createdUser));
    });
}

export default new AuthController();
