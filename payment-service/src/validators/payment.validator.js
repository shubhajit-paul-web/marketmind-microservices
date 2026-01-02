import { param } from "express-validator";
import { isValidObjectId } from "mongoose";
import respondWithValidationErrors from "../middlewares/validator.middleware.js";

export const orderIdValidator = [
    param("orderId").custom(isValidObjectId).withMessage("Invalid order id"),

    respondWithValidationErrors,
];
