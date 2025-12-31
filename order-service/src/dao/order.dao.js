import Order from "../models/order.model.js";

/**
 * Data Access Object for Order operations.
 * @description Handles all database interactions for order-related data.
 */
class OrderDAO {
    /**
     * Creates a new order in the database
     * @param {Object} orderData - Order information to store
     * @returns {Promise<Object>} Created order document
     */
    async createOrder(orderData) {
        return await Order.create(orderData);
    }

    /**
     * Retrieves all orders for a specific user with pagination and sorting
     * @param {string} userId - ID of the user whose orders to retrieve
     * @param {number} [skip=1] - Number of documents to skip for pagination
     * @param {number} [limit=10] - Maximum number of orders to return
     * @param {string} [sortBy=""] - Field to sort by
     * @param {string} [sortType=""] - Sort direction ("asc" or "desc")
     * @returns {Promise<Array>} Array of order documents
     */
    async getAllOrders(userId, skip = 1, limit = 10, sortBy = "", sortType = "") {
        return Order.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
            .lean();
    }

    /**
     * Counts the number of orders matching the filter criteria
     * @param {Object} [filter={}] - MongoDB filter object
     * @returns {Promise<number>} Total count of matching orders
     */
    async countOrders(filter = {}) {
        return await Order.countDocuments(filter);
    }

    /**
     * Retrieves a single order by its ID
     * @param {string} orderId - ID of the order to retrieve
     * @returns {Promise<Object|null>} Order document or null if not found
     */
    async getOrderById(orderId) {
        return Order.findById(orderId).lean();
    }

    /**
     * Updates the status of an order
     * @param {string} orderId - ID of the order to update
     * @param {string} status - New status value
     * @returns {Promise<Object|null>} Updated order document or null if not found
     */
    async updateOrderStatusById(orderId, status) {
        return Order.findOneAndUpdate({ _id: orderId }, { status }, { new: true }).lean();
    }

    /**
     * Updates the shipping address of an order
     * @param {string} orderId - ID of the order to update
     * @param {Object} newAddress - New shipping address object
     * @returns {Promise<Object|null>} Updated order document or null if not found
     */
    async updateOrderAddress(orderId, newAddress) {
        return await Order.findOneAndUpdate(
            { _id: orderId },
            { shippingAddress: newAddress },
            { new: true }
        ).lean();
    }
}

export default new OrderDAO();
