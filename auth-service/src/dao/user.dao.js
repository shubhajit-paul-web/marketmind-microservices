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
     * @returns {Promise<Object|null>} Object with "_id" if user exists, null otherwise
     */
    async isUserExists(username, email) {
        return await User.exists({
            $or: [{ username }, { email }],
        });
    }
}

export default new UserDAO();
