import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import {
    createOrderValidator,
    getAllOrdersValidator,
    orderIdValidator,
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

export default router;
