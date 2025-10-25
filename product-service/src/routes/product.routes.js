import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { createProductValidator, updateProductValidator } from "../validators/product.validator.js";
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

// PATCH /api/v1/products/:productId
router.patch(
    "/:productId",
    createAuthMiddleware(["seller"]),
    updateProductValidator,
    ProductController.updateProduct
);

export default router;
