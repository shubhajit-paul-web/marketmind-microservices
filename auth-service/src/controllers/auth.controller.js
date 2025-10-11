import { StatusCodes } from "http-status-codes";
import AuthService from "../services/auth.service.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import responseMessage from "../constants/responseMessage.js";

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

        const accessToken = await createdUser.generateAccessToken();
        const refreshToken = await createdUser.generateRefreshToken();

        res.cookie("accessToken", accessToken);
        res.cookie("refreshToken", refreshToken);

        return res
            .status(StatusCodes.CREATED)
            .json(ApiResponse.created(responseMessage.REGISTERED_SUCCESS, createdUser));
    });
}

export default new AuthController();
