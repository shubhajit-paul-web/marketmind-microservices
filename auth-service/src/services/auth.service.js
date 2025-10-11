import { StatusCodes } from "http-status-codes";
import UserDAO from "../dao/user.dao.js";
import ApiError from "../utils/ApiError.js";
import responseMessage from "../constants/responseMessage.js";
import errorCodes from "../constants/errorCodes.js";
import { uploadFile } from "./storage.service.js";

/**
 * Authentication Service
 * Handles user authentication and registration operations
 */
class AuthService {
    /**
     * Registers a new user
     * @param {Object} userData - Contains req.body and req.file
     * @returns {Promise<Object>} Created user object
     */
    async registerUser(userData) {
        const isUserAlreadyExists = await UserDAO.isUserExists(userData.username, userData.email);

        if (isUserAlreadyExists) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessage.DUPLICATE_USERNAME_EMAIL,
                errorCodes.USER_ALREADY_EXISTS
            );
        }

        const profilePicture = userData?.profilePicture;

        if (!profilePicture) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Profile picture is required",
                errorCodes.VALIDATION_ERROR
            );
        }

        const uploadedProfilePicture = await uploadFile(profilePicture);

        const createdUser = await UserDAO.createUser({
            ...userData,
            profilePicture: uploadedProfilePicture.url,
        });

        return createdUser;
    }
}

export default new AuthService();
