import { StatusCodes } from "http-status-codes";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse";
import responseMessages from "../constants/responseMessages.js";

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
}

export default new UserController();
