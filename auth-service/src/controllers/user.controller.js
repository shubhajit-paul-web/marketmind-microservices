import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse";
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
}

export default new UserController();
