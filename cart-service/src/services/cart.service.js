import CartDAO from "../dao/cart.dao.js";

/**
 * Cart Service
 * @description Handles business logic for cart-related operations
 */
class CartService {
    /**
     * Get cart by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User's cart object
     */
    async getCart(userId) {
        return await CartDAO.findCartByUserId(userId);
    }
}

export default new CartService();
