import UserDAO from "../dao/user.dao.js";

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
}

export default new UserService();
