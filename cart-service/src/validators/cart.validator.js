import { body, param } from "express-validator";
import { isValidObjectId } from "mongoose";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";

/**
 * Add Item To Cart Validator
 * @description Validates request body for adding an item to the cart.
 * - Ensures `productId` is a valid MongoDB ObjectId
 * - Optional `qty` must be a positive integer (defaults to 1)
 * - Responds with formatted validation errors when invalid
 */
export const addItemToCartValidator = [
    body("productId").custom(isValidObjectId).withMessage("Invalid product ID"),
    body("qty")
        .optional()
        .isInt({ gt: 0 })
        .withMessage("Quantity must be a positive integer")
        .default(1),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];

/**
 * Update Item Quantity Validator
 * @description Validates request parameters and body for updating an item quantity in the cart.
 * - Ensures `productId` (from URL parameter) is a valid MongoDB ObjectId
 * - Ensures `qty` is provided in the request body and is a positive integer (0 or greater)
 * - Responds with formatted validation errors when invalid
 */
export const updateItemQuantityValidator = [
    param("productId").custom(isValidObjectId).withMessage("Invalid product ID"),
    body("qty")
        .notEmpty()
        .withMessage("Item quantity is required")
        .isInt({ gt: -1 })
        .withMessage("Quantity must be a positive integer"),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];
