import { Router } from "express";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";
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
router.post(
    "/",
    rateLimiter.createLimiter(1, 30, "Create order"),
    createAuthMiddleware(["user"]),
    createOrderValidator,
    OrderController.createOrder
);

// (Private) GET /api/v1/orders
router.get(
    "/",
    rateLimiter.createLimiter(1, 50, "Get all orders"),
    createAuthMiddleware(["user"]),
    getAllOrdersValidator,
    OrderController.getAllOrders
);

// (Private) GET /api/v1/orders/:orderId
router.get(
    "/:orderId",
    rateLimiter.createLimiter(1, 50, "Get order by id"),
    createAuthMiddleware(["user"]),
    orderIdValidator,
    OrderController.getOrderById
);

// (Private) PATCH /api/v1/orders/:orderId/cancel
router.patch(
    "/:orderId/cancel",
    rateLimiter.createLimiter(1, 30, "Cancel order by id"),
    createAuthMiddleware(["user"]),
    orderIdValidator,
    OrderController.cancelOrderById
);

// (Private) PATCH /api/v1/orders/:orderId/address
router.patch(
    "/:orderId/address",
    rateLimiter.createLimiter(1, 50, "Update order status"),
    createAuthMiddleware(["user"]),
    orderIdValidator,
    updateOrderAddressValidator,
    OrderController.updateOrderAddress
);

// (Private) PATCH /api/v1/orders/:orderId/status
router.patch(
    "/:orderId/status",
    rateLimiter.createLimiter(1, 100, "Update order status"),
    createAuthMiddleware(["order_manager", "seller"]),
    orderIdValidator,
    updateOrderStatusValidator,
    OrderController.updateOrderStatus
);

export default router;
