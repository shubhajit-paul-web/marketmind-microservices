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

    /**
     * Deletes a specific address from the user's address list
     * @param {string} userId - The ID of the user whose address is to be deleted
     * @param {string} addressId - The ID of the address to be deleted
     * @param {Array<Object>} addresses - The array of addresses associated with the user
     * @returns {Promise<Object>} The result of the address deletion operation
     */
    async deleteUserAddress(userId, addressId, addresses) {
        const hasAddress = addresses?.find((address) => address?._id?.toString() === addressId);

        if (!hasAddress) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.NOT_FOUND("Address"),
                errorCodes.ADDRESS_NOT_FOUND
            );
        }

        return await UserDAO.deleteUserAddress(userId, addressId);
    }
}

export default new UserService();
