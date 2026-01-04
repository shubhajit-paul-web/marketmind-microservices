import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import { orderIdValidator, verifyPaymentValidator } from "../validators/payment.validator.js";
import PaymentController from "../controllers/payment.controller.js";

const router = Router();

// (Private) POST /api/v1/payments/create/:orderId
router.post(
    "/create/:orderId",
    createAuthMiddleware(["user"]),
    orderIdValidator,
    PaymentController.createPayment
);

// (Private) POST /api/v1/payments/verify
router.post(
    "/verify",
    createAuthMiddleware(["user"]),
    verifyPaymentValidator,
    PaymentController.verifyPayment
);

// (Private) GET /api/v1/payments/:paymentId
router.get("/:paymentId", createAuthMiddleware(["user"]), PaymentController.getPaymentInfo);

export default router;
