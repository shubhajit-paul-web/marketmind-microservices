import { body } from "express-validator";
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
