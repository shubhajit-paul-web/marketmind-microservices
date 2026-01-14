import { Router } from "express";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import authorizeProductAccess from "../middlewares/authProduct.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
    createProductValidator,
    updateProductValidator,
    productIdValidator,
    findProductsPaginationValidator,
    decreaseProductStocksValidator,
} from "../validators/product.validator.js";
import ProductController from "../controllers/product.controller.js";
import { MAX_PRODUCT_IMAGES } from "../constants/constants.js";

const router = Router();

// (Private) POST /api/v1/products
router.post(
    "/",
    rateLimiter.createLimiter(2, 50, "Create product"),
    createAuthMiddleware(["seller"]),
    upload.array("images", 5),
    createProductValidator,
    ProductController.createProduct
);

// (Private) PATCH /api/v1/products/:productId
router.patch(
    "/:productId",
    rateLimiter.createLimiter(2, 50, "Update product"),
    createAuthMiddleware(["seller"]),
    updateProductValidator,
    authorizeProductAccess,
    ProductController.updateProduct
);

// (Private) DELETE /api/v1/products/:productId
router.delete(
    "/:productId",
    rateLimiter.createLimiter(2, 50, "Delete product"),
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    ProductController.deleteProduct
);

// (Private) POST /api/v1/products/:productId/images
router.post(
    "/:productId/images",
    rateLimiter.createLimiter(2, 50, "Add product images"),
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    upload.array("images", MAX_PRODUCT_IMAGES),
    ProductController.addProductImages
);

// (Private) PATCH /api/v1/products/:productId/images/:imageId
router.patch(
    "/:productId/images/:imageId",
    rateLimiter.createLimiter(3, 50, "Update product images"),
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    upload.single("image"),
    ProductController.updateProductImage
);

// (Private) PUT /api/v1/products/:productId/images
router.put(
    "/:productId/images",
    rateLimiter.createLimiter(2, 30, "Replace all product images"),
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    upload.array("images"),
    ProductController.replaceAllProductImages
);

// (Private) DELETE /api/v1/products/:productId/images/:imageId
router.delete(
    "/:productId/images/:imageId",
    rateLimiter.createLimiter(2, 50, "Delete product image"),
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    ProductController.deleteProductImage
);

// (Private) GET /api/v1/products/mine
router.get(
    "/mine",
    rateLimiter.createLimiter(2, 100, "Get your created products"),
    findProductsPaginationValidator,
    createAuthMiddleware(["seller"]),
    ProductController.getOwnProducts
);

// (Private) GET /api/v1/products/:productId/mine
router.get(
    "/:productId/mine",
    rateLimiter.createLimiter(2, 100, "Get your created product"),
    createAuthMiddleware(["seller"]),
    productIdValidator,
    ProductController.getOwnProduct
);

// (Public) GET /api/v1/products
router.get(
    "/",
    rateLimiter.createLimiter(2, 100, "Get products"),
    findProductsPaginationValidator,
    ProductController.getProducts
);

// (Public) GET /api/v1/products/:productId
router.get(
    "/:productId",
    rateLimiter.createLimiter(2, 100, "Get product"),
    productIdValidator,
    ProductController.getProduct
);

// (Private) PATCH /api/v1/products/:productId/stock
router.patch(
    "/:productId/stock",
    createAuthMiddleware(["seller", "order_manager"]),
    productIdValidator,
    decreaseProductStocksValidator,
    ProductController.decreaseProductStocks
);

export default router;
