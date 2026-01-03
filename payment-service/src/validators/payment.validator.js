import { body, param } from "express-validator";
import { isValidObjectId } from "mongoose";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";

export const orderIdValidator = [
    param("orderId").custom(isValidObjectId).withMessage("Invalid order id"),

    respondWithValidationErrors,
];

export const verifyPaymentValidator = [
    body("razorpayOrderId")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Razorpay order id is required"),
    body("paymentId").isString().trim().notEmpty().withMessage("Payment id is required"),
    body("signature").isString().trim().notEmpty().withMessage("Signature is required"),

    respondWithValidationErrors,
];
