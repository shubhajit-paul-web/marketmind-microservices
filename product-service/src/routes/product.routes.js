import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import authorizeProductAccess from "../middlewares/authProduct.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
    createProductValidator,
    updateProductValidator,
    productIdValidator,
} from "../validators/product.validator.js";
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
    authorizeProductAccess,
    ProductController.updateProduct
);

// POST /api/v1/products/:productId/images
router.post(
    "/:productId/images",
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    upload.array("images", MAX_PRODUCT_IMAGES),
    ProductController.addProductImages
);

// PATCH /api/v1/products/:productId/images/:imageId
router.patch(
    "/:productId/images/:imageId",
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    upload.single("image"),
    ProductController.updateProductImage
);

// DELETE /api/v1/products/:productId/images/:imageId
router.delete(
    "/:productId/images/:imageId",
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    ProductController.deleteProductImage
);

export default router;
