import CartDAO from "../dao/cart.dao.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import responseMessages from "../constants/responseMessages.js";
import errorCodes from "../constants/errorCodes.js";

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

    /**
     * Update the quantity of an item in the user's cart
     * @param {string} userId - User ID
     * @param {string} productId - Product ID to update
     * @param {number} qty - New quantity for the item
     * @returns {Promise<Object>} Updated cart document
     */
    async updateItemQuantity(userId, productId, qty) {
        const cart = await CartDAO.findCartByUserId(userId);

        const itemIndex = cart?.items?.findIndex(
            (item) => item?.productId?.toString() === productId
        );

        if (itemIndex === -1) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                responseMessages.ITEM_NOT_FOUND,
                errorCodes.ITEM_NOT_FOUND
            );
        }

        return await CartDAO.updateItemQuantity(cart, itemIndex, qty ?? 0);
    }
}

export default new CartService();
