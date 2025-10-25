import { body } from "express-validator";
import cleanString from "../utils/cleanString.js";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";

/**
 * Create product validator
 * @description Validates product creation request body
 */
export const createProductValidator = [
    body("name")
        .exists({ checkFalsy: true })
        .withMessage("Product name is required")
        .bail()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 10, max: 250 })
        .withMessage("Product name must be between 10-250 characters")
        .matches(/^[a-zA-Z0-9\s\-.,&()]+$/)
        .withMessage("Product name contains invalid characters"),

    body("description")
        .optional({ nullable: true, checkFalsy: false })
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 0, max: 1500 })
        .withMessage("Product description must not exceed 1500 characters"),

    body("category")
        .exists({ checkFalsy: true })
        .withMessage("Product category is required")
        .bail()
        .trim()
        .customSanitizer(cleanString)
        .toLowerCase()
        .isLength({ min: 2, max: 50 })
        .withMessage("Category must be between 2-50 characters")
        .matches(/^[a-z0-9\s-]+$/)
        .withMessage("Category contains invalid characters"),

    body("stock")
        .optional({ nullable: true })
        .isInt({ min: 0, max: 1000000 })
        .withMessage("Stock must be a non-negative integer between 0 and 1,000,000")
        .toInt(),

    body("priceAmount")
        .exists({ checkFalsy: true })
        .withMessage("Price amount is required")
        .bail()
        .isFloat({ min: 0.01, max: 10000000 })
        .withMessage("Price amount must be a positive number between 0.01 and 10,000,000")
        .toFloat(),

    body("discountPrice")
        .optional({ nullable: true, checkFalsy: false })
        .isFloat({ min: 0.01 })
        .withMessage("Discount price must be a positive number greater than 0")
        .toFloat()
        .custom((discountPrice, { req }) => {
            const amount = req.body?.priceAmount;
            if (discountPrice && amount) {
                if (discountPrice >= amount) {
                    throw new Error("Discount price must be less than the original price");
                }
                // Check if discount is reasonable (at least 1% off)
                const discountPercentage = ((amount - discountPrice) / amount) * 100;
                if (discountPercentage < 1) {
                    throw new Error("Discount must be at least 1% of the original price");
                }
            }
            return true;
        }),

    body("priceCurrency")
        .optional({ nullable: true })
        .trim()
        .toUpperCase()
        .isIn(["INR", "USD"])
        .withMessage("Currency must be either INR or USD")
        .default("INR"),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];
