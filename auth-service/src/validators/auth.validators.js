import { body } from "express-validator";
import { COUNTRIES, NAME_REGEX, ADDRESS_TYPES, USER_ROLE_TYPES } from "../constants/constants.js";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";
import cleanString from "../utils/cleanString.js";
import capitalize from "../utils/capitalize.js";

// Validation: Register user validator
export const registerUserValidator = [
    body("username")
        .notEmpty()
        .withMessage("Username is required")
        .isString()
        .trim()
        .isLength({ min: 5, max: 20 })
        .withMessage("Username must be 5-20 characters")
        .toLowerCase()
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username can only contain letters, numbers, and underscores"),
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .trim()
        .isEmail()
        .withMessage("Please provide a valid email id"),
    body("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .trim()
        .customSanitizer((value) => String(value).replace(/[\s\-().]/g, ""))
        .custom((value) => /^\+?[1-9]\d{6,14}$/.test(value))
        .withMessage("Phone number format is invalid (example: +191555526731)"),
    body("firstName")
        .notEmpty()
        .withMessage("First name is required")
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage("First name must be 2-30 characters")
        .matches(NAME_REGEX)
        .withMessage("First name must contain only letters")
        .customSanitizer(capitalize),
    body("lastName")
        .notEmpty()
        .withMessage("Last name is required")
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage("Last name must be 2-30 characters")
        .matches(NAME_REGEX)
        .withMessage("Last name must contain only letters")
        .customSanitizer(capitalize),
    body("role")
        .optional()
        .trim()
        .isLowercase()
        .isIn(USER_ROLE_TYPES)
        .withMessage("Role must be user or seller (by default user)"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .trim()
        .isStrongPassword({ minSymbols: 0 })
        .withMessage(
            "Weak password: must be at least 8 chars, include uppercase, lowercase & number"
        ),

    // Optional single address object
    body("address").optional().isObject().withMessage("Address must be an object"),

    // If single address is present, validate its fields
    body("address.street")
        .if(body("address").exists())
        .notEmpty()
        .withMessage("Street required")
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 100 })
        .withMessage("Street 2-100 chars"),
    body("address.city")
        .if(body("address").exists())
        .notEmpty()
        .withMessage("City required")
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 50 })
        .withMessage("City 2-50 chars"),
    body("address.state")
        .if(body("address").exists())
        .notEmpty()
        .withMessage("State required")
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 50 })
        .withMessage("State 2-50 chars"),
    body("address.zip")
        .if(body("address").exists())
        .notEmpty()
        .withMessage("ZIP required")
        .bail()
        .isString()
        .trim()
        .isLength({ min: 7, max: 7 })
        .withMessage("ZIP must be 7 chars"),
    body("address.country")
        .if(body("address").exists())
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(COUNTRIES)
        .withMessage("Invalid country"),
    body("address.landmark")
        .if(body("address").exists())
        .optional()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 100 })
        .withMessage("Landmark 2-100 chars"),
    body("address.typeOfAddress")
        .if(body("address").exists())
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(ADDRESS_TYPES)
        .withMessage("Type must be home or work"),
    body("address.isDefault")
        .if(body("address").exists())
        .optional()
        .isBoolean()
        .withMessage("isDefault must be boolean")
        .toBoolean(),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];
