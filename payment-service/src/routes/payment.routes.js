import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import { orderIdValidator, verifyPaymentValidator } from "../validators/payment.validator.js";
import PaymentController from "../controllers/payment.controller.js";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// (Private) POST /api/v1/payments/create/:orderId
router.post(
    "/create/:orderId",
    rateLimiter.createLimiter(2, 10, "Initiate payment"),
    createAuthMiddleware(["user"]),
    orderIdValidator,
    PaymentController.createPayment
);

// (Private) POST /api/v1/payments/verify
router.post(
    "/verify",
    rateLimiter.createLimiter(1, 5, "Verify payment"),
    createAuthMiddleware(["user"]),
    verifyPaymentValidator,
    PaymentController.verifyPayment
);

// (Private) GET /api/v1/payments/:paymentId
router.get("/:paymentId", createAuthMiddleware(["user"]), PaymentController.getPaymentInfo);

export default router;
