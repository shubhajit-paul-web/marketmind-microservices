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
}

export default new OrderDAO();
