import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import { createOrderValidator } from "../validators/order.validator.js";
import OrderController from "../controllers/order.controller.js";

const router = Router();

// (Private) POST /api/v1/orders
router.post("/", createAuthMiddleware(["user"]), createOrderValidator, OrderController.createOrder);

export default router;
