import { StatusCodes } from "http-status-codes";
import UserDAO from "../dao/user.dao.js";
import ApiError from "../utils/ApiError.js";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";

/**
 * User Service.
 * @description Handles business logic for user-related operations
 */
class UserService {
    /**
     * Add a new address to user's profile
     * @param {string} id - User ID
     * @param {Object} newAddress - Address object to add
     * @returns {Promise<Object>} Updated user object
     */
    async addUserAddress(id, newAddress) {
        return await UserDAO.addAddressToUser(id, newAddress);
    }

    /**
     * Get a specific address from user's address list
     * @param {Array<Object>} addresses - User's addresses array
     * @param {string} addressId - Address ID to retrieve
     * @returns {Promise<Object>} The requested address object
     */
    async getUserAddress(addresses, addressId) {
        const address = addresses?.find((address) => address?._id?.toString() === addressId);

        if (!address) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.NOT_FOUND("Address"),
                errorCodes.ADDRESS_NOT_FOUND
            );
        }

        return address;
    }
}

export default new UserService();
