import broker from "./broker.js";
import logger from "../loggers/winston.logger.js";
import Order from "../models/order.model.js";

function setListeners() {
    // Order Service
    broker.subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", async (data) => {
        try {
            await Order.create(data);
        } catch (error) {
            logger.error("ERROR: Order document creation faild", { meta: error });
        }
    });

    broker.subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CANCELLED", async (data) => {
        try {
            await Order.findByIdAndUpdate(data._id, data.status);
        } catch (error) {
            logger.error("ERROR: Order cancellation faild", { meta: error });
        }
    });

    broker.subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_STATUS_UPDATED", async (data) => {
        try {
            await Order.findByIdAndUpdate(data._id, data.status);
        } catch (error) {
            logger.error("ERROR: Order status update faild", { meta: error });
        }
    });

    // Product Service
}

export default setListeners;
