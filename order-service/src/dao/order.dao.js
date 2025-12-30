import Order from "../models/order.model.js";

class OrderDAO {
    async createOrder(orderData) {
        return await Order.create(orderData);
    }

    async getAllOrders(userId, skip = 1, limit = 10, sortBy = "", sortType = "") {
        return Order.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
            .lean();
    }

    async countOrders(filter = {}) {
        return await Order.countDocuments(filter);
    }

    async getOrderById(orderId) {
        return Order.findById(orderId).lean();
    }

    async updateOrderStatusById(orderId, status) {
        return Order.findOneAndUpdate({ _id: orderId }, { status }, { new: true }).lean();
    }

    async updateOrderAddress(orderId, newAddress) {
        return await Order.findOneAndUpdate(
            { _id: orderId },
            { shippingAddress: newAddress },
            { new: true }
        ).lean();
    }
}

export default new OrderDAO();
