import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { createProductValidator, updateProductValidator } from "../validators/product.validator.js";
import ProductController from "../controllers/product.controller.js";
import { MAX_PRODUCT_IMAGES } from "../constants/constants.js";

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

// POST /api/v1/products/:productId/images
router.post(
    "/:productId/images",
    createAuthMiddleware(["seller"]),
    upload.array("images", MAX_PRODUCT_IMAGES),
    ProductController.addProductImages
);

export default router;
