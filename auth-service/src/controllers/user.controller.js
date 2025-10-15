import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import responseMessages from "../constants/responseMessages.js";
import UserService from "../services/user.service.js";

/**
 * User Controller.
 * @description Handles HTTP requests for user profile operations
 */
class UserController {
    /**
     * Get current authenticated user profile
     * @route GET /api/v1/users/me
     * @access Private
     */
    getCurrentUserProfile = asyncHandler(async (req, res) => {
        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.PROFILE_FETCHED_SUCCESS, req.user));
    });

    /**
     * Add a new address to user profile
     * @route POST /api/v1/users/me/addresses
     * @access Private
     */
    addUserAddress = asyncHandler(async (req, res) => {
        const updatedUser = await UserService.addUserAddress(req.user?._id, req.body);

        return res
            .status(StatusCodes.CREATED)
            .json(ApiResponse.created(responseMessages.ADDRESS_ADDED_SUCCESS, updatedUser));
    });

    /**
     * Get a specific address from user's address list
     * @route GET /api/v1/users/me/addresses/:id
     * @access Private
     */
    getUserAddress = asyncHandler(async (req, res) => {
        const address = await UserService.getUserAddress(req.user?.addresses, req.params?.id);

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.FETCHED("User address"), address));
    });

    /**
     * Delete a specific address from the user's address list
     * @route DELETE /api/v1/users/me/addresses/:id
     * @access Private
     */
    deleteUserAddress = asyncHandler(async (req, res) => {
        await UserService.deleteUserAddress(req.user?._id, req.params?.id, req.user?.addresses);

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.DELETED("User address")));
    });

    /**
     * Update a specific address in the user's address list
     * @route PATCH /api/v1/users/me/addresses/:id
     * @access Private
     */
    updateUserAddress = asyncHandler(async (req, res) => {
        const updatedAddress = await UserService.updateUserAddress(
            req.user?._id,
            req.params?.id,
            req.user?.addresses,
            req.body
        );

        return res
            .status(StatusCodes.OK)
            .json(ApiResponse.success(responseMessages.UPDATED("User address"), updatedAddress));
    });
}

export default new UserController();
