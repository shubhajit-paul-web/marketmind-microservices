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
    async addUserAddress(id, newAddress, addresses) {
        // Validate if the user has reached the maximum address limit of 5
        if (addresses.length === 5) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.ADDRESS_LIMIT_REACHED,
                errorCodes.ADDRESS_LIMIT_REACHED
            );
        }

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

    /**
     * Updates a specific address in the user's address list
     * @param {string} userId - The ID of the user whose address is to be updated
     * @param {string} addressId - The ID of the address to be updated
     * @param {Array<Object>} addresses - The array of addresses associated with the user
     * @param {Object} addressDataToUpdate - The new data to update the address with
     * @returns {Promise<Object>} The updated address after the modification
     */
    async updateUserAddress(userId, addressId, addresses, addressDataToUpdate) {
        const addressFields = [
            "street",
            "city",
            "state",
            "zip",
            "country",
            "landmark",
            "typeOfAddress",
            "isDefault",
        ];

        const isEmptyFields = addressFields.some((field) =>
            // eslint-disable-next-line no-prototype-builtins
            addressDataToUpdate?.hasOwnProperty(field)
        );

        if (!isEmptyFields) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                responseMessages.MISSING_REQUIRED_FIELDS,
                errorCodes.MISSING_REQUIRED_FIELDS
            );
        }

        const hasAddress = addresses?.find((address) => address?._id?.toString() === addressId);

        if (!hasAddress) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.NOT_FOUND("Address"),
                errorCodes.ADDRESS_NOT_FOUND
            );
        }

        const updatedUser = await UserDAO.updateUserAddress(userId, addressId, addressDataToUpdate);

        // Returning updated address
        return updatedUser.addresses?.find((address) => address?._id?.toString() === addressId);
    }
}

export default new UserService();
