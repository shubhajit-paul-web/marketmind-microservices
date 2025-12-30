import { Router } from "express";
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
    createAuthMiddleware(["seller"]),
    upload.array("images", 5),
    createProductValidator,
    ProductController.createProduct
);

// (Private) PATCH /api/v1/products/:productId
router.patch(
    "/:productId",
    createAuthMiddleware(["seller"]),
    updateProductValidator,
    authorizeProductAccess,
    ProductController.updateProduct
);

// (Private) DELETE /api/v1/products/:productId
router.delete(
    "/:productId",
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    ProductController.deleteProduct
);

// (Private) POST /api/v1/products/:productId/images
router.post(
    "/:productId/images",
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    upload.array("images", MAX_PRODUCT_IMAGES),
    ProductController.addProductImages
);

// (Private) PATCH /api/v1/products/:productId/images/:imageId
router.patch(
    "/:productId/images/:imageId",
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    upload.single("image"),
    ProductController.updateProductImage
);

// (Private) PUT /api/v1/products/:productId/images
router.put(
    "/:productId/images",
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    upload.array("images"),
    ProductController.replaceAllProductImages
);

// (Private) DELETE /api/v1/products/:productId/images/:imageId
router.delete(
    "/:productId/images/:imageId",
    createAuthMiddleware(["seller"]),
    productIdValidator,
    authorizeProductAccess,
    ProductController.deleteProductImage
);

// (Private) GET /api/v1/products/mine
router.get(
    "/mine",
    findProductsPaginationValidator,
    createAuthMiddleware(["seller"]),
    ProductController.getOwnProducts
);

// (Private) GET /api/v1/products/:productId/mine
router.get(
    "/:productId/mine",
    createAuthMiddleware(["seller"]),
    productIdValidator,
    ProductController.getOwnProduct
);

// (Public) GET /api/v1/products
router.get("/", findProductsPaginationValidator, ProductController.getProducts);

// (Public) GET /api/v1/products/:productId
router.get("/:productId", productIdValidator, ProductController.getProduct);

// (Private) PATCH /api/v1/products/:productId/stock
router.patch(
    "/:productId/stock",
    createAuthMiddleware(["seller", "order_manager"]),
    productIdValidator,
    decreaseProductStocksValidator,
    ProductController.decreaseProductStocks
);

export default router;
