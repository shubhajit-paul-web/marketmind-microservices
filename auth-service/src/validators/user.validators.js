import { body } from "express-validator";
import cleanString from "../utils/cleanString.js";
import { ADDRESS_TYPES, COUNTRIES, NAME_REGEX, USER_ROLE_TYPES } from "../constants/constants.js";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";
import capitalize from "../utils/capitalize.js";

// Add user address validator
export const addUserAddressValidator = [
    body("street")
        .notEmpty()
        .withMessage("Street required")
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 100 })
        .withMessage("Street 2-100 chars"),
    body("city")
        .notEmpty()
        .withMessage("City required")
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 50 })
        .withMessage("City 2-50 chars"),
    body("state")
        .notEmpty()
        .withMessage("State required")
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 50 })
        .withMessage("State 2-50 chars"),
    body("zip")
        .notEmpty()
        .withMessage("ZIP required")
        .bail()
        .isString()
        .trim()
        .isLength({ min: 7, max: 7 })
        .withMessage("ZIP must be 7 chars"),
    body("country")
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(COUNTRIES)
        .withMessage("Invalid country"),
    body("landmark")
        .optional()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 100 })
        .withMessage("Landmark 2-100 chars"),
    body("typeOfAddress")
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(ADDRESS_TYPES)
        .withMessage("Type must be home or work"),
    body("isDefault").optional().isBoolean().withMessage("isDefault must be boolean"),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];

// Update user address validator
export const updateUserAddressValidator = [
    body("street")
        .optional()
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 100 })
        .withMessage("Street 2-100 chars"),
    body("city")
        .optional()
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 50 })
        .withMessage("City 2-50 chars"),
    body("state")
        .optional()
        .bail()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 50 })
        .withMessage("State 2-50 chars"),
    body("zip")
        .optional()
        .bail()
        .isString()
        .trim()
        .isLength({ min: 7, max: 7 })
        .withMessage("ZIP must be 7 chars"),
    body("country")
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(COUNTRIES)
        .withMessage("Invalid country"),
    body("landmark")
        .optional()
        .isString()
        .trim()
        .customSanitizer(cleanString)
        .isLength({ min: 2, max: 100 })
        .withMessage("Landmark 2-100 chars"),
    body("typeOfAddress")
        .optional()
        .isString()
        .trim()
        .toLowerCase()
        .isIn(ADDRESS_TYPES)
        .withMessage("Type must be home or work"),
    body("isDefault").optional().isBoolean().withMessage("isDefault must be boolean"),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];

// Update user profile validator
export const updateUserProfileValidator = [
    body("email").optional().trim().isEmail().withMessage("Please provide a valid email id"),
    body("phoneNumber")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).replace(/[\s\-().]/g, ""))
        .custom((value) => /^\+?[1-9]\d{6,14}$/.test(value))
        .withMessage("Phone number format is invalid (example: +191555526731)"),
    body("firstName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 30 })
        .withMessage("First name must be 2-30 characters")
        .matches(NAME_REGEX)
        .withMessage("First name must contain only letters")
        .customSanitizer(capitalize),
    body("lastName")
        .optional()
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

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];
