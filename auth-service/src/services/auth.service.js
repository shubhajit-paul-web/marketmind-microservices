import { StatusCodes } from "http-status-codes";
import UserDAO from "../dao/user.dao.js";
import ApiError from "../utils/ApiError.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";
import { uploadFile } from "./storage.service.js";
import redis from "../db/redis.js";

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
                responseMessages.USER_ALREADY_EXISTS,
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
     * Authenticates a user with identifier and password
     * @param {string} identifier - Username, email, or phone number
     * @param {string} password - User's password
     * @returns {Promise<Object>} Authenticated user object
     */
    async loginUser(identifier, password) {
        const user = await UserDAO.findUserByIdentifier(identifier, "+password");

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.USER_NOT_FOUND,
                errorCodes.USER_NOT_FOUND
            );
        }

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                responseMessages.INVALID_CREDENTIALS,
                errorCodes.INVALID_CREDENTIALS
            );
        }

        return user;
    }

    /**
     * Logs out a user by removing their refresh token
     * @param {string} id - User ID whose refresh token should be removed
     * @returns {Promise<Object|null>} Updated user document or null if not found
     */
    async logoutUser(id, accessToken) {
        if (accessToken) {
            await redis.set(`blacklist:${accessToken}`, "true", "EX", 60 * 60);
        }

        return await UserDAO.removeRefreshToken(id);
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
