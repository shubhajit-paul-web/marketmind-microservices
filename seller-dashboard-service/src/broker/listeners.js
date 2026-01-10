import broker from "./broker.js";
import logger from "../loggers/winston.logger.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";

function setListeners() {
    // Orders Service listeners
    broker.subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", async (data) => {
        try {
            await Order.create(data);
        } catch (error) {
            logger.error("ERROR: Order document creation failed", { meta: error });
        }
    });

    broker.subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CANCELLED", async (data) => {
        try {
            await Order.findByIdAndUpdate(data._id, data.status);
        } catch (error) {
            logger.error("ERROR: Order cancellation failed", { meta: error });
        }
    });

    broker.subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_STATUS_UPDATED", async (data) => {
        try {
            await Order.findByIdAndUpdate(data._id, data.status);
        } catch (error) {
            logger.error("ERROR: Order status updates failed", { meta: error });
        }
    });

    // Product Service listeners
    broker.subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", async (data) => {
        try {
            await Product.create(data);
        } catch (error) {
            logger.error("ERROR: Product document creation failed", { meta: error });
        }
    });

    broker.subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_UPDATED", async (data) => {
        try {
            await Product.findByIdAndUpdate(data._id, data);
        } catch (error) {
            logger.error("ERROR: Product updates failed", { meta: error });
        }
    });

    broker.subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_DELETED", async (data) => {
        try {
            await Product.findByIdAndDelete(data._id);
        } catch (error) {
            logger.error("ERROR: Product deletion failed", { meta: error });
        }
    });

    broker.subscribeToQueue("PRODUCT_SELLER_DASHBOARD.DECREASE_STOCKS", async (data) => {
        try {
            await Product.findByIdAndUpdate(data._id, { stock: data.stock });
        } catch (error) {
            logger.error("ERROR: Product stock updates failed", { meta: error });
        }
    });

    // Payment Service listeners
    broker.subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_INITIATED", async (data) => {
        try {
            await Payment.create(data);
        } catch (error) {
            logger.error("ERROR: Payment document creation failed", { meta: error });
        }
    });

    broker.subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_SUCCESSFUL", async (data) => {
        try {
            await Payment.findByIdAndUpdate(data._id, data);
        } catch (error) {
            logger.error("ERROR: Payment document updates failed", { meta: error });
        }
    });
}

export default setListeners;
