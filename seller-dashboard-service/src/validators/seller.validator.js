import { query } from "express-validator";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";

export const getAllOrdersValidator = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .toInt()
        .default(1),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100")
        .toInt()
        .default(10),
    query("sortBy")
        .optional()
        .isString()
        .trim()
        .isIn(["createdAt", "updatedAt", "status"])
        .withMessage("sortBy must be one of: createdAt, updatedAt or status")
        .default("createdAt"),
    query("sortType")
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(["asc", "desc"])
        .withMessage("sortType must be either asc or desc")
        .default("desc"),
    query("status")
        .optional()
        .isString()
        .trim()
        .toUpperCase()
        .isIn(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
        .withMessage(
            "Order status must be one of: pending, confirmed, shipped, delivered or cancelled"
        ),

    respondWithValidationErrors,
];
