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
        const isUserAlreadyExists = await UserDAO.isUserExists(
            userData.username,
            userData.email,
            userData.phoneNumber
        );

        if (isUserAlreadyExists) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                responseMessage.USER_ALREADY_EXISTS,
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
            fullName: {
                firstName: userData?.firstName,
                lastName: userData?.lastName,
            },
            profilePicture: uploadedProfilePicture?.url,
        });

        return createdUser;
    }

    /**
     * Generates JWT access and refresh tokens for a user
     * @param {string} id - User ID (ObjectId)
     * @returns {Promise<Object>} Object containing accessToken and refreshToken
     */
    async generateAccessAndRefreshToken(id) {
        const user = await UserDAO.findUserById(id);

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                "User not found or invalid user id",
                errorCodes.USER_NOT_FOUND
            );
        }

        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    }
}

export default new AuthService();
