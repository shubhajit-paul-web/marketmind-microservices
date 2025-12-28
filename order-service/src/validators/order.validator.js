import { body, query } from "express-validator";
import cleanString from "../utils/cleanString.js";
import { COUNTRIES } from "../constants/constants.js";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";

export const createOrderValidator = [
    body("currency")
        .optional()
        .isIn(["INR", "USD"])
        .withMessage("Currency must be either INR or USD")
        .default("INR"),

    body("shippingAddress.street")
        .notEmpty()
        .withMessage("Street required")
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 100 })
        .withMessage("Street 2-100 chars"),
    body("shippingAddress.city")
        .notEmpty()
        .withMessage("City required")
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 50 })
        .withMessage("City 2-50 chars"),
    body("shippingAddress.state")
        .notEmpty()
        .withMessage("State required")
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 50 })
        .withMessage("State 2-50 chars"),
    body("shippingAddress.zip")
        .notEmpty()
        .withMessage("ZIP required")
        .bail()
        .isString()
        .trim()
        .isLength({ min: 5, max: 7 })
        .withMessage("ZIP must be 5-7 chars"),
    body("shippingAddress.country")
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(COUNTRIES)
        .withMessage("Invalid country name"),
    body("shippingAddress.landmark")
        .optional()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 100 })
        .withMessage("Landmark 2-100 chars"),
    body("shippingAddress.typeOfAddress")
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(["home", "work"])
        .withMessage("Type must be home or work"),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];

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
        .isIn(["createdAt", "updatedAt", "totalAmount", "status"])
        .withMessage("sortBy must be one of: createdAt, updatedAt, totalAmount, status")
        .default("createdAt"),
    query("sortType")
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(["asc", "desc"])
        .withMessage("sortType must be either asc or desc")
        .default("desc"),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];
