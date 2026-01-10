import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import {
    createOrderValidator,
    getAllOrdersValidator,
    orderIdValidator,
    updateOrderAddressValidator,
    updateOrderStatusValidator,
} from "../validators/order.validator.js";
import OrderController from "../controllers/order.controller.js";

const router = Router();

// (Private) POST /api/v1/orders
router.post("/", createAuthMiddleware(["user"]), createOrderValidator, OrderController.createOrder);

// (Private) GET /api/v1/orders
router.get(
    "/",
    createAuthMiddleware(["user"]),
    getAllOrdersValidator,
    OrderController.getAllOrders
);

// (Private) GET /api/v1/orders/:orderId
router.get(
    "/:orderId",
    createAuthMiddleware(["user"]),
    orderIdValidator,
    OrderController.getOrderById
);

// (Private) PATCH /api/v1/orders/:orderId/cancel
router.patch(
    "/:orderId/cancel",
    createAuthMiddleware(["user"]),
    orderIdValidator,
    OrderController.cancelOrderById
);

// (Private) PATCH /api/v1/orders/:orderId/address
router.patch(
    "/:orderId/address",
    createAuthMiddleware(["user"]),
    orderIdValidator,
    updateOrderAddressValidator,
    OrderController.updateOrderAddress
);

// (Private) PATCH /api/v1/orders/:orderId/status
router.patch(
    "/:orderId/status",
    createAuthMiddleware(["order_manager", "seller"]),
    orderIdValidator,
    updateOrderStatusValidator,
    OrderController.updateOrderStatus
);

export default router;
