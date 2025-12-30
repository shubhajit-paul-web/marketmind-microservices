import { body, param, query } from "express-validator";
import cleanString from "../utils/cleanString.js";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";
import { isValidObjectId } from "mongoose";
import { MAX_PRODUCTS_LIMIT } from "../constants/constants.js";

// Custom discount price validator - util
const discountPriceValidatorUtil = (discountPrice, { req }) => {
    const amount = req.body?.price?.amount;
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
};

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
        .custom(discountPriceValidatorUtil),

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

/**
 * Update product validator
 * @description Validates product updates request body
 */
export const updateProductValidator = [
    param("productId").custom(isValidObjectId).withMessage("Invalid product ID"),

    body("name")
        .optional({ checkFalsy: true })
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
        .optional({ checkFalsy: true })
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

    body("price.amount")
        .optional({ checkFalsy: true })
        .bail()
        .isFloat({ min: 0.01, max: 10000000 })
        .withMessage("Price amount must be a positive number between 0.01 and 10,000,000")
        .toFloat(),

    body("price.discountPrice")
        .optional({ nullable: true, checkFalsy: false })
        .isFloat({ min: 0.01 })
        .withMessage("Discount price must be a positive number greater than 0")
        .toFloat()
        .custom(discountPriceValidatorUtil),

    body("price.currency")
        .optional({ nullable: true })
        .trim()
        .toUpperCase()
        .isIn(["INR", "USD"])
        .withMessage("Currency must be either INR or USD"),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];

/**
 * Product id validator
 * @description Validates productId param
 */
export const productIdValidator = [
    param("productId").custom(isValidObjectId).withMessage("Invalid product ID"),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];

/**
 * Find Products pagination validator
 * @description Validates pagination query params
 */
export const findProductsPaginationValidator = [
    query("page")
        .optional()
        .toInt()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .default(1),
    query("limit")
        .optional()
        .toInt()
        .isInt({ max: MAX_PRODUCTS_LIMIT })
        .withMessage(`Limit must be a positive integer between 1 and ${MAX_PRODUCTS_LIMIT}`)
        .default(20),
    query("q")
        .optional()
        .isString()
        .withMessage("Search query must be a string")
        .isLength({ min: 2, max: 100 })
        .withMessage("Search query must be 2-100 characters long"),
    query("minPrice")
        .optional()
        .toFloat()
        .isFloat({ min: 0 })
        .withMessage("minPrice must be a positive number"),
    query("maxPrice")
        .optional()
        .toFloat()
        .isFloat({ min: 0 })
        .withMessage("maxPrice must be a positive number")
        .custom((_, { req }) => {
            const min = req.query?.minPrice !== undefined && Number(req.query?.minPrice);
            const max = req.query?.minPrice !== undefined && Number(req.query?.maxPrice);

            if (min !== undefined && max !== undefined && min > max) {
                throw new Error("minPrice must be less than or equal to maxPrice");
            }
            return true;
        }),
    query("sortBy")
        .optional()
        .isIn(["amount", "discountPrice", "createdAt"])
        .withMessage("Invalid sort field"),
    query("sortType")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort type must be asc or desc")
        .default("asc"),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];

/**
 * Decrease product stock quantity validator
 * @description Validates product stock
 */
export const decreaseProductStocksValidator = [
    body("stock")
        .notEmpty()
        .withMessage("Stock is required")
        .isInt({ min: 0, max: 1000000 })
        .withMessage("Stock must be a non-negative integer between 0 and 1,000,000")
        .toInt(),

    respondWithValidationErrors,
];
