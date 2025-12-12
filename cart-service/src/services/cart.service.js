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

    /**
     * Add an item to the user's cart
     * @param {string} userId - User ID
     * @param {string} productId - Product ID to add
     * @param {number} [qty=1] - Quantity to add; defaults to 1
     * @returns {Promise<Object>} Updated cart document
     */
    async addItemToCart(userId, productId, qty) {
        const cart = await CartDAO.findCartByUserId(userId);

        const existingItemIndex = cart.items.findIndex(
            (item) => item?.productId?.toString() === productId
        );

        return await CartDAO.addItemToCart(cart, existingItemIndex, productId, qty || 1);
    }
}

export default new CartService();
