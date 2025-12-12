import Cart from "../models/cart.model.js";

/**
 * Data Access Object for Cart operations.
 * @description Handles database interactions for user carts.
 */
class CartDAO {
    /**
     * Finds a cart by user ID or creates a new one if not found.
     * @param {string} userId - ID of the user
     * @returns {Promise<Object>} Cart document (existing or newly created)
     */
    async findCartByUserId(userId) {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        return cart;
    }

    /**
     * Adds an item to a user's cart or increases quantity if it already exists.
     *
     * @param {Object} cart - Mongoose `Cart` document to modify and persist
     * @param {number} itemIndex - Index of the existing item in `cart.items`; use `-1` when item is not present
     * @param {string} productId - Identifier of the product to add.
     * @param {number} qty - Quantity to add. Must be a positive integer
     * @returns {Promise<Object>} The saved cart document after mutation
     */
    async addItemToCart(cart, itemIndex, productId, qty) {
        if (itemIndex >= 0) {
            cart.items[itemIndex].quantity += qty;
        } else {
            cart.items.push({ productId, quantity: qty });
        }

        return await cart.save();
    }
}

export default new CartDAO();
