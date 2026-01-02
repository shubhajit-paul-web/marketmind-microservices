import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import { orderIdValidator } from "../validators/payment.validator.js";
import PaymentController from "../controllers/payment.controller.js";

const router = Router();

// (Private) POST /api/v1/payments/create/:orderId
router.post(
    "/create/:orderId",
    createAuthMiddleware(["user"]),
    orderIdValidator,
    PaymentController.createPayment
);

// (Private) PATCH /api/v1/payments/verify
router.patch("/verify", createAuthMiddleware(["user"]), PaymentController.verifyPayment);

export default router;
