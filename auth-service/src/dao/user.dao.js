import User from "../models/user.model.js";

/**
 * Data Access Object for User operations.
 * @description Handles all database interactions for user-related data.
 */
class UserDAO {
    /**
     * Creates a new user in the database
     * @param {Object} userData - User information to store
     * @returns {Promise<Object>} Created user document
     */
    async createUser(userData) {
        return await User.create(userData);
    }

    /**
     * Checks if a user exists by username or email
     * @param {string} username - Username to check
     * @param {string} email - Email to check
     * @param {string} phoneNumber - Phone number to check
     * @returns {Promise<Object|null>} Object with "_id" if user exists, null otherwise
     */
    async isUserExists(username, email, phoneNumber) {
        return await User.exists({
            $or: [{ username }, { email }, { phoneNumber }],
        });
    }

    /**
     * Finds a user by their ID
     * @param {string} id - User ID to search for
     * @returns {Promise<Object|null>} User document or null if not found
     */
    async findUserById(id) {
        return await User.findById(id);
    }

    /**
     * Finds a user by username, email, or phone number
     * @param {string} identifier - Username, email, or phone number to search for
     * @param {string} select - Fields to include or exclude in the result (optional)
     * @returns {Promise<Object|null>} User document or null if not found
     */
    async findUserByIdentifier(identifier, select = "") {
        return await User.findOne({
            $or: [{ username: identifier }, { email: identifier }, { phoneNumber: identifier }],
        }).select(select);
    }

    /**
     * Removes the refresh token from a user's document
     * @param {string} id - User ID whose refresh token should be removed
     * @returns {Promise<Object|null>} Updated user document or null if not found
     */
    async removeRefreshToken(id) {
        return await User.findByIdAndUpdate(
            id,
            {
                $unset: { refreshToken: 0 },
            },
            { new: true, runValidators: false }
        );
    }

    /**
     * Adds a new address to a user's addresses array
     * @param {string} id - User ID to add the address to
     * @param {Object} newAddress - Address object to be added to the user's addresses
     * @returns {Promise<Object|null>} Updated user document with the new address or null if not found
     */
    async addAddressToUser(id, newAddress) {
        return await User.findByIdAndUpdate(
            id,
            {
                $push: {
                    addresses: newAddress,
                },
            },
            { new: true, runValidators: true }
        );
    }

    /**
     * Deletes a specific address from a user's address list
     * @param {string} userId - The ID of the user whose address is to be deleted
     * @param {string} addressId - The ID of the address to be removed from the user's address list
     * @returns {Promise<Object|null>} Updated user document after address deletion, or null if user not found
     */
    async deleteUserAddress(userId, addressId) {
        return await User.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    addresses: { _id: addressId },
                },
            },
            { new: true }
        );
    }

    /**
     * Updates a specific address in the user's address list
     * @param {string} userId - The ID of the user whose address is to be updated
     * @param {string} addressId - The ID of the address to be updated
     * @param {Object} addressDataToUpdate - The new data to update the address with
     * @returns {Promise<Object>} The updated user document after the address is modified
     */
    async updateUserAddress(userId, addressId, addressDataToUpdate) {
        const user = await User.findById(userId);
        const address = user?.addresses?.id(addressId);

        Object.assign(address, addressDataToUpdate);

        return await user.save();
    }

    /**
     * Finds a user by their ID and updates their profile
     * @param {string} userId - The ID of the user to update
     * @param {object} profileDataToUpdate - An object containing the fields to update
     * @returns {Promise<object | null>} A promise that resolves to the updated user document, or null if not found
     */
    async updateUserProfile(userId, profileDataToUpdate) {
        return await User.findByIdAndUpdate(
            userId,
            {
                $set: profileDataToUpdate,
            },
            { new: true, runValidators: true }
        );
    }
}

export default new UserDAO();
