import { StatusCodes } from "http-status-codes";
import AuthService from "../services/auth.service.js";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import responseMessages from "../constants/responseMessages.js";
import setCookieOptions from "../utils/setCookieOptions.js";
import { ACCESS_TOKEN_COOKIE_EXP, REFRESH_TOKEN_COOKIE_EXP } from "../constants/constants.js";

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

        res.cookie("accessToken", accessToken, setCookieOptions(ACCESS_TOKEN_COOKIE_EXP));
        res.cookie("refreshToken", refreshToken, setCookieOptions(REFRESH_TOKEN_COOKIE_EXP));

        return res
            .status(StatusCodes.CREATED)
            .json(ApiResponse.created(responseMessages.REGISTERED_SUCCESS, createdUser));
    });

    /**
     * Authenticate user
     * @route POST /api/v1/auth/login
     * @access Public
     */
    login = asyncHandler(async (req, res) => {
        const user = await AuthService.loginUser(req.body?.identifier, req.body?.password);

        const { accessToken, refreshToken } = await AuthService.generateAccessAndRefreshToken(
            user?._id
        );

        res.cookie("accessToken", accessToken, setCookieOptions(ACCESS_TOKEN_COOKIE_EXP));
        res.cookie("refreshToken", refreshToken, setCookieOptions(REFRESH_TOKEN_COOKIE_EXP));

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.LOGIN_SUCCESS, user));
    });

    /**
     * Logout user
     * @route POST /api/v1/auth/logout
     * @access Private
     */
    logout = asyncHandler(async (req, res) => {
        await AuthService.logoutUser(req.user?._id, req?.cookies?.accessToken);

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.LOGOUT_SUCCESS));
    });

    /**
     * Changes the password for the currently logged-in user
     * @route PATCH /api/v1/auth/password
     * @access Private
     */
    changePassword = asyncHandler(async (req, res) => {
        await AuthService.changePassword(
            req.user?._id,
            req.body?.oldPassword,
            req.body?.newPassword
        );

        const { accessToken, refreshToken } = await AuthService.generateAccessAndRefreshToken(
            req.user?._id
        );

        res.cookie("accessToken", accessToken, setCookieOptions(ACCESS_TOKEN_COOKIE_EXP));
        res.cookie("refreshToken", refreshToken, setCookieOptions(REFRESH_TOKEN_COOKIE_EXP));

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.UPDATED("Password")));
    });

    /**
     * Refreshes the access token using the refresh token
     * @route GET /api/v1/auth/refresh-token
     * @access Public (Requires refresh token cookie)
     */
    refreshAccessToken = asyncHandler(async (req, res) => {
        const accessToken = await AuthService.refreshAccessToken(req?.cookies?.refreshToken);

        res.cookie("accessToken", accessToken, setCookieOptions(ACCESS_TOKEN_COOKIE_EXP));

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.ACCESS_TOKEN_GENERATED_SUCCESS));
    });
}

export default new AuthController();
