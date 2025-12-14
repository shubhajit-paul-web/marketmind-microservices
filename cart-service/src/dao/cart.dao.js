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
        qty = Math.abs(qty);

        if (itemIndex >= 0) {
            cart.items[itemIndex].quantity += qty;
        } else {
            cart.items.push({ productId, quantity: qty });
        }

        return await cart.save();
    }

    /**
     * Sets the quantity for an existing cart item without triggering validators.
     * @param {Object} cart - Cart document to update
     * @param {number} itemIndex - Index of the item in `cart.items`
     * @param {number} qty - New quantity to assign
     * @returns {Promise<Object>} Cart document after save
     */
    async updateItemQuantity(cart, itemIndex, qty) {
        cart.items[itemIndex].quantity = qty;
        return await cart.save({ validateBeforeSave: false });
    }
}

export default new CartDAO();
