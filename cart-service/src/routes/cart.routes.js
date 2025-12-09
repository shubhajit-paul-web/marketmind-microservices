import { Router } from "express";
import createAuthMiddleware from "../middlewares/auth.middleware.js";
import CartController from "../controllers/cart.controller.js";

const router = Router();

// (Private) GET /api/v1/cart
router.get("/", createAuthMiddleware(["user"]), CartController.getCart);

export default router;
