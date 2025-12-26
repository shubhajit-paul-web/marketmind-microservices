import Order from "../models/order.model.js";

class OrderDAO {
    async createOrder(orderData) {
        return await Order.create(orderData);
    }
}

export default new OrderDAO();
