import { body } from "express-validator";
import { NAME_REGEX, USER_ROLE_TYPES } from "../constants/constants.js";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";
import capitalize from "../utils/capitalize.js";

// Register user validator
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

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];

// Login user validator
export const loginUserValidator = [
    body("identifier").notEmpty().withMessage("Identifier is required").isString(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isStrongPassword({ minSymbols: 0 })
        .withMessage(
            "Weak password: must be at least 8 chars, include uppercase, lowercase & number"
        ),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];

// Change password validator
export const changePasswordValidator = [
    body("oldPassword").notEmpty().withMessage("Old password is required").trim(),
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .trim()
        .isStrongPassword({ minSymbols: 0 })
        .withMessage(
            "Weak password: must be at least 8 chars, include uppercase, lowercase & number"
        ),

    // Middleware to handle validation errors and send formatted response
    respondWithValidationErrors,
];
