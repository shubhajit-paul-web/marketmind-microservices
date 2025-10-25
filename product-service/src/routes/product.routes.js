import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { createProductValidator } from "../validators/product.validator.js";
import ProductController from "../controllers/product.controller.js";

const router = Router();

// POST /api/v1/products
router.post(
    "/",
    createAuthMiddleware(["seller"]),
    upload.array("images", 5),
    createProductValidator,
    ProductController.createProduct
);

export default router;
