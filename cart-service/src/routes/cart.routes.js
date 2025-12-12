import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import CartController from "../controllers/cart.controller.js";
import { addItemToCartValidator } from "../validators/cart.validator.js";

const router = Router();

// (Private) GET /api/v1/cart
router.get("/", createAuthMiddleware(["user"]), CartController.getCart);

// (Private) POST /api/v1/cart/items
router.post(
    "/items",
    addItemToCartValidator,
    createAuthMiddleware(["user"]),
    CartController.addItemToCart
);

export default router;
