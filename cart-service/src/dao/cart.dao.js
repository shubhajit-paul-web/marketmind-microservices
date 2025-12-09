import Cart from "../models/cart.model.js";

/**
 * Data Access Object for Cart operations.
 * @description Handles all database interactions for cart-related data.
 */
class CartDAO {
    /**
     * Finds a cart by user ID or creates a new one if not found
     * @param {string} userId - ID of the user
     * @returns {Promise<Object>} Cart document (existing or newly created)
     */
    async findCartByUserId(userId) {
        let cart = await Cart.findOne({ userId }).lean();

        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        return cart;
    }
}

export default new CartDAO();
